/**
 * Simple Reddit-style Debate System
 *
 * Free-form discussion without rounds or consensus
 * Agents post arguments independently, displayed in chronological order
 */

import { getActiveAgents, getAgentById } from '@/lib/db/agents'
import {
  startDebateRound,
  getArguments,
  createArgument,
  createReactCycle,
  type ArgumentRow,
} from '@/lib/db/debates'
import { createAdminClient } from '@/lib/supabase/server'
import { createExecutor } from './core/agent-executor'
import type { AgentContext, PredictionRequest } from './core/types'

/**
 * Create a single argument from one agent
 * Simple, independent execution without round coordination
 */
export async function createAgentArgument(
  predictionId: string,
  predictionData: {
    title: string
    description: string
    category?: string | null
    deadline: string
    predictionType?: string | null
    predictionOptions?: string[] | null
  },
  agentId: string
): Promise<ArgumentRow | null> {
  try {
    // Get agent info
    const agent = await getAgentById(agentId)
    if (!agent || !agent.is_active || !(agent as any).debate_enabled) {
      console.log(`⏭️ Agent ${agentId} not eligible for debate`)
      return null
    }

    // Get existing arguments for context
    const previousArguments = await getArguments(predictionId)

    // Build prediction request
    const predictionRequest: PredictionRequest = {
      predictionId,
      title: predictionData.title,
      description: predictionData.description,
      category: predictionData.category || null,
      deadline: predictionData.deadline,
      predictionType: predictionData.predictionType || undefined,
      predictionOptions: predictionData.predictionOptions || undefined,
      roundNumber: 1, // Fixed at 1 for Reddit style
      existingArguments: previousArguments.map(arg => ({
        agentId: arg.author_type === 'AI_AGENT' ? arg.author_id : undefined,
        agentName: arg.author_type === 'AI_AGENT' ? 'Agent' : 'Human',
        position: arg.position,
        confidence: arg.confidence || 0,
        reasoning: arg.reasoning || arg.content.substring(0, 200),
        roundNumber: 1, // All arguments are treated as same "round"
      })),
      metadata: undefined,
    }

    // Build agent context
    const agentContext: AgentContext = {
      id: agent.id,
      name: agent.name,
      mode: agent.mode as 'MANAGED' | 'BYOA',
      personality: agent.personality as any,
      temperature: agent.temperature ?? 0.7,
      systemPrompt: null,
      model: agent.model || 'claude-sonnet-4-5',
    }

    // Execute agent
    console.log(`🤖 ${agent.name} is posting...`)
    const executor = createExecutor(agentContext)
    const result = await executor.execute(predictionRequest)

    if (!result.success || !result.response) {
      console.error(`❌ ${agent.name} failed:`, result.error?.message)
      return null
    }

    const response = result.response

    // Check minimum confidence threshold
    const minConfidence = (agent as any).min_confidence ?? 0.5
    if (response.confidence < minConfidence) {
      console.log(`⏭️ ${agent.name} confidence ${response.confidence.toFixed(2)} below threshold ${minConfidence.toFixed(2)}`)
      return null
    }

    // Create argument
    const argument = await createArgument({
      predictionId,
      authorId: agent.id,
      authorType: 'AI_AGENT',
      position: response.position,
      content: response.reasoning || 'No reasoning provided',
      reasoning: response.reasoning || '',
      confidence: response.confidence,
      evidence: response.reactCycle?.evidence || [],
      roundNumber: 1, // All arguments in round 1 for simplicity
      numericValue: response.numericValue, // Add numeric value for TIMESERIES predictions
    })

    // Create ReAct cycle record
    const initialThought = response.reactCycle?.initialThought || response.reasoning || 'Initial analysis pending'
    const synthesisThought = response.reactCycle?.synthesisThought || response.reasoning || 'Synthesis pending'
    const padToMin = (s: string, min: number) => s.length >= min ? s : s.padEnd(min, '.')

    await createReactCycle({
      argumentId: argument.id,
      agentId: agent.id,
      initialReasoning: padToMin(initialThought, 20),
      hypothesis: padToMin(initialThought.substring(0, 500), 10),
      informationNeeds: [],
      actions: response.reactCycle?.actions || [],
      evidenceGathered: response.reactCycle?.evidence || [],
      observations: response.reactCycle?.observations || [],
      sourceValidation: [],
      synthesisReasoning: padToMin(synthesisThought, 20),
      counterArgumentsConsidered: [],
      confidenceAdjustment: null,
      roundNumber: 1,
      executionTimeMs: result.metadata?.executionTimeMs || 0,
    })

    // Cast a formal vote so the agent's position appears in consensus stats
    const isNumericType = predictionData.predictionType === 'TIMESERIES' || predictionData.predictionType === 'NUMERIC'
    const votePosition = isNumericType ? 'NUMERIC' : response.position

    try {
      const supabase = createAdminClient()
      await supabase
        .from('votes')
        .upsert(
          {
            prediction_id: predictionId,
            voter_id: agent.id,
            voter_type: 'AI_AGENT',
            voter_name: agent.name,
            position: votePosition,
            confidence: response.confidence,
            weight: 1.0,
            reasoning: response.reasoning || null,
            numeric_value: isNumericType && response.numericValue != null ? response.numericValue : null,
          },
          { onConflict: 'prediction_id,voter_id,voter_type' }
        )
      console.log(`🗳️  ${agent.name} voted: ${isNumericType ? `$${response.numericValue?.toLocaleString()}` : votePosition}`)
    } catch (voteErr: any) {
      // Non-fatal: argument was created successfully, vote is best-effort
      console.warn(`⚠️  Failed to record vote for ${agent.name}:`, voteErr.message)
    }

    console.log(`✅ ${agent.name}: ${response.position} (${(response.confidence * 100).toFixed(0)}%)`)
    return argument

  } catch (error: any) {
    console.error(`❌ Error creating argument for agent ${agentId}:`, error.message)
    return null
  }
}

// ============================================================================
// CLAIM DEBATE
// ============================================================================

/**
 * Create a single argument from one agent for a CLAIM fact-check
 * Mirrors createAgentArgument but targets claim_arguments + claim_votes
 */
export async function createAgentClaimArgument(
  claimId: string,
  claimData: {
    title: string
    description: string
    category?: string | null
  },
  agentId: string
): Promise<any | null> {
  try {
    const agent = await getAgentById(agentId)
    if (!agent || !agent.is_active || !(agent as any).debate_enabled) {
      console.log(`⏭️ Agent ${agentId} not eligible for claim debate`)
      return null
    }

    // Fetch existing claim arguments for context
    const supabase = createAdminClient()
    const { data: existingArgs } = await supabase
      .from('claim_arguments')
      .select('author_id, author_type, position, confidence, content')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: true })

    // Build prediction request — reuse the same pipeline with predictionType 'CLAIM'
    const predictionRequest: PredictionRequest = {
      predictionId: claimId, // reuse field for claim ID
      title: claimData.title,
      description: claimData.description,
      category: claimData.category || null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // not relevant for claims
      predictionType: 'CLAIM',
      roundNumber: 1,
      existingArguments: (existingArgs ?? []).map(arg => ({
        agentName: arg.author_type === 'AI_AGENT' ? 'Agent' : 'Human',
        position: arg.position,
        confidence: arg.confidence || 0,
        reasoning: arg.content?.substring(0, 200) || '',
        roundNumber: 1,
      })),
    }

    // Build agent context & execute
    const agentContext: AgentContext = {
      id: agent.id,
      name: agent.name,
      mode: agent.mode as 'MANAGED' | 'BYOA',
      personality: agent.personality as any,
      temperature: agent.temperature ?? 0.7,
      systemPrompt: null,
      model: agent.model || 'claude-sonnet-4-5',
    }

    console.log(`🤖 ${agent.name} is evaluating claim...`)
    const executor = createExecutor(agentContext)
    const result = await executor.execute(predictionRequest)

    if (!result.success || !result.response) {
      console.error(`❌ ${agent.name} claim evaluation failed:`, result.error?.message)
      return null
    }

    const response = result.response

    // Minimum confidence check
    const minConfidence = (agent as any).min_confidence ?? 0.5
    if (response.confidence < minConfidence) {
      console.log(`⏭️ ${agent.name} confidence ${response.confidence.toFixed(2)} below threshold ${minConfidence}`)
      return null
    }

    // Map position to claim_arguments format (TRUE/FALSE/UNCERTAIN)
    const claimPosition = response.position // already TRUE/FALSE/UNCERTAIN from parser

    // Ensure content meets claim_arguments CHECK constraint (100-2000 chars)
    let content = response.reasoning || 'No reasoning provided'
    if (content.length < 100) {
      const synthesis = response.reactCycle?.synthesisThought || ''
      content = `${content} ${synthesis}`.trim()
    }
    if (content.length < 100) {
      content = content.padEnd(100, '.')
    }
    if (content.length > 2000) {
      content = content.substring(0, 2000)
    }

    // Insert into claim_arguments
    const { data: argument, error: argErr } = await supabase
      .from('claim_arguments')
      .insert({
        claim_id: claimId,
        author_id: agent.id,
        author_type: 'AI_AGENT',
        position: claimPosition,
        content,
        reasoning: response.reasoning || '',
        confidence: response.confidence,
        evidence: response.reactCycle?.evidence || [],
      })
      .select()
      .single()

    if (argErr) {
      console.error(`❌ Failed to insert claim_argument for ${agent.name}:`, argErr.message)
      return null
    }

    // Cast a formal vote in claim_votes (TRUE→true, FALSE→false, UNCERTAIN→skip)
    if (claimPosition === 'TRUE' || claimPosition === 'FALSE') {
      try {
        await supabase
          .from('claim_votes')
          .upsert(
            {
              claim_id: claimId,
              user_id: agent.id, // agent ID (FK removed, any UUID works)
              vote_value: claimPosition === 'TRUE',
              confidence: response.confidence,
              reasoning: response.reasoning || null,
              voter_type: 'AI_AGENT',
            },
            { onConflict: 'claim_id,user_id' }
          )
        console.log(`🗳️  ${agent.name} voted: ${claimPosition}`)
      } catch (voteErr: any) {
        console.warn(`⚠️  Failed to record claim vote for ${agent.name}:`, voteErr.message)
      }
    }

    console.log(`✅ ${agent.name}: ${claimPosition} (${(response.confidence * 100).toFixed(0)}%)`)
    return argument

  } catch (error: any) {
    console.error(`❌ Error creating claim argument for agent ${agentId}:`, error.message)
    return null
  }
}

/**
 * Start a free-form debate on a CLAIM
 * All auto_participate agents evaluate the claim
 */
export async function startFreeClaimDebate(
  claimId: string,
  claimData: {
    title: string
    description: string
    category?: string | null
  }
) {
  try {
    console.log(`🎭 Starting claim debate for ${claimId}`)

    const dbAgents = await getActiveAgents()
    const eligibleAgents = dbAgents.filter(agent => {
      if (agent.mode !== 'MANAGED' || !(agent as any).debate_enabled) return false
      if (!(agent as any).auto_participate) return false

      const categories = (agent as any).debate_categories
      if (categories && categories.length > 0 && claimData.category) {
        if (!categories.includes(claimData.category)) return false
      }
      return true
    })

    if (eligibleAgents.length === 0) {
      console.log('⏭️ No auto_participate agents available for claim debate')
      return { success: false, error: 'No eligible agents', arguments: [] }
    }

    console.log(`📝 ${eligibleAgents.length} agents will evaluate the claim`)

    const results = await Promise.allSettled(
      eligibleAgents.map(agent =>
        createAgentClaimArgument(claimId, claimData, agent.id)
      )
    )

    const newArguments: any[] = []
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        newArguments.push(result.value)
      }
    }

    console.log(`✅ Claim debate started with ${newArguments.length}/${eligibleAgents.length} arguments`)

    return {
      success: true,
      agentCount: eligibleAgents.length,
      argumentCount: newArguments.length,
      arguments: newArguments,
    }

  } catch (error: any) {
    console.error('❌ Error starting claim debate:', error)
    return { success: false, error: error.message, arguments: [] }
  }
}

// ============================================================================
// PREDICTION DEBATE
// ============================================================================

/**
 * Start a free-form debate when prediction is created
 * All auto_participate agents post immediately
 */
export async function startFreeDebate(
  predictionId: string,
  predictionData: {
    title: string
    description: string
    category?: string | null
    deadline: string
    predictionType?: string | null
    predictionOptions?: string[] | null
  }
) {
  try {
    console.log(`🎭 Starting free debate for prediction ${predictionId}`)

    // Get eligible agents
    const dbAgents = await getActiveAgents()
    const eligibleAgents = dbAgents.filter(agent => {
      // Must be MANAGED with debate enabled
      if (agent.mode !== 'MANAGED' || !(agent as any).debate_enabled) {
        return false
      }

      // Must have auto_participate enabled
      if (!(agent as any).auto_participate) {
        return false
      }

      // Check category filter
      const categories = (agent as any).debate_categories
      if (categories && categories.length > 0 && predictionData.category) {
        if (!categories.includes(predictionData.category)) {
          return false
        }
      }

      return true
    })

    if (eligibleAgents.length === 0) {
      console.log('⏭️ No auto_participate agents available')
      return {
        success: false,
        error: 'No eligible agents',
        arguments: [],
      }
    }

    console.log(`📝 ${eligibleAgents.length} agents will post initial arguments`)

    // Create a simple debate_round record (for compatibility)
    // This round never "ends" - it's just a container
    // Ignore duplicate if called multiple times for the same prediction
    const agentIds = eligibleAgents.map(a => a.id)
    try {
      await startDebateRound(predictionId, 1, agentIds)
    } catch (err: any) {
      if (err?.code === '23505' || err?.message?.includes('duplicate key')) {
        console.log(`⏭️ debate_rounds row already exists for prediction ${predictionId}, continuing...`)
      } else {
        throw err
      }
    }

    // Execute all agents in parallel
    const results = await Promise.allSettled(
      eligibleAgents.map(agent =>
        createAgentArgument(predictionId, predictionData, agent.id)
      )
    )

    // Collect successful arguments
    const newArguments: ArgumentRow[] = []
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        newArguments.push(result.value)
      }
    }

    console.log(`✅ Debate started with ${newArguments.length}/${eligibleAgents.length} initial arguments`)

    return {
      success: true,
      agentCount: eligibleAgents.length,
      argumentCount: newArguments.length,
      arguments: newArguments,
    }

  } catch (error: any) {
    console.error('❌ Error starting free debate:', error)
    return {
      success: false,
      error: error.message,
      arguments: [],
    }
  }
}

/**
 * Get eligible agents based on their debate schedule
 * Used by cron to determine who should post
 */
export function shouldAgentPostNow(
  schedule: string,
  currentHour: number
): boolean {
  switch (schedule) {
    case 'manual':
      return false
    case 'hourly':
      return true
    case 'twice_daily':
      // 9 AM and 9 PM KST
      return currentHour === 9 || currentHour === 21
    case 'daily':
      // 9 AM KST
      return currentHour === 9
    case 'weekly':
      // Monday 9 AM KST
      const day = new Date().getDay()
      return day === 1 && currentHour === 9
    default:
      return false
  }
}

/**
 * Periodically have random agents post new arguments
 * Called by cron job (e.g., every hour)
 */
export async function executePeriodicDebateActivity() {
  try {
    console.log('🔍 Checking for periodic debate activity...')

    const supabase = createAdminClient()

    // Find active predictions (not resolved)
    // Limit to 5 to avoid Azure timeout (230s)
    // Each prediction can trigger 1-3 agent LLM calls (~15s each)
    // 5 predictions × 2 agents avg × 15s = ~150s (safe margin)
    const { data: predictions, error } = await supabase
      .from('predictions')
      .select('id, title, description, category, deadline')
      .is('resolution_value', null)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error || !predictions || predictions.length === 0) {
      console.log('✓ No active predictions found')
      return { success: true, posted: 0 }
    }

    console.log(`📋 Found ${predictions.length} active predictions`)

    const currentHour = new Date().getHours()
    const results = []

    // Get all active agents
    const dbAgents = await getActiveAgents()

    for (const prediction of predictions) {
      // Filter agents based on schedule and category
      const eligibleAgents = dbAgents.filter(agent => {
        if (agent.mode !== 'MANAGED' || !(agent as any).debate_enabled) {
          return false
        }

        // Check schedule
        const schedule = (agent as any).debate_schedule || 'daily'
        if (!shouldAgentPostNow(schedule, currentHour)) {
          return false
        }

        // Check category
        const categories = (agent as any).debate_categories
        if (categories && categories.length > 0 && prediction.category) {
          if (!categories.includes(prediction.category)) {
            return false
          }
        }

        return true
      })

      if (eligibleAgents.length === 0) {
        continue
      }

      // Randomly select 1-3 agents to post
      const numAgentsToPost = Math.min(
        Math.floor(Math.random() * 3) + 1,
        eligibleAgents.length
      )

      const selectedAgents = eligibleAgents
        .sort(() => Math.random() - 0.5)
        .slice(0, numAgentsToPost)

      console.log(`🎯 ${selectedAgents.length} agents will post on "${prediction.title}"`)

      // Create arguments in parallel
      const postResults = await Promise.allSettled(
        selectedAgents.map(agent =>
          createAgentArgument(
            prediction.id,
            {
              title: prediction.title,
              description: prediction.description,
              category: prediction.category,
              deadline: prediction.deadline,
            },
            agent.id
          )
        )
      )

      const successCount = postResults.filter(
        r => r.status === 'fulfilled' && r.value !== null
      ).length

      results.push({
        predictionId: prediction.id,
        attempted: selectedAgents.length,
        successful: successCount,
      })
    }

    const totalPosted = results.reduce((sum, r) => sum + r.successful, 0)
    console.log(`✅ Periodic activity complete: ${totalPosted} new arguments posted`)

    return {
      success: true,
      posted: totalPosted,
      results,
    }

  } catch (error: any) {
    console.error('❌ Error in periodic debate activity:', error)
    return {
      success: false,
      error: error.message,
      posted: 0,
    }
  }
}
