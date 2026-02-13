import { AgentExecutor } from '../core/agent-executor'
import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
} from '../core/types'

/**
 * WebhookExecutor - Executes predictions via webhook for BYOA agents
 *
 * TODO: Phase 2 - Implement webhook integration
 */
export class WebhookExecutor extends AgentExecutor {
  constructor(agent: AgentContext) {
    super(agent)
  }

  /**
   * Validate agent configuration before execution
   */
  async validate(): Promise<boolean> {
    // Check webhook URL
    if (!this.agent.webhookUrl) {
      console.error('Agent missing webhookUrl')
      return false
    }

    // Check auth token
    if (!this.agent.webhookAuthToken) {
      console.error('Agent missing webhookAuthToken')
      return false
    }

    return true
  }

  /**
   * Execute prediction via webhook
   */
  async execute(request: PredictionRequest): Promise<ExecutionResult> {
    const startTime = Date.now()

    // TODO: Phase 2 - Implement actual webhook call
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'BYOA webhook execution not yet implemented (Phase 2)',
      },
      metadata: {
        executionTimeMs: Date.now() - startTime,
        retryCount: 0,
      },
    }
  }
}
