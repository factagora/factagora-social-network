import Anthropic from '@anthropic-ai/sdk'
import { AgentExecutor } from '../core/agent-executor'
import type {
  AgentContext,
  PredictionRequest,
  ExecutionResult,
  AgentResponse,
} from '../core/types'
import type { PersonalityType, Evidence, Action } from '@/src/types/debate'

/**
 * Personality-based system prompts for managed agents
 */
const PERSONALITY_PROMPTS: Record<PersonalityType, string> = {
  SKEPTIC: `You are The Skeptic - a critical thinker who questions assumptions and demands evidence.

Your approach:
- Challenge claims with rigorous scrutiny
- Demand concrete evidence and data
- Identify logical fallacies and weak reasoning
- Consider alternative explanations
- Assign conservative confidence scores (prefer caution)

Core traits:
- Rigorous evidence standards
- Identifies weaknesses and gaps
- Conservative probability assessments
- Questions underlying assumptions`,

  OPTIMIST: `You are The Optimist - forward-thinking and possibility-focused.

Your approach:
- Identify positive signals and opportunities
- Consider best-case scenarios alongside realistic ones
- Look for emerging trends and innovation
- Balance optimism with factual analysis
- Encourage bold predictions when evidence supports them

Core traits:
- Recognizes potential and opportunities
- Considers innovation and disruption
- Balanced enthusiasm with analysis
- Forward-looking perspective`,

  DATA_ANALYST: `You are The Data Analyst - numbers-driven and pattern-focused.

Your approach:
- Prioritize quantitative data and statistics
- Identify trends, patterns, and correlations
- Use historical data to inform predictions
- Apply statistical reasoning
- Demand numerical evidence

Core traits:
- Data-driven decision making
- Statistical pattern recognition
- Quantitative analysis focus
- Historical trend consideration`,

  DOMAIN_EXPERT: `You are The Domain Expert - deep specialist knowledge.

Your approach:
- Apply domain-specific expertise and context
- Consider industry-specific factors
- Reference historical precedents in the field
- Evaluate technical feasibility
- Provide nuanced, expert-level analysis

Core traits:
- Deep domain knowledge
- Industry context awareness
- Technical expertise
- Historical precedent consideration`,

  CONTRARIAN: `You are The Contrarian - challenges consensus and conventional wisdom.

Your approach:
- Question popular assumptions
- Identify overlooked factors
- Consider contrarian scenarios
- Challenge groupthink
- Look for what others miss

Core traits:
- Challenges conventional wisdom
- Identifies blind spots
- Independent thinking
- Contrarian perspective`,

  MEDIATOR: `You are The Mediator - balanced and synthesis-focused.

Your approach:
- Synthesize multiple viewpoints
- Balance competing evidence
- Find middle ground in uncertainty
- Consider diverse perspectives
- Integrate conflicting data points

Core traits:
- Balanced perspective
- Synthesizes viewpoints
- Considers multiple angles
- Diplomatic analysis`,
}

/**
 * ReAct prompt template for structured reasoning
 */
const REACT_TEMPLATE = `
You must analyze using the ReAct (Reason + Act) framework.

Respond with valid JSON only (no markdown, no extra text):

{
  "initialThought": "Your initial analysis of the claim and key factors",
  "actions": [
    {
      "type": "RESEARCH" | "ANALYZE" | "CALCULATE" | "COMPARE",
      "description": "What you're investigating",
      "reasoning": "Why this action matters"
    }
  ],
  "observations": [
    "Key finding 1",
    "Key finding 2"
  ],
  "synthesisThought": "Integration of observations and reasoning",
  "evidence": [
    {
      "type": "DATA" | "EXPERT_OPINION" | "HISTORICAL" | "LOGICAL",
      "content": "The evidence itself",
      "source": "Where this comes from",
      "strength": 0.0-1.0,
      "supporting": true | false
    }
  ],
  "position": "<POSITION>",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of conclusion"
}

CRITICAL: Respond with ONLY the JSON object. No markdown code blocks, no extra text.
`

/**
 * Valid positions by prediction type
 */
function getValidPositions(predictionType?: string): string[] {
  if (predictionType === 'CLAIM') {
    return ['TRUE', 'FALSE', 'UNCERTAIN']
  }
  return ['YES', 'NO', 'NEUTRAL']
}

/**
 * Build the ReAct template with correct position values
 */
function buildReActTemplate(predictionType?: string): string {
  const positions = getValidPositions(predictionType)
  return REACT_TEMPLATE.replace('<POSITION>', positions.map(p => `"${p}"`).join(' | '))
}

/**
 * ManagedExecutor - Executes predictions using Anthropic Claude API
 * with personality-based reasoning
 */
export class ManagedExecutor extends AgentExecutor {
  private anthropic: Anthropic

  constructor(agent: AgentContext) {
    super(agent)

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    this.anthropic = new Anthropic({ apiKey })
  }

  /**
   * Validate agent configuration before execution
   */
  async validate(): Promise<boolean> {
    try {
      // Check required fields
      if (!this.agent.personality) {
        console.error('Agent missing personality')
        return false
      }

      // Check API key
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not configured')
        return false
      }

      return true
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  /**
   * Execute prediction with personality-based reasoning
   */
  async execute(request: PredictionRequest): Promise<ExecutionResult> {
    const startTime = Date.now()
    let retryCount = 0

    try {
      // Validate before execution
      const isValid = await this.validate()
      if (!isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Agent configuration is invalid',
          },
          metadata: {
            executionTimeMs: Date.now() - startTime,
            retryCount,
          },
        }
      }

      // Get personality-specific system prompt
      const systemPrompt = this.buildSystemPrompt(request.predictionType)

      // Build user prompt with prediction context
      const userPrompt = this.buildUserPrompt(request)

      // Call Anthropic API
      const response = await this.anthropic.messages.create({
        model: this.agent.model || 'claude-sonnet-4-5',
        max_tokens: 4096,
        temperature: this.agent.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })

      // Extract text from response
      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse JSON response
      const agentResponse = this.parseResponse(content.text, request.predictionType)

      // Build execution result
      const result: ExecutionResult = {
        success: true,
        response: agentResponse,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          retryCount,
          llmProvider: 'claude',
          llmModel: this.agent.model || 'claude-sonnet-4-5',
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        },
      }

      return result
    } catch (error) {
      console.error('ManagedExecutor error:', error)

      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          retryCount,
        },
      }
    }
  }

  /**
   * Build system prompt with personality
   */
  private buildSystemPrompt(predictionType?: string): string {
    const personality = this.agent.personality || 'DATA_ANALYST'
    const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.DATA_ANALYST
    const reactTemplate = buildReActTemplate(predictionType)

    // Use custom system prompt if provided
    if (this.agent.systemPrompt) {
      return `${this.agent.systemPrompt}\n\n${reactTemplate}`
    }

    const taskDescription = predictionType === 'CLAIM'
      ? 'You are fact-checking claims for Factagora, a platform for AI-powered fact verification.\nYour goal is to evaluate whether claims are TRUE, FALSE, or UNCERTAIN based on available evidence.'
      : 'You are analyzing predictions for Factagora, a platform for AI-powered prediction markets.\nYour goal is to provide accurate, well-reasoned predictions based on available information.'

    return `${personalityPrompt}

${reactTemplate}

${taskDescription}`
  }

  /**
   * Build user prompt with prediction context
   */
  private buildUserPrompt(request: PredictionRequest): string {
    const isClaim = request.predictionType === 'CLAIM'

    let prompt = isClaim
      ? `Fact-check this claim:

**Claim:** ${request.title}

**Context:**
${request.description}
`
      : `Analyze this prediction:

**Title:** ${request.title}

**Description:**
${request.description}
`

    // Add resolution criteria if available
    if (request.metadata?.resolutionCriteria) {
      prompt += `\n**Resolution Criteria:**
${request.metadata.resolutionCriteria}
`
    }

    // Add deadline
    prompt += `\n**Deadline:** ${new Date(request.deadline).toLocaleDateString()}
`

    // Add category if available
    if (request.category) {
      prompt += `\n**Category:** ${request.category}
`
    }

    // Add source links if available
    if (request.metadata?.sourceLinks && request.metadata.sourceLinks.length > 0) {
      prompt += `\n**Sources:**
${request.metadata.sourceLinks.map(link => `- ${link}`).join('\n')}
`
    }

    // Add existing arguments if this is round 2+
    if (request.existingArguments && request.existingArguments.length > 0) {
      prompt += `\n**Previous Round Arguments:**
${request.existingArguments.map(arg =>
  `- ${arg.agentName} (${arg.position}, confidence: ${arg.confidence}): ${arg.reasoning}`
).join('\n')}
`
    }

    if (isClaim) {
      prompt += `\nCRITICAL: "position" must be exactly "TRUE", "FALSE", or "UNCERTAIN".
- TRUE: The claim is factually accurate based on available evidence.
- FALSE: The claim is factually inaccurate or misleading.
- UNCERTAIN: There is insufficient evidence to determine the claim's veracity.

Provide your fact-check analysis as a JSON object following the ReAct framework.`
    } else {
      prompt += `\nProvide your analysis as a JSON object following the ReAct framework.`
    }

    return prompt
  }

  /**
   * Parse JSON response from Claude
   */
  private parseResponse(text: string, predictionType?: string): AgentResponse {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '')
      }

      const parsed = JSON.parse(cleanText)

      // Validate required fields
      if (!parsed.position || !parsed.confidence) {
        throw new Error('Missing required fields: position or confidence')
      }

      // Validate position based on prediction type
      const validPositions = getValidPositions(predictionType)
      if (!validPositions.includes(parsed.position)) {
        throw new Error(`Invalid position: ${parsed.position}. Must be one of: ${validPositions.join(', ')}`)
      }

      // Validate confidence
      const confidence = parseFloat(parsed.confidence)
      if (confidence < 0 || confidence > 1) {
        throw new Error(`Invalid confidence: ${confidence}`)
      }

      // Build AgentResponse
      const response: AgentResponse = {
        position: parsed.position,
        confidence,
        reactCycle: {
          initialThought: parsed.initialThought || '',
          actions: parsed.actions || [],
          observations: parsed.observations || [],
          synthesisThought: parsed.synthesisThought || '',
          evidence: parsed.evidence || [],
        },
        reasoning: parsed.reasoning,
        executionTimeMs: 0, // Will be set by caller
      }

      return response
    } catch (error) {
      console.error('Failed to parse response:', error)
      console.error('Raw text:', text)
      throw new Error(`Failed to parse agent response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}
