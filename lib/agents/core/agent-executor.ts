// Abstract interface for all agent executors

import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
} from './types'

/**
 * Abstract base class for agent executors
 *
 * All agent types (MANAGED, BYOA) implement this interface
 */
export abstract class AgentExecutor {
  protected agent: AgentContext

  constructor(agent: AgentContext) {
    this.agent = agent
  }

  /**
   * Execute agent for given prediction
   *
   * @param request - Prediction request with context
   * @returns Execution result with response or error
   */
  abstract execute(request: PredictionRequest): Promise<ExecutionResult>

  /**
   * Validate agent configuration before execution
   *
   * @returns true if agent is ready to execute
   */
  abstract validate(): Promise<boolean>

  /**
   * Get agent information
   */
  getAgent(): AgentContext {
    return this.agent
  }

  /**
   * Check if agent is active
   */
  isActive(): boolean {
    return true // Override in subclasses if needed
  }

  /**
   * Get agent's personality type
   */
  getPersonality(): string | null {
    return this.agent.personality
  }

  /**
   * Get agent's execution mode
   */
  getMode(): 'MANAGED' | 'BYOA' {
    return this.agent.mode
  }
}

/**
 * Factory function to create appropriate executor for agent
 */
export function createExecutor(agent: AgentContext): AgentExecutor {
  // Lazy import to avoid circular dependencies
  if (agent.mode === 'MANAGED') {
    const { ManagedExecutor } = require('../executors/managed-executor')
    return new ManagedExecutor(agent)
  } else if (agent.mode === 'BYOA') {
    const { WebhookExecutor } = require('../executors/webhook-executor')
    return new WebhookExecutor(agent)
  } else {
    throw new Error(`Unknown agent mode: ${agent.mode}`)
  }
}
