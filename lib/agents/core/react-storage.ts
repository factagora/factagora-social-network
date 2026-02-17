// Store and retrieve ReAct cycles from database

import { createAdminClient } from '@/lib/supabase/server'
import type { Action } from '@/src/types/debate'

/**
 * ReAct cycle data structure (matches database schema)
 */
export interface ReActCycleData {
  argumentId: string
  agentId: string
  predictionId: string

  // Stage 1: Initial Thought
  initialThought: string
  hypothesis?: string
  informationNeeds?: string[]

  // Stage 2: Action
  actions: Action[]

  // Stage 3: Observation
  observations: string[]
  sourceValidation?: Array<{
    source: string
    reliability: number
    concerns?: string[]
  }>

  // Stage 4: Synthesis
  synthesisThought: string
  counterArgumentsConsidered?: string[]
  confidenceAdjustment?: number

  // Metadata
  roundNumber: number
  thinkingDepth?: 'basic' | 'detailed' | 'comprehensive'
  maxStepsUsed?: number
}

/**
 * Store ReAct cycle in database
 */
export async function storeReActCycle(data: ReActCycleData): Promise<string | null> {
  const supabase = createAdminClient()

  const { data: cycle, error } = await supabase
    .from('agent_react_cycles')
    .insert({
      argument_id: data.argumentId,
      agent_id: data.agentId,
      prediction_id: data.predictionId,

      // Stage 1
      initial_thought: data.initialThought,
      hypothesis: data.hypothesis || null,
      information_needs: data.informationNeeds || [],

      // Stage 2
      actions: data.actions,

      // Stage 3
      observations: data.observations,
      source_validation: data.sourceValidation || null,

      // Stage 4
      synthesis_thought: data.synthesisThought,
      counter_arguments_considered: data.counterArgumentsConsidered || [],
      confidence_adjustment: data.confidenceAdjustment || null,

      // Metadata
      round_number: data.roundNumber,
      thinking_depth: data.thinkingDepth || 'detailed',
      max_steps_used: data.maxStepsUsed || null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to store ReAct cycle:', error)
    return null
  }

  return cycle.id
}

/**
 * Get ReAct cycle by argument ID
 */
export async function getReActCycleByArgument(argumentId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('get_react_cycle_by_argument', {
    p_argument_id: argumentId,
  })

  if (error) {
    console.error('Failed to get ReAct cycle:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Store round execution metadata
 */
export async function storeRoundMetadata(data: {
  predictionId: string
  roundNumber: number
  agentsParticipated: number
  successfulResponses: number
  failedAgents?: string[]
  consensusScore?: number
  positionDistribution?: { YES: number; NO: number; NEUTRAL: number }
  durationMs?: number
  avgResponseTimeMs?: number
}): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('debate_rounds_metadata').insert({
    prediction_id: data.predictionId,
    round_number: data.roundNumber,
    agents_participated: data.agentsParticipated,
    successful_responses: data.successfulResponses,
    failed_agents: data.failedAgents || [],
    consensus_score: data.consensusScore || null,
    position_distribution: data.positionDistribution || null,
    duration_ms: data.durationMs || null,
    avg_response_time_ms: data.avgResponseTimeMs || null,
  })

  if (error) {
    console.error('Failed to store round metadata:', error)
  }
}

/**
 * Log agent failure during round
 */
export async function logAgentFailure(data: {
  predictionId: string
  roundNumber: number
  agentId?: string
  agentName?: string
  errorType: string
  errorMessage: string
  errorStack?: string
  retryAttempt?: number
}): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('debate_rounds_failures').insert({
    prediction_id: data.predictionId,
    round_number: data.roundNumber,
    agent_id: data.agentId || null,
    agent_name: data.agentName || null,
    error_type: data.errorType,
    error_message: data.errorMessage,
    error_stack: data.errorStack || null,
    retry_attempt: data.retryAttempt || 0,
  })

  if (error) {
    console.error('Failed to log agent failure:', error)
  }
}
