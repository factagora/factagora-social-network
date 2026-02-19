// Managed agent executor using LLM APIs

import { AgentExecutor } from '../core/agent-executor'
import { PromptBuilder } from '../core/prompt-builder'
import { ClaudeClient } from './llm-clients/claude'
import { ReactParser } from './parsers/react-parser'
import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
  PromptContext,
  AgentResponse,
} from '../core/types'
import { storeReActCycle } from '../core/react-storage'
import { updateAgentMemory } from '../core/memory-manager'
import { getAgentSkills } from '@/lib/db/skills'
import { executeSkill, buildSystemPromptWithSkills } from '@/lib/skills/skill-executor'
import type { SkillExecutionInput } from '@/src/types/skill'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Executor for MANAGED agents (we call LLMs)
 */
export class ManagedExecutor extends AgentExecutor {
  private promptBuilder: PromptBuilder
  private parser: ReactParser
  private llmClient: ClaudeClient | null = null

  constructor(agent: AgentContext) {
    super(agent)
    this.promptBuilder = new PromptBuilder()
    this.parser = new ReactParser()
  }

  /**
   * Initialize LLM client
   */
  private async initializeLLMClient(): Promise<void> {
    if (this.llmClient) return

    // Get API key from environment or agent config
    const apiKey = process.env.ANTHROPIC_API_KEY || this.agent.apiKeyEncrypted

    if (!apiKey) {
      throw new Error('No API key available for MANAGED agent')
    }

    // Determine model
    const model = this.agent.model || 'claude-3-5-sonnet-20241022'

    // Initialize client
    this.llmClient = new ClaudeClient(apiKey, model)
  }

  /**
   * Execute agent for prediction
   */
  async execute(request: PredictionRequest): Promise<ExecutionResult> {
    const startTime = Date.now()
    let retryCount = 0
    const maxRetries = 3

    // Initialize LLM client
    try {
      await this.initializeLLMClient()
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INITIALIZATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to initialize LLM client',
          details: error,
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          retryCount: 0,
        },
      }
    }

    // Execute agent skills (if any)
    const skillResults = new Map()
    try {
      const agentSkills = await getAgentSkills(this.agent.id)

      if (agentSkills.length > 0) {
        console.log(`🔧 Executing ${agentSkills.length} skills for agent ${this.agent.name}`)

        // Execute all skills in parallel
        const skillPromises = agentSkills.map(async ({ skill, assignment }) => {
          if (!assignment.isEnabled) return null

          // Prepare skill input
          const skillSpecificInput = await this.prepareSkillInput(skill.slug, request)
          const skillInput: SkillExecutionInput = {
            agentId: this.agent.id,
            skillId: skill.id,
            predictionId: request.predictionId,
            // Skill-specific input data
            ...skillSpecificInput,
          }

          // Execute skill
          const result = await executeSkill(skill, skillInput)

          if (result.success) {
            console.log(`  ✅ ${skill.name} completed in ${result.executionTimeMs}ms`)
            skillResults.set(skill.slug, result)
          } else {
            console.log(`  ❌ ${skill.name} failed: ${result.error}`)
          }

          return result
        })

        await Promise.all(skillPromises)
      }
    } catch (error) {
      console.error('Error executing agent skills:', error)
      // Don't fail the whole execution if skills fail
    }

    // Build prompt
    const promptContext: PromptContext = {
      agentId: this.agent.id, // Added for memory loading
      personality: this.agent.personality || 'DATA_ANALYST',
      temperature: this.agent.temperature,
      customSystemPrompt: this.agent.systemPrompt,
      prediction: {
        title: request.title,
        description: request.description,
        category: request.category,
        deadline: request.deadline,
      },
      roundNumber: request.roundNumber,
      existingArguments: request.existingArguments,
    }

    let { system, user } = await this.promptBuilder.buildPrompt(promptContext)

    // Enhance system prompt with skill results
    if (skillResults.size > 0) {
      system = buildSystemPromptWithSkills(system, skillResults)
      console.log(`📈 Enhanced prompt with ${skillResults.size} skill results`)
    }

    // Execute with retries
    while (retryCount < maxRetries) {
      try {
        // Call LLM
        const llmResponse = await this.llmClient!.generate({
          system,
          user,
          temperature: this.agent.temperature,
        })

        // Parse response
        const parseResult = this.parser.parse(llmResponse.content)

        if (!parseResult.success) {
          // Parsing failed - retry with different temperature?
          retryCount++
          if (retryCount >= maxRetries) {
            return {
              success: false,
              error: {
                code: 'PARSE_ERROR',
                message: parseResult.error?.message || 'Failed to parse LLM output',
                details: parseResult.error,
              },
              metadata: {
                executionTimeMs: Date.now() - startTime,
                retryCount,
                llmProvider: 'claude',
                llmModel: llmResponse.model,
                tokensUsed: llmResponse.usage.inputTokens + llmResponse.usage.outputTokens,
              },
            }
          }
          continue
        }

        // Extract numeric value from timeseries skill results (if available)
        let numericValue: number | undefined
        const timeseriesResult = skillResults.get('timeseries-forecasting')
        if (timeseriesResult?.success && timeseriesResult.data?.prediction) {
          numericValue = timeseriesResult.data.prediction
          console.log(`📈 Extracted numeric prediction: ${numericValue}`)
        }

        // Success!
        return {
          success: true,
          response: {
            position: parseResult.position!,
            confidence: parseResult.confidence!,
            reactCycle: parseResult.reactCycle!,
            executionTimeMs: Date.now() - startTime,
            numericValue, // Add numeric value for TIMESERIES predictions
          },
          metadata: {
            executionTimeMs: Date.now() - startTime,
            retryCount,
            llmProvider: 'claude',
            llmModel: llmResponse.model,
            tokensUsed: llmResponse.usage.inputTokens + llmResponse.usage.outputTokens,
          },
        }
      } catch (error) {
        retryCount++
        if (retryCount >= maxRetries) {
          return {
            success: false,
            error: {
              code: 'LLM_API_ERROR',
              message: error instanceof Error ? error.message : 'LLM API call failed',
              details: error,
            },
            metadata: {
              executionTimeMs: Date.now() - startTime,
              retryCount,
              llmProvider: 'claude',
            },
          }
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)))
      }
    }

    // Should not reach here
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Unexpected execution flow',
      },
      metadata: {
        executionTimeMs: Date.now() - startTime,
        retryCount,
      },
    }
  }

  /**
   * Store ReAct cycle after argument is created
   * Should be called by RoundOrchestrator after creating the argument
   */
  async storeReActCycleAfterArgument(data: {
    argumentId: string
    predictionId: string
    prediction: { title: string }
    roundNumber: number
    reactCycle: AgentResponse['reactCycle']
    position: string
    confidence: number
  }): Promise<void> {
    try {
      // Store ReAct cycle in database
      const cycleId = await storeReActCycle({
        argumentId: data.argumentId,
        agentId: this.agent.id,
        predictionId: data.predictionId,

        // Stage 1: Initial Thought
        initialThought: data.reactCycle!.initialThought,
        informationNeeds: [], // Could extract from initialThought if needed

        // Stage 2: Actions
        actions: data.reactCycle!.actions,

        // Stage 3: Observations
        observations: data.reactCycle!.observations,
        sourceValidation: data.reactCycle!.actions.map((action) => ({
          source: action.source || 'unknown',
          reliability: action.reliability || 0.5,
        })),

        // Stage 4: Synthesis
        synthesisThought: data.reactCycle!.synthesisThought,
        counterArgumentsConsidered: [], // Could extract from synthesisThought if needed
        confidenceAdjustment: data.confidence - 0.5, // Adjustment from neutral

        // Metadata
        roundNumber: data.roundNumber,
        thinkingDepth: 'detailed',
      })

      if (cycleId) {
        console.log(`✅ Stored ReAct cycle ${cycleId} for argument ${data.argumentId}`)

        // Update agent memory with learnings
        await this.updateMemoryAfterRound(data)
      }
    } catch (error) {
      console.error('Failed to store ReAct cycle:', error)
      // Don't throw - this is supplementary data, main argument is already created
    }
  }

  /**
   * Update agent memory with learnings from this round
   */
  private async updateMemoryAfterRound(data: {
    prediction: { title: string }
    position: string
    confidence: number
    reactCycle: AgentResponse['reactCycle']
  }): Promise<void> {
    try {
      // Extract key insights from synthesis thought
      const keyInsights: string[] = [data.reactCycle!.synthesisThought]

      // Extract successful strategies from actions
      const successfulStrategies = data.reactCycle!.actions
        .filter((a) => a.result && a.result.length > 10)
        .map((a) => `${a.type}: ${a.query}`)

      await updateAgentMemory(this.agent.id, {
        predictionTitle: data.prediction.title,
        position: data.position,
        confidence: data.confidence,
        keyInsights,
        successfulStrategies: successfulStrategies.length > 0 ? successfulStrategies : undefined,
      })

      console.log(`✅ Updated agent memory for ${this.agent.name}`)
    } catch (error) {
      console.error('Failed to update agent memory:', error)
      // Don't throw - memory update is supplementary
    }
  }

  /**
   * Prepare skill-specific input data
   */
  private async prepareSkillInput(skillSlug: string, request: PredictionRequest): Promise<any> {
    switch (skillSlug) {
      case 'timeseries-forecasting': {
        // For timeseries, fetch historical voting data from vote_history
        const supabase = createAdminClient()

        const { data: history, error } = await supabase
          .from('vote_history')
          .select('snapshot_time, avg_prediction, median_prediction')
          .eq('prediction_id', request.predictionId)
          .order('snapshot_time', { ascending: true })

        if (error) {
          console.error('Failed to fetch vote history:', error)
          return {
            predictionId: request.predictionId,
            historicalData: [],
            forecastHorizon: 30,
          }
        }

        // Transform to the format expected by TKG API: { date, value }
        const historicalData = (history || []).map((snapshot) => ({
          date: new Date(snapshot.snapshot_time).toISOString().split('T')[0],
          value: snapshot.avg_prediction || snapshot.median_prediction || 0,
        }))

        console.log(`📊 Fetched ${historicalData.length} historical data points for prediction ${request.predictionId}`)

        return {
          predictionId: request.predictionId,
          historicalData,
          forecastHorizon: 30, // Forecast 30 days ahead
        }
      }

      case 'statistical-validation':
        // For statistical validation, we need the data to validate
        return {
          data: request.existingArguments?.map((arg) => arg.confidence) || [],
          hypothesis: `Prediction: ${request.title}`,
        }

      case 'polymarket-integration':
        return {
          query: request.title,
        }

      case 'social-sentiment':
        return {
          query: request.title,
          platforms: ['twitter', 'reddit'],
        }

      case 'news-scraper':
        return {
          query: request.title,
          maxArticles: 10,
        }

      default:
        // Generic input
        return {
          predictionTitle: request.title,
          predictionDescription: request.description,
          category: request.category,
        }
    }
  }

  /**
   * Validate agent configuration
   */
  async validate(): Promise<boolean> {
    try {
      // Check if we have API key
      const apiKey = process.env.ANTHROPIC_API_KEY || this.agent.apiKeyEncrypted
      if (!apiKey) {
        console.error('No API key for MANAGED agent:', this.agent.id)
        return false
      }

      // Check if we have model
      if (!this.agent.model && !process.env.ANTHROPIC_API_KEY) {
        console.error('No model specified for MANAGED agent:', this.agent.id)
        return false
      }

      return true
    } catch (error) {
      console.error('Validation error for MANAGED agent:', error)
      return false
    }
  }
}
