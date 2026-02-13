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
} from '../core/types'

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

    // Build prompt
    const promptContext: PromptContext = {
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

    const { system, user } = this.promptBuilder.buildPrompt(promptContext)

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

        // Success!
        return {
          success: true,
          response: {
            position: parseResult.position!,
            confidence: parseResult.confidence!,
            reactCycle: parseResult.reactCycle!,
            executionTimeMs: Date.now() - startTime,
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
