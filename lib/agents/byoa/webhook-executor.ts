// BYOA agent executor using webhooks

import { AgentExecutor } from '../core/agent-executor'
import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
} from '../core/types'

/**
 * Executor for BYOA agents (call user's webhook)
 */
export class WebhookExecutor extends AgentExecutor {
  constructor(agent: AgentContext) {
    super(agent)
  }

  /**
   * Execute agent by calling webhook
   */
  async execute(request: PredictionRequest): Promise<ExecutionResult> {
    const startTime = Date.now()
    let retryCount = 0
    const maxRetries = 2
    const timeoutMs = 30000 // 30 seconds

    if (!this.agent.webhookUrl || !this.agent.webhookAuthToken) {
      return {
        success: false,
        error: {
          code: 'INVALID_CONFIGURATION',
          message: 'BYOA agent missing webhook URL or auth token',
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          retryCount: 0,
        },
      }
    }

    // Build webhook payload
    const payload = {
      predictionId: request.predictionId,
      title: request.title,
      description: request.description,
      category: request.category,
      deadline: request.deadline,
      roundNumber: request.roundNumber,
      existingArguments: request.existingArguments || [],
      metadata: request.metadata,
    }

    // Execute with retries
    while (retryCount < maxRetries) {
      try {
        // Call webhook with timeout
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), timeoutMs)

        const response = await fetch(this.agent.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.agent.webhookAuthToken}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeout)

        // Check response status
        if (!response.ok) {
          throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
        }

        // Parse response
        const data = await response.json()

        // Validate response format
        if (!this.validateWebhookResponse(data)) {
          throw new Error('Invalid webhook response format')
        }

        // Success!
        return {
          success: true,
          response: {
            position: data.position,
            confidence: data.confidence,
            reactCycle: data.reactCycle,
            reasoning: data.reasoning,
            limitations: data.limitations,
            executionTimeMs: data.executionTimeMs || Date.now() - startTime,
          },
          metadata: {
            executionTimeMs: Date.now() - startTime,
            retryCount,
          },
        }
      } catch (error) {
        retryCount++

        // Check if it's a timeout
        const isTimeout = error instanceof Error && error.name === 'AbortError'

        if (retryCount >= maxRetries) {
          return {
            success: false,
            error: {
              code: isTimeout ? 'WEBHOOK_TIMEOUT' : 'WEBHOOK_ERROR',
              message:
                error instanceof Error ? error.message : 'Webhook call failed',
              details: error,
            },
            metadata: {
              executionTimeMs: Date.now() - startTime,
              retryCount,
            },
          }
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1))
        )
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
   * Validate webhook response format
   */
  private validateWebhookResponse(data: any): boolean {
    // Check required fields
    if (!data.position || !['YES', 'NO', 'NEUTRAL'].includes(data.position)) {
      return false
    }

    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      return false
    }

    if (!data.reactCycle || typeof data.reactCycle !== 'object') {
      return false
    }

    const cycle = data.reactCycle

    // Check ReAct cycle structure
    if (!cycle.initialThought || !cycle.synthesisThought) {
      return false
    }

    if (!Array.isArray(cycle.actions) || cycle.actions.length === 0) {
      return false
    }

    if (!Array.isArray(cycle.observations) || cycle.observations.length === 0) {
      return false
    }

    if (!Array.isArray(cycle.evidence) || cycle.evidence.length === 0) {
      return false
    }

    return true
  }

  /**
   * Validate agent configuration
   */
  async validate(): Promise<boolean> {
    try {
      if (!this.agent.webhookUrl || !this.agent.webhookAuthToken) {
        console.error('BYOA agent missing webhook configuration:', this.agent.id)
        return false
      }

      // Optional: Test webhook connection
      // For now just check URL format
      try {
        new URL(this.agent.webhookUrl)
      } catch {
        console.error('Invalid webhook URL:', this.agent.webhookUrl)
        return false
      }

      return true
    } catch (error) {
      console.error('Validation error for BYOA agent:', error)
      return false
    }
  }
}
