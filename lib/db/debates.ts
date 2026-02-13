import { createAdminClient } from '@/lib/supabase/server'

/**
 * Debate Rounds - Track multi-round debate progression
 */

export interface DebateRoundRow {
  id: string
  prediction_id: string
  round_number: number
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  active_agents: any // JSONB array of agent IDs
  arguments_submitted: number
  replies_submitted: number
  consensus_score: number | null
  position_distribution: any // JSONB object {YES: n, NO: n, NEUTRAL: n}
  avg_confidence: number | null
  termination_reason: string | null
  is_final: boolean
  created_at: string
  updated_at: string
}

export interface ArgumentRow {
  id: string
  prediction_id: string
  author_id: string
  author_type: 'AI_AGENT' | 'HUMAN'
  position: 'YES' | 'NO' | 'NEUTRAL'
  content: string
  evidence: any // JSONB
  reasoning: string | null
  confidence: number | null
  round_number: number
  react_cycle_id: string | null
  created_at: string
  updated_at: string
}

export interface ReactCycleRow {
  id: string
  argument_id: string
  agent_id: string
  initial_reasoning: string
  hypothesis: string
  information_needs: any // JSONB
  actions: any // JSONB
  evidence_gathered: any // JSONB
  observations: any // JSONB
  source_validation: any // JSONB
  synthesis_reasoning: string
  counter_arguments_considered: any // JSONB
  confidence_adjustment: number | null
  round_number: number
  execution_time_ms: number | null
  created_at: string
}

/**
 * Start a new debate round
 */
export async function startDebateRound(
  predictionId: string,
  roundNumber: number,
  agentIds: string[]
) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('debate_rounds')
    .insert({
      prediction_id: predictionId,
      round_number: roundNumber,
      active_agents: agentIds,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error starting debate round:', error)
    throw error
  }

  return data as DebateRoundRow
}

/**
 * End a debate round with statistics
 */
export async function endDebateRound(
  roundId: string,
  stats: {
    consensusScore: number
    positionDistribution: Record<string, number>
    avgConfidence: number
    terminationReason: string | null
    isFinal: boolean
  }
) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('debate_rounds')
    .update({
      ended_at: new Date().toISOString(),
      consensus_score: stats.consensusScore,
      position_distribution: stats.positionDistribution,
      avg_confidence: stats.avgConfidence,
      termination_reason: stats.terminationReason,
      is_final: stats.isFinal,
    })
    .eq('id', roundId)
    .select()
    .single()

  if (error) {
    console.error('Error ending debate round:', error)
    throw error
  }

  return data as DebateRoundRow
}

/**
 * Get current round for a prediction
 */
export async function getCurrentRound(predictionId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('debate_rounds')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error getting current round:', error)
    throw error
  }

  return data as DebateRoundRow | null
}

/**
 * Get all rounds for a prediction
 */
export async function getDebateRounds(predictionId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('debate_rounds')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('round_number', { ascending: true })

  if (error) {
    console.error('Error getting debate rounds:', error)
    throw error
  }

  return data as DebateRoundRow[]
}

/**
 * Create an argument
 */
export async function createArgument(input: {
  predictionId: string
  authorId: string
  authorType: 'AI_AGENT' | 'HUMAN'
  position: 'YES' | 'NO' | 'NEUTRAL'
  content: string
  reasoning: string
  confidence: number
  evidence: any
  roundNumber: number
}) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('arguments')
    .insert({
      prediction_id: input.predictionId,
      author_id: input.authorId,
      author_type: input.authorType,
      position: input.position,
      content: input.content,
      reasoning: input.reasoning,
      confidence: input.confidence,
      evidence: input.evidence,
      round_number: input.roundNumber,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating argument:', error)
    throw error
  }

  return data as ArgumentRow
}

/**
 * Get arguments for a prediction (optionally filtered by round)
 */
export async function getArguments(predictionId: string, roundNumber?: number) {
  const supabase = createAdminClient()

  let query = supabase
    .from('arguments')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('created_at', { ascending: true })

  if (roundNumber !== undefined) {
    query = query.eq('round_number', roundNumber)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error getting arguments:', error)
    throw error
  }

  return data as ArgumentRow[]
}

/**
 * Create a ReAct cycle record
 */
export async function createReactCycle(input: {
  argumentId: string
  agentId: string
  initialReasoning: string
  hypothesis: string
  informationNeeds: any[]
  actions: any[]
  evidenceGathered: any[]
  observations: any[]
  sourceValidation: any[]
  synthesisReasoning: string
  counterArgumentsConsidered: any[]
  confidenceAdjustment: number | null
  roundNumber: number
  executionTimeMs: number
}) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('agent_react_cycles')
    .insert({
      argument_id: input.argumentId,
      agent_id: input.agentId,
      initial_reasoning: input.initialReasoning,
      hypothesis: input.hypothesis,
      information_needs: input.informationNeeds,
      actions: input.actions,
      evidence_gathered: input.evidenceGathered,
      observations: input.observations,
      source_validation: input.sourceValidation,
      synthesis_reasoning: input.synthesisReasoning,
      counter_arguments_considered: input.counterArgumentsConsidered,
      confidence_adjustment: input.confidenceAdjustment,
      round_number: input.roundNumber,
      execution_time_ms: input.executionTimeMs,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ReAct cycle:', error)
    throw error
  }

  return data as ReactCycleRow
}

/**
 * Calculate consensus score for a round
 * Returns 0.0 (no consensus) to 1.0 (full agreement)
 */
export function calculateConsensus(args: ArgumentRow[]): number {
  if (args.length === 0) return 0.0

  const positionCounts: Record<string, number> = {}
  args.forEach(arg => {
    positionCounts[arg.position] = (positionCounts[arg.position] || 0) + 1
  })

  const maxCount = Math.max(...Object.values(positionCounts))
  return maxCount / args.length
}

/**
 * Get position distribution from arguments
 */
export function getPositionDistribution(args: ArgumentRow[]): Record<string, number> {
  const distribution: Record<string, number> = { YES: 0, NO: 0, NEUTRAL: 0 }
  args.forEach(arg => {
    distribution[arg.position] = (distribution[arg.position] || 0) + 1
  })
  return distribution
}

/**
 * Calculate average confidence from arguments
 */
export function calculateAvgConfidence(args: ArgumentRow[]): number {
  if (args.length === 0) return 0.0
  const total = args.reduce((sum, arg) => sum + (arg.confidence || 0), 0)
  return total / args.length
}

/**
 * Update debate round statistics
 */
export async function updateRoundStatistics(
  roundId: string,
  argumentCount: number,
  replyCount: number = 0
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('debate_rounds')
    .update({
      arguments_submitted: argumentCount,
      replies_submitted: replyCount,
    })
    .eq('id', roundId)

  if (error) {
    console.error('Error updating round statistics:', error)
    throw error
  }
}
