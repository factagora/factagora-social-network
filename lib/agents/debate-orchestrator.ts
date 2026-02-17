import { getActiveAgents } from '@/lib/db/agents'
import {
  startDebateRound,
  endDebateRound,
  getCurrentRound,
  getArguments,
  createArgument,
  createReactCycle,
  calculateConsensus,
  getPositionDistribution,
  calculateAvgConfidence,
  updateRoundStatistics,
  type ArgumentRow,
} from '@/lib/db/debates'
import { createExecutor } from './core/agent-executor'
import type { AgentContext, PredictionRequest } from './core/types'

export interface DebateConfig {
  maxRounds: number
  consensusThreshold: number // 0.0-1.0, e.g., 0.7 = 70% agreement
  minAgents: number
}

const DEFAULT_CONFIG: DebateConfig = {
  maxRounds: 5,
  consensusThreshold: 0.7,
  minAgents: 2,
}

/**
 * Filter agents based on debate configuration
 */
async function getEligibleDebateAgents(category: string | undefined) {
  const dbAgents = await getActiveAgents()

  // Filter for MANAGED agents with debate enabled
  let eligible = dbAgents.filter(agent =>
    agent.mode === 'MANAGED' &&
    (agent as any).debate_enabled !== false  // Default to true if not set
  )

  // Filter by category if specified
  if (category && category !== 'General') {
    eligible = eligible.filter(agent => {
      const categories = (agent as any).debate_categories
      // If agent has no category filter, participate in all
      if (!categories || categories.length === 0) return true
      // Otherwise check if category matches
      return categories.includes(category)
    })
  }

  return eligible
}

/**
 * Start a new debate for a prediction
 */
export async function startDebate(
  predictionId: string,
  predictionData: {
    title: string
    description: string
    category?: string
    deadline: string
  },
  config: Partial<DebateConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Get eligible agents based on debate configuration
  const activeAgents = await getEligibleDebateAgents(predictionData.category)

  if (activeAgents.length < finalConfig.minAgents) {
    throw new Error(`Need at least ${finalConfig.minAgents} eligible agents to start debate (found ${activeAgents.length})`)
  }

  // Start Round 1
  const agentIds = activeAgents.map(a => a.id)
  const round = await startDebateRound(predictionId, 1, agentIds)

  console.log(`🎭 Started debate for prediction ${predictionId} with ${agentIds.length} agents (category: ${predictionData.category})`)

  return {
    roundId: round.id,
    roundNumber: 1,
    agentCount: agentIds.length,
    config: finalConfig,
  }
}

/**
 * Execute the current round of debate
 */
export async function executeDebateRound(
  predictionId: string,
  predictionData: {
    title: string
    description: string
    category?: string
    deadline: string
    metadata?: any
  },
  config: Partial<DebateConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  // Get current round
  const currentRound = await getCurrentRound(predictionId)
  if (!currentRound) {
    throw new Error('No active debate round found. Start a debate first.')
  }

  // Handle round that has already ended - start next round
  let effectiveRound = currentRound
  if (currentRound.ended_at) {
    // Check if we've reached max rounds
    if (currentRound.round_number >= finalConfig.maxRounds) {
      throw new Error('Debate has completed all rounds')
    }

    // Start next round with same agents
    const nextRoundNumber = currentRound.round_number + 1
    console.log(`🔄 Round ${currentRound.round_number} has ended, starting round ${nextRoundNumber}`)

    const agentIds = currentRound.active_agents as string[]
    effectiveRound = await startDebateRound(predictionId, nextRoundNumber, agentIds)
  }

  // Get previous arguments (from all previous rounds)
  const previousArguments = await getArguments(predictionId)

  // Get active agents for this round
  const agentIds = effectiveRound.active_agents as string[]
  const dbAgents = await getActiveAgents()
  const roundAgents = dbAgents.filter(agent => agentIds.includes(agent.id))

  console.log(`🤖 Executing round ${effectiveRound.round_number} with ${roundAgents.length} agents`)

  // Build prediction request with previous round context
  const predictionRequest: PredictionRequest = {
    predictionId,
    title: predictionData.title,
    description: predictionData.description,
    category: predictionData.category || null,
    deadline: predictionData.deadline,
    roundNumber: effectiveRound.round_number,
    existingArguments: previousArguments.map(arg => ({
      agentId: arg.author_type === 'AI_AGENT' ? arg.author_id : undefined,
      agentName: arg.author_type === 'AI_AGENT' ? 'Agent' : 'Human', // TODO: Fetch agent name
      position: arg.position as 'YES' | 'NO' | 'NEUTRAL',
      confidence: arg.confidence || 0,
      reasoning: arg.reasoning || arg.content.substring(0, 200),
      roundNumber: arg.round_number,
    })),
    metadata: predictionData.metadata,
  }

  // Execute all agents in parallel
  const results = await Promise.allSettled(
    roundAgents.map(async (agent) => {
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
      const executor = createExecutor(agentContext)
      const result = await executor.execute(predictionRequest)

      if (!result.success || !result.response) {
        throw new Error(result.error?.message || 'Execution failed')
      }

      return {
        agent,
        response: result.response,
        metadata: result.metadata,
      }
    })
  )

  // Process results and create arguments
  const newArguments: ArgumentRow[] = []
  const failedAgents: string[] = []

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    const agent = roundAgents[i]

    if (result.status === 'fulfilled') {
      const { response, metadata } = result.value

      // Check agent's minimum confidence threshold
      const minConfidence = (agent as any).min_confidence ?? 0.5
      if (response.confidence < minConfidence) {
        console.log(`⏭️ Agent ${agent.name} confidence ${response.confidence.toFixed(2)} below threshold ${minConfidence.toFixed(2)}, skipping argument`)
        failedAgents.push(agent.id)
        continue
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
        roundNumber: effectiveRound.round_number,
      })

      // Create ReAct cycle record
      // Ensure fields meet database minimum length constraints
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
        roundNumber: effectiveRound.round_number,
        executionTimeMs: metadata?.executionTimeMs || 0,
      })

      newArguments.push(argument)
      console.log(`✅ ${agent.name}: ${response.position} (${(response.confidence * 100).toFixed(0)}%)`)
    } else {
      failedAgents.push(agent.name)
      console.error(`❌ ${agent.name}: ${result.reason}`)
    }
  }

  // Update round statistics
  await updateRoundStatistics(effectiveRound.id, newArguments.length)

  // Calculate consensus and statistics
  const allArguments = [...previousArguments, ...newArguments]
  const roundArguments = newArguments
  const consensus = calculateConsensus(roundArguments)
  const positionDistribution = getPositionDistribution(roundArguments)
  const avgConfidence = calculateAvgConfidence(roundArguments)

  console.log(`📊 Round ${effectiveRound.round_number} complete:`)
  console.log(`   Consensus: ${(consensus * 100).toFixed(0)}%`)
  console.log(`   Positions: ${JSON.stringify(positionDistribution)}`)
  console.log(`   Avg Confidence: ${(avgConfidence * 100).toFixed(0)}%`)

  // Determine if debate should continue
  const shouldContinue = determineContinuation(
    effectiveRound.round_number,
    consensus,
    newArguments.length,
    finalConfig
  )

  let terminationReason: string | null = null
  if (!shouldContinue.continue) {
    terminationReason = shouldContinue.reason

    // End current round
    await endDebateRound(effectiveRound.id, {
      consensusScore: consensus,
      positionDistribution,
      avgConfidence,
      terminationReason,
      isFinal: true,
    })

    console.log(`🏁 Debate concluded: ${terminationReason}`)
  } else {
    // End current round (not final)
    await endDebateRound(effectiveRound.id, {
      consensusScore: consensus,
      positionDistribution,
      avgConfidence,
      terminationReason: null, // No termination reason for non-final rounds
      isFinal: false,
    })

    // Start next round
    const nextRound = await startDebateRound(
      predictionId,
      effectiveRound.round_number + 1,
      agentIds
    )

    console.log(`➡️  Starting round ${nextRound.round_number}`)
  }

  return {
    roundNumber: effectiveRound.round_number,
    success: newArguments.length,
    failed: failedAgents.length,
    consensus,
    positionDistribution,
    avgConfidence,
    shouldContinue: shouldContinue.continue,
    terminationReason,
    nextRoundNumber: shouldContinue.continue ? currentRound.round_number + 1 : null,
  }
}

/**
 * Determine if debate should continue to next round
 */
function determineContinuation(
  currentRound: number,
  consensus: number,
  argumentCount: number,
  config: DebateConfig
): { continue: boolean; reason: string } {
  // Check max rounds
  if (currentRound >= config.maxRounds) {
    return { continue: false, reason: 'MAX_ROUNDS' }
  }

  // Check consensus threshold
  if (consensus >= config.consensusThreshold) {
    return { continue: false, reason: 'CONSENSUS' }
  }

  // Check if no arguments (stalemate)
  if (argumentCount === 0) {
    return { continue: false, reason: 'STALEMATE' }
  }

  // Continue to next round
  return { continue: true, reason: 'CONTINUE' }
}

/**
 * Get debate status for a prediction
 */
export async function getDebateStatus(predictionId: string) {
  const currentRound = await getCurrentRound(predictionId)
  
  if (!currentRound) {
    return {
      status: 'NOT_STARTED',
      currentRound: 0,
      isComplete: false,
    }
  }

  const allArguments = await getArguments(predictionId)
  const consensus = calculateConsensus(allArguments)
  const positionDistribution = getPositionDistribution(allArguments)

  return {
    status: currentRound.is_final ? 'COMPLETE' : 'IN_PROGRESS',
    currentRound: currentRound.round_number,
    isComplete: currentRound.is_final,
    consensus,
    positionDistribution,
    avgConfidence: currentRound.avg_confidence,
    terminationReason: currentRound.termination_reason,
    totalArguments: allArguments.length,
  }
}
