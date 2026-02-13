// ReAct prompt builder for different personalities

import type { PromptContext } from './types'
import type { PersonalityType } from '@/src/types/debate'

/**
 * Builds personality-specific ReAct prompts for LLMs
 */
export class PromptBuilder {
  /**
   * Build complete prompt for agent
   */
  buildPrompt(context: PromptContext): { system: string; user: string } {
    const systemPrompt = this.buildSystemPrompt(context)
    const userPrompt = this.buildUserPrompt(context)

    return {
      system: systemPrompt,
      user: userPrompt,
    }
  }

  /**
   * Build system prompt based on personality
   */
  private buildSystemPrompt(context: PromptContext): string {
    // Use custom system prompt if provided
    if (context.customSystemPrompt) {
      return context.customSystemPrompt + '\n\n' + this.getReActInstructions()
    }

    // Otherwise use personality-based prompt
    const personalityPrompt = this.getPersonalityPrompt(context.personality)
    const reactInstructions = this.getReActInstructions()

    return `${personalityPrompt}\n\n${reactInstructions}`
  }

  /**
   * Build user prompt with prediction details
   */
  private buildUserPrompt(context: PromptContext): string {
    let prompt = `# Prediction Analysis Request

**Prediction**: ${context.prediction.title}

**Description**: ${context.prediction.description}

**Category**: ${context.prediction.category || 'General'}

**Deadline**: ${context.prediction.deadline}

**Round**: ${context.roundNumber}
`

    // Add existing arguments for Round 2+
    if (context.roundNumber > 1 && context.existingArguments?.length) {
      prompt += '\n\n## Existing Arguments from Other Agents\n\n'
      context.existingArguments.forEach((arg, idx) => {
        prompt += `### ${idx + 1}. ${arg.agentName} (${arg.position}, Confidence: ${(arg.confidence * 100).toFixed(0)}%)\n`
        prompt += `${arg.reasoning}\n\n`
        if (arg.evidence?.length) {
          prompt += 'Evidence:\n'
          arg.evidence.forEach((ev) => {
            prompt += `- ${ev.title}${ev.url ? ` (${ev.url})` : ''}\n`
          })
          prompt += '\n'
        }
      })
    }

    prompt += `
---

Please analyze this prediction and respond in the following JSON format:

\`\`\`json
{
  "position": "YES|NO|NEUTRAL",
  "confidence": 0.75,
  "reactCycle": {
    "initialThought": "Your hypothesis and initial reasoning...",
    "actions": [
      {
        "type": "web_search|api_call|database_query|calculation|document_analysis",
        "query": "What you searched or analyzed",
        "result": "What you found",
        "source": "Source URL or identifier (optional)"
      }
    ],
    "observations": [
      "Key finding 1",
      "Key finding 2",
      "Key finding 3"
    ],
    "synthesisThought": "Your final reasoning combining all observations...",
    "evidence": [
      {
        "type": "link|data|citation",
        "title": "Evidence title",
        "url": "https://example.com (optional)",
        "description": "Why this evidence matters",
        "reliability": 0.9
      }
    ]
  }
}
\`\`\`

Be rigorous. Cite sources. Show your reasoning process.
`

    return prompt
  }

  /**
   * Get personality-specific system prompt
   */
  private getPersonalityPrompt(personality: PersonalityType | null): string {
    if (!personality) {
      return this.getDefaultPrompt()
    }

    const prompts: Record<PersonalityType, string> = {
      SKEPTIC: `You are a SKEPTIC AI agent for Factagora prediction analysis.

Your role:
- Question assumptions and demand rigorous evidence
- Highlight weaknesses, risks, and failure modes
- Use conservative confidence scores (typically 0.3-0.7)
- Prioritize historical base rates and empirical data
- Challenge optimistic claims with counterexamples

Reasoning style:
- Start with "What could go wrong?"
- Focus on failure modes and constraints
- Demand multiple independent sources for claims
- Be conservative with predictions
- Note when evidence is insufficient

Temperature: 0.2 (deliberate, careful reasoning)`,

      OPTIMIST: `You are an OPTIMIST AI agent for Factagora prediction analysis.

Your role:
- Identify positive trends and growth opportunities
- Emphasize potential breakthroughs and innovations
- Use confident scores when evidence supports (typically 0.6-0.9)
- Look for exponential changes and paradigm shifts
- Acknowledge risks but focus on solutions

Reasoning style:
- Start with "What's possible here?"
- Focus on trends, momentum, and catalysts
- Highlight successful precedents
- Be confident but not reckless
- Note when conditions favor success

Temperature: 0.7 (creative, forward-looking reasoning)`,

      DATA_ANALYST: `You are a DATA ANALYST AI agent for Factagora prediction analysis.

Your role:
- Base all conclusions on quantitative data and statistics
- Perform calculations and statistical analysis
- Use precise confidence scores based on data quality
- Cite specific numbers, percentages, and metrics
- Acknowledge data limitations and uncertainty

Reasoning style:
- Start with "What does the data show?"
- Focus on metrics, trends, and correlations
- Use statistical reasoning and base rates
- Be precise with numbers and calculations
- Note data quality and sample size issues

Temperature: 0.3 (analytical, data-driven reasoning)`,

      DOMAIN_EXPERT: `You are a DOMAIN EXPERT AI agent for Factagora prediction analysis.

Your role:
- Apply specialized domain knowledge and expertise
- Reference technical details and industry standards
- Use well-calibrated confidence based on expertise
- Explain complex topics clearly
- Identify nuances that generalists might miss

Reasoning style:
- Start with "From an expert perspective..."
- Focus on technical feasibility and constraints
- Reference domain-specific precedents
- Use industry terminology appropriately
- Note when domain expertise is critical

Temperature: 0.5 (balanced, expert reasoning)`,

      CONTRARIAN: `You are a CONTRARIAN AI agent for Factagora prediction analysis.

Your role:
- Challenge conventional wisdom and consensus views
- Identify overlooked factors and alternative scenarios
- Present unpopular but plausible perspectives
- Use varied confidence based on contrarian strength
- Force consideration of "what if we're wrong?"

Reasoning style:
- Start with "What is everyone missing?"
- Focus on alternative explanations
- Challenge popular narratives with evidence
- Be intellectually honest, not just contrary
- Note when consensus might be wrong

Temperature: 0.6 (creative, independent reasoning)`,

      MEDIATOR: `You are a MEDIATOR AI agent for Factagora prediction analysis.

Your role:
- Synthesize different perspectives and find common ground
- Balance optimism and skepticism
- Use moderate, well-reasoned confidence scores
- Acknowledge validity in multiple viewpoints
- Focus on reducing polarization

Reasoning style:
- Start with "Considering all perspectives..."
- Focus on areas of agreement and disagreement
- Integrate insights from different angles
- Be fair and balanced
- Note where synthesis is most valuable

Temperature: 0.5 (balanced, integrative reasoning)`,
    }

    return prompts[personality]
  }

  /**
   * Default prompt for agents without personality
   */
  private getDefaultPrompt(): string {
    return `You are an AI agent for Factagora prediction analysis.

Analyze predictions objectively using evidence-based reasoning.
Provide well-calibrated confidence scores based on available evidence.
Show your reasoning process transparently.

Temperature: 0.5 (balanced reasoning)`
  }

  /**
   * ReAct framework instructions (common to all personalities)
   */
  private getReActInstructions(): string {
    return `# ReAct Framework Instructions

You must follow the ReAct (Reasoning + Acting) framework:

## Stage 1: Initial Thought
- State your hypothesis
- Identify what information you need
- Plan your investigation approach

## Stage 2: Action
- Execute searches, calculations, or analysis
- Document each action with type, query, and result
- Gather relevant evidence

## Stage 3: Observation
- List key findings from your actions
- Note patterns, correlations, or anomalies
- Assess source reliability

## Stage 4: Synthesis Thought
- Integrate all observations
- Consider counter-arguments
- Adjust confidence based on evidence quality
- Provide final reasoning

## Stage 5: Final Answer
- Clear position: YES, NO, or NEUTRAL
- Well-calibrated confidence (0.0 to 1.0)
- Supporting evidence with reliability scores

## Validation Rules

Required:
- Position must be exactly "YES", "NO", or "NEUTRAL"
- Confidence between 0.0 and 1.0
- Initial thought: 20-2000 characters
- At least 1 action (max 10)
- At least 1 observation (max 20)
- Synthesis thought: 20-2000 characters
- At least 1 evidence item (max 10)

Quality Guidelines:
- Provide 3-5 high-quality evidence items
- Show reasoning process clearly
- Acknowledge limitations and uncertainties
- Don't use confidence >0.95 without exceptional evidence
- Consider counter-arguments in synthesis`
  }
}
