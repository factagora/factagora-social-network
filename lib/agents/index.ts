// Agent Manager - Public API

export { AgentExecutor, createExecutor } from './core/agent-executor'
export { PromptBuilder } from './core/prompt-builder'
export { ManagedExecutor } from './managed/managed-executor'
export { WebhookExecutor } from './byoa/webhook-executor'
export { ClaudeClient } from './managed/llm-clients/claude'
export { ReactParser } from './managed/parsers/react-parser'
export { RoundOrchestrator } from './orchestrator/round-orchestrator'
export { ConsensusDetector } from './orchestrator/consensus-detector'

// Export all types
export type {
  PredictionRequest,
  ExistingArgument,
  AgentResponse,
  AgentContext,
  ExecutionResult,
  RoundResult,
  PromptContext,
  ParseResult,
  ValidationResult,
  AgentManagerConfig,
} from './core/types'

import { createExecutor } from './core/agent-executor'
import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
  AgentManagerConfig,
} from './core/types'

/**
 * Main Agent Manager class for simplified usage
 */
export class AgentManager {
  private config: AgentManagerConfig

  constructor(config: AgentManagerConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      timeoutMs: config.timeoutMs ?? 30000,
      parallelExecution: config.parallelExecution ?? true,
      strictValidation: config.strictValidation ?? true,
      enableLogging: config.enableLogging ?? true,
      logLevel: config.logLevel ?? 'info',
      ...config,
    }

    // Set environment variables if provided
    if (config.claudeApiKey) {
      process.env.ANTHROPIC_API_KEY = config.claudeApiKey
    }
    if (config.openaiApiKey) {
      process.env.OPENAI_API_KEY = config.openaiApiKey
    }
  }

  /**
   * Execute a single agent
   */
  async executeAgent(
    agent: AgentContext,
    request: PredictionRequest
  ): Promise<ExecutionResult> {
    this.log('info', `Executing agent: ${agent.name} (${agent.mode})`)

    const executor = createExecutor(agent)

    // Validate before execution
    const isValid = await executor.validate()
    if (!isValid) {
      this.log('error', `Agent validation failed: ${agent.name}`)
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Agent configuration is invalid',
        },
        metadata: {
          executionTimeMs: 0,
          retryCount: 0,
        },
      }
    }

    // Execute
    const result = await executor.execute(request)

    if (result.success) {
      this.log(
        'info',
        `Agent ${agent.name} completed: ${result.response?.position} (${((result.response?.confidence || 0) * 100).toFixed(0)}%)`
      )
    } else {
      this.log('error', `Agent ${agent.name} failed: ${result.error?.message}`)
    }

    return result
  }

  /**
   * Execute multiple agents in parallel or sequence
   */
  async executeAgents(
    agents: AgentContext[],
    request: PredictionRequest
  ): Promise<ExecutionResult[]> {
    this.log('info', `Executing ${agents.length} agents`)

    if (this.config.parallelExecution) {
      // Execute in parallel
      return await Promise.all(
        agents.map((agent) => this.executeAgent(agent, request))
      )
    } else {
      // Execute sequentially
      const results: ExecutionResult[] = []
      for (const agent of agents) {
        const result = await this.executeAgent(agent, request)
        results.push(result)
      }
      return results
    }
  }

  /**
   * Simple logging
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string) {
    if (!this.config.enableLogging) return

    const levels = ['debug', 'info', 'warn', 'error']
    const configLevel = this.config.logLevel || 'info'

    if (levels.indexOf(level) >= levels.indexOf(configLevel)) {
      console.log(`[AgentManager:${level}] ${message}`)
    }
  }
}
