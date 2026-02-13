/**
 * Auto Debate Scheduler
 *
 * Simple automation for debate execution:
 * 1. Auto-start debates when predictions are created
 * 2. Auto-execute pending debate rounds
 */

import { startDebate, executeDebateRound, getDebateStatus } from './debate-orchestrator'
import { createAdminClient } from '@/lib/supabase/server'
import { getDebateRounds } from '@/lib/db/debates'
import { getPredictionById } from '@/lib/db/predictions'

/**
 * Determine if an agent should run based on its schedule
 */
function shouldAgentRunToday(schedule: string, currentHour: number): boolean {
  switch (schedule) {
    case 'manual':
      return false
    case 'hourly':
      return true
    case 'twice_daily':
      // Run at 9 AM and 9 PM (KST)
      return currentHour === 9 || currentHour === 21
    case 'daily':
      // Run once at 9 AM (KST)
      return currentHour === 9
    case 'weekly':
      // Run on Monday at 9 AM (KST)
      const day = new Date().getDay() // 0 = Sunday, 1 = Monday
      return day === 1 && currentHour === 9
    default:
      return false
  }
}

/**
 * Filter agents that should participate in a debate
 */
async function getEligibleAgents(predictionCategory: string | null, currentHour: number) {
  const supabase = createAdminClient()

  // Get all active agents with debate enabled
  const { data: agents, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
    .eq('debate_enabled', true)

  if (error) {
    console.error('Error fetching eligible agents:', error)
    return []
  }

  if (!agents || agents.length === 0) {
    return []
  }

  // Filter agents based on schedule and category
  const eligible = agents.filter(agent => {
    // Check schedule
    const schedule = agent.debate_schedule || 'daily'
    if (!shouldAgentRunToday(schedule, currentHour)) {
      return false
    }

    // Check category filter
    const categories = agent.debate_categories
    if (categories && categories.length > 0 && predictionCategory) {
      // If agent has category filter, check if prediction matches
      if (!categories.includes(predictionCategory)) {
        return false
      }
    }

    return true
  })

  console.log(`🎯 Found ${eligible.length}/${agents.length} eligible agents for this run`)

  return eligible
}

/**
 * Auto-start debate for a new prediction
 * Call this when a prediction is created
 * Respects agent auto_participate setting
 */
export async function autoStartDebateForPrediction(predictionId: string, forceStart = false) {
  try {
    console.log(`🤖 Auto-starting debate for prediction ${predictionId}`)

    const prediction = await getPredictionById(predictionId)
    if (!prediction) {
      console.error('Prediction not found')
      return { success: false, error: 'Prediction not found' }
    }

    const predictionData = {
      title: prediction.title,
      description: prediction.description,
      category: prediction.category || 'General',
      deadline: prediction.deadline,
    }

    // Check for agents with auto_participate enabled (if not forced)
    if (!forceStart) {
      const supabase = createAdminClient()
      const { data: autoParticipateAgents } = await supabase
        .from('agents')
        .select('id')
        .eq('is_active', true)
        .eq('debate_enabled', true)
        .eq('auto_participate', true)

      if (!autoParticipateAgents || autoParticipateAgents.length < 2) {
        console.log('⏭️ Not enough agents with auto_participate enabled, skipping')
        return { success: false, error: 'Not enough auto-participate agents' }
      }
    }

    // Start debate with default config
    const result = await startDebate(predictionId, predictionData, {
      maxRounds: 5,
      consensusThreshold: 0.7,
      minAgents: 2,
    })

    console.log(`✅ Debate auto-started for prediction ${predictionId}`)

    // Immediately execute first round
    await autoExecutePendingRound(predictionId)

    return { success: true, result }
  } catch (error: any) {
    console.error('Error auto-starting debate:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Auto-execute a pending debate round for a prediction
 */
export async function autoExecutePendingRound(predictionId: string) {
  try {
    console.log(`🔄 Auto-executing round for prediction ${predictionId}`)

    const prediction = await getPredictionById(predictionId)
    if (!prediction) {
      console.error('Prediction not found')
      return { success: false, error: 'Prediction not found' }
    }

    const predictionData = {
      title: prediction.title,
      description: prediction.description,
      category: prediction.category || 'General',
      deadline: prediction.deadline,
    }

    const result = await executeDebateRound(predictionId, predictionData)

    console.log(`✅ Round auto-executed for prediction ${predictionId}`)

    return { ...result }
  } catch (error: any) {
    console.error('Error auto-executing round:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Find and execute all pending debate rounds
 * This should be called by a cron job (e.g., every hour)
 */
export async function executePendingDebateRounds() {
  try {
    console.log('🔍 Checking for pending debate rounds...')

    const supabase = createAdminClient()

    // Find all active debate rounds (not final, no end time)
    const { data: pendingRounds, error } = await supabase
      .from('debate_rounds')
      .select(`
        id,
        prediction_id,
        round_number,
        started_at,
        ended_at,
        is_final
      `)
      .is('ended_at', null)
      .eq('is_final', false)
      .order('started_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending rounds:', error)
      return { success: false, error: error.message }
    }

    if (!pendingRounds || pendingRounds.length === 0) {
      console.log('✓ No pending rounds found')
      return { success: true, processed: 0 }
    }

    console.log(`📋 Found ${pendingRounds.length} pending round(s)`)

    const results = []

    for (const round of pendingRounds) {
      try {
        // Check if this round has been running for at least 5 minutes
        // (avoid executing rounds that just started)
        const startedAt = new Date(round.started_at)
        const now = new Date()
        const minutesElapsed = (now.getTime() - startedAt.getTime()) / (1000 * 60)

        if (minutesElapsed < 5) {
          console.log(`⏳ Round ${round.round_number} for ${round.prediction_id} is too recent (${minutesElapsed.toFixed(1)}m), skipping`)
          continue
        }

        console.log(`🎯 Executing round ${round.round_number} for prediction ${round.prediction_id}`)

        const result = await autoExecutePendingRound(round.prediction_id)
        results.push({
          predictionId: round.prediction_id,
          roundNumber: round.round_number,
          ...result,
        })
      } catch (error: any) {
        console.error(`Error executing round for ${round.prediction_id}:`, error)
        results.push({
          predictionId: round.prediction_id,
          roundNumber: round.round_number,
          success: false,
          error: error.message,
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`✅ Processed ${results.length} rounds (${successCount} successful)`)

    return {
      success: true,
      processed: results.length,
      successful: successCount,
      results,
    }
  } catch (error: any) {
    console.error('Error in executePendingDebateRounds:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Find predictions that need debates but don't have any
 * Auto-start debates for them
 */
export async function autoStartDebatesForNewPredictions() {
  try {
    console.log('🔍 Checking for predictions without debates...')

    const supabase = createAdminClient()

    // Find predictions without any debate rounds
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select(`
        id,
        title,
        created_at
      `)
      .is('resolution_value', null)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching predictions:', error)
      return { success: false, error: error.message }
    }

    if (!predictions || predictions.length === 0) {
      console.log('✓ No predictions found')
      return { success: true, started: 0 }
    }

    const results = []

    for (const prediction of predictions) {
      // Check if this prediction already has debates
      const rounds = await getDebateRounds(prediction.id)

      if (rounds.length === 0) {
        console.log(`🚀 Starting debate for new prediction: ${prediction.title}`)
        const result = await autoStartDebateForPrediction(prediction.id)
        results.push({
          predictionId: prediction.id,
          ...result,
        })
      }
    }

    console.log(`✅ Started ${results.length} new debate(s)`)

    return {
      success: true,
      started: results.length,
      results,
    }
  } catch (error: any) {
    console.error('Error in autoStartDebatesForNewPredictions:', error)
    return { success: false, error: error.message }
  }
}
