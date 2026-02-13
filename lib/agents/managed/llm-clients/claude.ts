// Anthropic Claude API client

import Anthropic from '@anthropic-ai/sdk'

export interface ClaudeRequest {
  system: string
  user: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ClaudeResponse {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
  model: string
  stopReason: string
}

/**
 * Claude API client for agent execution
 */
export class ClaudeClient {
  private client: Anthropic
  private defaultModel: string

  constructor(apiKey: string, defaultModel: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({
      apiKey,
    })
    this.defaultModel = defaultModel
  }

  /**
   * Generate completion using Claude
   */
  async generate(request: ClaudeRequest): Promise<ClaudeResponse> {
    const response = await this.client.messages.create({
      model: request.model || this.defaultModel,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.5,
      system: request.system,
      messages: [
        {
          role: 'user',
          content: request.user,
        },
      ],
    })

    // Extract text content
    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('\n')

    return {
      content: textContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: response.model,
      stopReason: response.stop_reason || 'unknown',
    }
  }

  /**
   * Test API connection
   */
  async test(): Promise<boolean> {
    try {
      await this.generate({
        system: 'You are a test assistant.',
        user: 'Say "OK" if you can read this.',
        maxTokens: 10,
      })
      return true
    } catch (error) {
      console.error('Claude API test failed:', error)
      return false
    }
  }
}
