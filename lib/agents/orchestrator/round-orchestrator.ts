// Round orchestration for multi-agent debates

import { createClient } from '@/lib/supabase/client'
import { AgentManager } from '../index'
import { ConsensusDetector } from './consensus-detector'
import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
  RoundResult,
} from '../core/types'
import type { Agent, Prediction, Argument } from '@/src/types/debate'
import { getVoteWeight, type VotePosition } from '@/src/types/voting'

/**
 * Orchestrates multi-agent debate rounds
 */
export class RoundOrchestrator {
  private agentManager: AgentManager
  private consensusDetector: ConsensusDetector

  constructor(config?: { claudeApiKey?: string; openaiApiKey?: string }) {
    this.agentManager = new AgentManager({
      claudeApiKey: config?.claudeApiKey || process.env.ANTHROPIC_API_KEY,
      openaiApiKey: config?.openaiApiKey || process.env.OPENAI_API_KEY,
      parallelExecution: true,
    })
    this.consensusDetector = new ConsensusDetector()
  }

  /**
   * Execute a complete debate round
   */
  async executeRound(predictionId: string, roundNumber: number): Promise<RoundResult> {
    const startTime = Date.now()

    try {
      // 0. Clean existing round data if this is Round 1
      if (roundNumber === 1) {
        await this.cleanExistingRoundData(predictionId, roundNumber)
      }

      // 1. Fetch prediction and active agents
      const { prediction, agents } = await this.fetchPredictionAndAgents(predictionId)

      if (agents.length === 0) {
        throw new Error('No active agents found for prediction')
      }

      console.log(
        `[Round ${roundNumber}] Starting with ${agents.length} agents for prediction: ${prediction.title}`
      )

      // 2. Fetch existing arguments (for Round 2+)
      const existingArguments =
        roundNumber > 1 ? await this.fetchExistingArguments(predictionId) : []

      // 3. Build prediction request
      const request: PredictionRequest = {
        predictionId,
        title: prediction.title,
        description: prediction.description,
        category: prediction.category,
        deadline: prediction.deadline,
        roundNumber,
        existingArguments: existingArguments.map((arg) => ({
          agentName: arg.authorName,
          position: arg.position,
          confidence: arg.confidence,
          reasoning: arg.reasoning || arg.content,
          evidence: arg.evidence,
        })),
      }

      // 4. Execute all agents in parallel
      console.log(`[Round ${roundNumber}] Executing ${agents.length} agents...`)
      const results = await this.agentManager.executeAgents(
        agents.map((a) => this.mapAgentToContext(a)),
        request
      )

      // 5. Save results to database
      console.log(`[Round ${roundNumber}] Saving results to database...`)
      if (roundNumber === 1) {
        // Round 1: Save as new arguments
        await this.saveResults(predictionId, roundNumber, agents, results)
      } else {
        // Round 2+: Generate and save replies
        await this.generateAndSaveReplies(predictionId, roundNumber, agents, results, existingArguments)
      }

      // 5.5. Submit AI agent votes
      console.log(`[Round ${roundNumber}] Submitting AI agent votes...`)
      await this.submitAgentVotes(predictionId, agents, results)

      // 6. Calculate round statistics
      const stats = this.calculateRoundStats(results)

      console.log(
        `[Round ${roundNumber}] Stats: ${stats.successfulAgents}/${stats.totalAgents} succeeded, consensus: ${(stats.consensusScore * 100).toFixed(1)}%`
      )

      // 7. Check termination conditions
      const previousRound =
        roundNumber > 1 ? await this.fetchPreviousRound(predictionId, roundNumber - 1) : null

      const consensusResult = this.consensusDetector.detect({
        roundNumber,
        positionDistribution: {
          yes: stats.positionDistribution.yes,
          no: stats.positionDistribution.no,
          neutral: stats.positionDistribution.neutral,
        },
        avgConfidence: stats.avgConfidence,
        previousRoundConfidence: previousRound?.avg_confidence || undefined,
        deadline: prediction.deadline,
        maxRounds: 10,
      })

      console.log(`[Round ${roundNumber}] ${consensusResult.details.message}`)

      // 8. Save round to database
      await this.saveRound(predictionId, roundNumber, stats, consensusResult)

      // 9. Return result
      return {
        roundNumber,
        agentResults: results.map((result, idx) => ({
          agentId: agents[idx].id,
          agentName: agents[idx].name,
          result,
        })),
        stats,
        consensusScore: consensusResult.consensusScore,
        shouldTerminate: consensusResult.shouldTerminate,
        terminationReason: consensusResult.terminationReason,
      }
    } catch (error) {
      console.error(`[Round ${roundNumber}] Error:`, error)
      throw error
    }
  }

  /**
   * Fetch prediction and active agents
   */
  private async fetchPredictionAndAgents(
    predictionId: string
  ): Promise<{ prediction: Prediction; agents: Agent[] }> {
    const supabase = createClient()

    // Fetch prediction
    const { data: prediction, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single()

    if (predError || !prediction) {
      throw new Error(`Prediction not found: ${predictionId}`)
    }

    // Fetch active agents
    // For MVP: Get all active agents
    // Later: Add agent selection logic (user-specific, personality diversity, etc.)
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .limit(5) // Max 5 agents per round

    console.log('[DEBUG] Agents query result:', { agents, error: agentsError })

    if (agentsError) {
      throw new Error(`Failed to fetch agents: ${agentsError.message}`)
    }

    return {
      prediction: prediction as Prediction,
      agents: (agents || []) as Agent[],
    }
  }

  /**
   * Fetch existing arguments from previous rounds
   */
  private async fetchExistingArguments(predictionId: string): Promise<Argument[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('arguments')
      .select('*')
      .eq('prediction_id', predictionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch existing arguments:', error)
      return []
    }

    // Transform snake_case to camelCase
    return (data || []).map((arg: any) => ({
      id: arg.id,
      predictionId: arg.prediction_id,
      authorId: arg.author_id,
      authorType: arg.author_type,
      authorName: arg.author_name,
      position: arg.position,
      content: arg.content,
      evidence: arg.evidence,
      reasoning: arg.reasoning,
      confidence: arg.confidence,
      roundNumber: arg.round_number,
      createdAt: arg.created_at,
      updatedAt: arg.updated_at,
      replyCount: arg.reply_count || 0,
      qualityScore: arg.quality_score || 0,
      supportCount: arg.support_count || 0,
      counterCount: arg.counter_count || 0,
    })) as Argument[]
  }

  /**
   * Fetch previous round data
   */
  private async fetchPreviousRound(predictionId: string, roundNumber: number) {
    const supabase = createClient()

    const { data } = await supabase
      .from('debate_rounds')
      .select('*')
      .eq('prediction_id', predictionId)
      .eq('round_number', roundNumber)
      .single()

    return data
  }

  /**
   * Map database Agent to AgentContext
   */
  private mapAgentToContext(agent: Agent): AgentContext {
    return {
      id: agent.id,
      name: agent.name,
      mode: agent.mode,
      personality: agent.personality,
      temperature: agent.temperature,
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      apiKeyEncrypted: agent.apiKeyEncrypted,
      webhookUrl: agent.webhookUrl,
      webhookAuthToken: agent.webhookAuthToken,
    }
  }

  /**
   * Save execution results to database
   */
  private async saveResults(
    predictionId: string,
    roundNumber: number,
    agents: Agent[],
    results: ExecutionResult[]
  ): Promise<void> {
    const supabase = createClient()

    for (let i = 0; i < results.length; i++) {
      const agent = agents[i]
      const result = results[i]

      if (!result.success || !result.response) {
        console.warn(`Agent ${agent.name} failed, skipping save`)
        continue
      }

      try {
        // 1. Insert argument
        const { data: argument, error: argError } = await supabase
          .from('arguments')
          .insert({
            prediction_id: predictionId,
            author_id: agent.id,
            author_type: 'AI_AGENT',
            author_name: agent.name,
            position: result.response.position,
            content: result.response.reactCycle.synthesisThought,
            evidence: result.response.reactCycle.evidence,
            reasoning: result.response.reasoning || null,
            confidence: result.response.confidence,
            round_number: roundNumber,
          })
          .select()
          .single()

        if (argError || !argument) {
          console.error(`Failed to save argument for ${agent.name}:`, argError)
          continue
        }

        // 2. Insert ReAct cycle
        const { error: reactError } = await supabase.from('agent_react_cycles').insert({
          argument_id: argument.id,
          agent_id: agent.id,
          initial_reasoning: result.response.reactCycle.initialThought,
          hypothesis: result.response.reactCycle.initialThought.slice(0, 500), // Use first 500 chars as hypothesis
          information_needs: [], // TODO: Extract from initialThought
          actions: result.response.reactCycle.actions,
          evidence_gathered: result.response.reactCycle.evidence,
          observations: result.response.reactCycle.observations,
          source_validation: [], // TODO: Extract from evidence
          synthesis_reasoning: result.response.reactCycle.synthesisThought,
          counter_arguments_considered: [], // TODO: Extract from synthesisThought
          confidence_adjustment: null,
          round_number: roundNumber,
          execution_time_ms: result.metadata.executionTimeMs,
        })

        if (reactError) {
          console.error(`Failed to save ReAct cycle for ${agent.name}:`, reactError)
        }
      } catch (error) {
        console.error(`Error saving results for ${agent.name}:`, error)
      }
    }
  }

  /**
   * Calculate round statistics
   */
  private calculateRoundStats(results: ExecutionResult[]): RoundResult['stats'] {
    const successful = results.filter((r) => r.success)

    const positions = successful.map((r) => r.response?.position)
    const yesCount = positions.filter((p) => p === 'YES').length
    const noCount = positions.filter((p) => p === 'NO').length
    const neutralCount = positions.filter((p) => p === 'NEUTRAL').length

    const avgConfidence =
      successful.length > 0
        ? successful.reduce((sum, r) => sum + (r.response?.confidence || 0), 0) /
          successful.length
        : 0

    const avgExecutionTime =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.metadata.executionTimeMs, 0) / results.length
        : 0

    // Calculate consensus score
    const total = yesCount + noCount + neutralCount
    const maxPosition = Math.max(yesCount, noCount, neutralCount)
    const consensusScore = total > 0 ? maxPosition / total : 0

    return {
      totalAgents: results.length,
      successfulAgents: successful.length,
      failedAgents: results.length - successful.length,
      avgExecutionTimeMs: Math.round(avgExecutionTime),
      positionDistribution: {
        yes: yesCount,
        no: noCount,
        neutral: neutralCount,
      },
      avgConfidence,
      consensusScore,
    }
  }

  /**
   * Save round to database
   */
  private async saveRound(
    predictionId: string,
    roundNumber: number,
    stats: RoundResult['stats'],
    consensusResult: { shouldTerminate: boolean; terminationReason?: string }
  ): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.from('debate_rounds').insert({
      prediction_id: predictionId,
      round_number: roundNumber,
      active_agents: [], // TODO: Store agent IDs
      arguments_submitted: stats.successfulAgents,
      replies_submitted: 0, // TODO: Count replies for Round 2+
      consensus_score: stats.consensusScore,
      position_distribution: stats.positionDistribution,
      avg_confidence: stats.avgConfidence,
      termination_reason: consensusResult.terminationReason || null,
      is_final: consensusResult.shouldTerminate,
      ended_at: consensusResult.shouldTerminate ? new Date().toISOString() : null,
    })

    if (error) {
      console.error('Failed to save round:', error)
      throw error
    }
  }

  /**
   * Generate and save replies for Round 2+ (Interactive Debate)
   */
  private async generateAndSaveReplies(
    predictionId: string,
    roundNumber: number,
    agents: Agent[],
    results: ExecutionResult[],
    existingArguments: Argument[]
  ): Promise<void> {
    const supabase = createClient()

    console.log(`[Round ${roundNumber}] Generating replies for ${agents.length} agents...`)

    for (let i = 0; i < results.length; i++) {
      const agent = agents[i]
      const result = results[i]

      if (!result.success || !result.response) {
        console.warn(`Agent ${agent.name} failed, skipping reply generation`)
        continue
      }

      // Find arguments from other agents to reply to
      const otherArguments = existingArguments.filter(
        (arg) => arg.authorId !== agent.id && arg.authorType === 'AI_AGENT'
      )

      if (otherArguments.length === 0) {
        console.log(`[Round ${roundNumber}] ${agent.name}: No arguments to reply to`)
        continue
      }

      // Analyze each argument and decide if reply is needed
      for (const targetArg of otherArguments) {
        const shouldReply = await this.decideIfShouldReply(
          agent,
          result.response,
          targetArg
        )

        if (shouldReply.decision) {
          const reply = {
            argument_id: targetArg.id,
            author_id: agent.id,
            author_type: 'AI_AGENT' as const,
            reply_type: shouldReply.replyType,
            content: shouldReply.content,
            evidence: shouldReply.evidence || [],
          }

          const { error } = await supabase.from('argument_replies').insert(reply)

          if (error) {
            console.error(`Failed to save reply from ${agent.name}:`, error)
          } else {
            console.log(
              `[Round ${roundNumber}] ${agent.name} → ${shouldReply.replyType} to ${targetArg.authorName}`
            )
          }
        }
      }
    }
  }

  /**
   * Decide if agent should reply to an argument (Mini-ReAct Cycle)
   */
  private async decideIfShouldReply(
    agent: Agent,
    agentResponse: any,
    targetArgument: Argument
  ): Promise<{
    decision: boolean
    replyType?: 'SUPPORT' | 'COUNTER' | 'QUESTION' | 'CLARIFY'
    content?: string
    evidence?: any[]
  }> {
    const myPosition = agentResponse.position
    const targetPosition = targetArgument.position
    const myConfidence = agentResponse.confidence
    const targetConfidence = targetArgument.confidence

    // Rule 1: Same position + high confidence → SUPPORT
    if (
      myPosition === targetPosition &&
      myConfidence > 0.7 &&
      targetConfidence > 0.7
    ) {
      return {
        decision: true,
        replyType: 'SUPPORT',
        content: `I agree with ${targetArgument.authorName}'s position. ${agentResponse.reactCycle.synthesisThought.slice(0, 200)}`,
        evidence: agentResponse.reactCycle.evidence.slice(0, 2),
      }
    }

    // Rule 2: Different position + strong evidence → COUNTER
    if (myPosition !== targetPosition && myConfidence > 0.6) {
      return {
        decision: true,
        replyType: 'COUNTER',
        content: `I disagree with ${targetArgument.authorName}. ${agentResponse.reactCycle.synthesisThought.slice(0, 300)}`,
        evidence: agentResponse.reactCycle.evidence.slice(0, 3),
      }
    }

    // Rule 3: Low target confidence → QUESTION
    if (targetConfidence < 0.5) {
      return {
        decision: true,
        replyType: 'QUESTION',
        content: `What additional evidence supports your position? I'd like to understand your reasoning better.`,
      }
    }

    // Rule 4: Skip if positions are similar and no new insights
    return {
      decision: false,
    }
  }

  /**
   * Submit AI agent votes after Round execution
   */
  private async submitAgentVotes(
    predictionId: string,
    agents: Agent[],
    results: ExecutionResult[]
  ): Promise<void> {
    const supabase = createClient()

    // Get total user count for weight calculation
    const { count: totalUsers } = await supabase
      .from('predictions')
      .select('user_id', { count: 'exact', head: true })

    for (let i = 0; i < results.length; i++) {
      const agent = agents[i]
      const result = results[i]

      if (!result.success || !result.response) {
        console.warn(`Agent ${agent.name} failed, skipping vote submission`)
        continue
      }

      try {
        const position = result.response.position as VotePosition
        const confidence = result.response.confidence
        const weight = getVoteWeight('AI_AGENT', totalUsers || 0)

        // Upsert vote (insert or update if exists)
        const { error: voteError } = await supabase.from('votes').upsert(
          {
            prediction_id: predictionId,
            voter_id: agent.id,
            voter_type: 'AI_AGENT',
            voter_name: agent.name,
            position,
            confidence,
            weight,
            reasoning: result.response.reasoning || result.response.reactCycle.synthesisThought.slice(0, 500),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'prediction_id,voter_id,voter_type',
          }
        )

        if (voteError) {
          console.error(`Failed to submit vote for ${agent.name}:`, voteError)
        } else {
          console.log(`✅ Vote submitted: ${agent.name} voted ${position} (confidence: ${confidence.toFixed(2)}, weight: ${weight.toFixed(2)})`)
        }
      } catch (error) {
        console.error(`Error submitting vote for ${agent.name}:`, error)
      }
    }
  }

  /**
   * Clean existing round data before starting a new round
   */
  private async cleanExistingRoundData(predictionId: string, roundNumber: number) {
    const supabase = createClient()

    console.log(`[Round ${roundNumber}] Cleaning existing data for prediction ${predictionId}...`)

    // Delete in correct order (child tables first)
    // 1. Delete argument_quality for this prediction's arguments
    const { data: existingArgs } = await supabase
      .from('arguments')
      .select('id')
      .eq('prediction_id', predictionId)
      .eq('round_number', roundNumber)

    if (existingArgs && existingArgs.length > 0) {
      const argIds = existingArgs.map(a => a.id)

      await supabase
        .from('argument_quality')
        .delete()
        .in('argument_id', argIds)

      await supabase
        .from('agent_react_cycles')
        .delete()
        .in('argument_id', argIds)
    }

    // 2. Delete arguments for this round
    await supabase
      .from('arguments')
      .delete()
      .eq('prediction_id', predictionId)
      .eq('round_number', roundNumber)

    // 3. Delete debate_rounds for this round
    await supabase
      .from('debate_rounds')
      .delete()
      .eq('prediction_id', predictionId)
      .eq('round_number', roundNumber)

    console.log(`[Round ${roundNumber}] Existing data cleaned`)
  }
}
