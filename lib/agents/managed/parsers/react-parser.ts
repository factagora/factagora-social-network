// Parse LLM output into ReAct cycle structure

import type { ParseResult, ValidationResult } from '../../core/types'
import type { Evidence, Action } from '@/src/types/debate'

/**
 * Parses LLM text output into structured ReAct cycle
 */
export class ReactParser {
  /**
   * Parse LLM output and validate
   */
  parse(llmOutput: string, allowedPositions?: string[]): ParseResult {
    try {
      // Extract JSON from markdown code blocks or plain text
      const jsonStr = this.extractJSON(llmOutput)
      if (!jsonStr) {
        return {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Could not find valid JSON in LLM output',
            rawOutput: llmOutput.slice(0, 500),
          },
        }
      }

      // Parse JSON
      const parsed = JSON.parse(jsonStr)

      // Validate structure
      const validation = this.validate(parsed, allowedPositions)
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.errors.map((e) => e.message).join('; '),
            rawOutput: jsonStr.slice(0, 500),
          },
        }
      }

      // Extract fields
      return {
        success: true,
        position: parsed.position,
        confidence: parsed.confidence,
        reactCycle: {
          initialThought: parsed.reactCycle.initialThought,
          actions: parsed.reactCycle.actions,
          observations: parsed.reactCycle.observations,
          synthesisThought: parsed.reactCycle.synthesisThought,
          evidence: parsed.reactCycle.evidence,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          rawOutput: llmOutput.slice(0, 500),
        },
      }
    }
  }

  /**
   * Extract JSON from markdown code blocks or plain text
   */
  private extractJSON(text: string): string | null {
    // Try to find JSON in markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim()
    }

    // Try to find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }

    return null
  }

  /**
   * Validate ReAct cycle structure
   */
  private validate(parsed: any, allowedPositions?: string[]): ValidationResult {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []

    // Check position
    const validPositions = allowedPositions?.length ? allowedPositions : ['YES', 'NO', 'NEUTRAL']
    if (!parsed.position || !validPositions.includes(parsed.position)) {
      errors.push({
        field: 'position',
        message: `Position must be exactly one of: ${validPositions.map(p => `"${p}"`).join(', ')}`,
        severity: 'error',
      })
    }

    // Check confidence
    if (typeof parsed.confidence !== 'number') {
      errors.push({
        field: 'confidence',
        message: 'Confidence must be a number',
        severity: 'error',
      })
    } else if (parsed.confidence < 0 || parsed.confidence > 1) {
      errors.push({
        field: 'confidence',
        message: 'Confidence must be between 0.0 and 1.0',
        severity: 'error',
      })
    } else if (parsed.confidence > 0.95) {
      warnings.push({
        field: 'confidence',
        message: 'Very high confidence (>0.95) - ensure exceptional evidence',
      })
    }

    // Check reactCycle exists
    if (!parsed.reactCycle || typeof parsed.reactCycle !== 'object') {
      errors.push({
        field: 'reactCycle',
        message: 'reactCycle object is required',
        severity: 'error',
      })
      return { valid: false, errors, warnings }
    }

    const cycle = parsed.reactCycle

    // Check initialThought
    if (!cycle.initialThought || typeof cycle.initialThought !== 'string') {
      errors.push({
        field: 'reactCycle.initialThought',
        message: 'initialThought must be a non-empty string',
        severity: 'error',
      })
    } else {
      const len = cycle.initialThought.length
      if (len < 20 || len > 2000) {
        errors.push({
          field: 'reactCycle.initialThought',
          message: 'initialThought must be 20-2000 characters',
          severity: 'error',
        })
      }
    }

    // Check actions
    if (!Array.isArray(cycle.actions)) {
      errors.push({
        field: 'reactCycle.actions',
        message: 'actions must be an array',
        severity: 'error',
      })
    } else {
      if (cycle.actions.length === 0) {
        errors.push({
          field: 'reactCycle.actions',
          message: 'At least 1 action is required',
          severity: 'error',
        })
      } else if (cycle.actions.length > 10) {
        errors.push({
          field: 'reactCycle.actions',
          message: 'Maximum 10 actions allowed',
          severity: 'error',
        })
      }

      // Validate each action
      cycle.actions.forEach((action: any, idx: number) => {
        if (!action.type || !action.query || !action.result) {
          errors.push({
            field: `reactCycle.actions[${idx}]`,
            message: 'Each action must have type, query, and result',
            severity: 'error',
          })
        }
      })
    }

    // Check observations
    if (!Array.isArray(cycle.observations)) {
      errors.push({
        field: 'reactCycle.observations',
        message: 'observations must be an array',
        severity: 'error',
      })
    } else {
      if (cycle.observations.length === 0) {
        errors.push({
          field: 'reactCycle.observations',
          message: 'At least 1 observation is required',
          severity: 'error',
        })
      } else if (cycle.observations.length > 20) {
        errors.push({
          field: 'reactCycle.observations',
          message: 'Maximum 20 observations allowed',
          severity: 'error',
        })
      }
    }

    // Check synthesisThought
    if (!cycle.synthesisThought || typeof cycle.synthesisThought !== 'string') {
      errors.push({
        field: 'reactCycle.synthesisThought',
        message: 'synthesisThought must be a non-empty string',
        severity: 'error',
      })
    } else {
      const len = cycle.synthesisThought.length
      if (len < 20 || len > 2000) {
        errors.push({
          field: 'reactCycle.synthesisThought',
          message: 'synthesisThought must be 20-2000 characters',
          severity: 'error',
        })
      }
    }

    // Check evidence
    if (!Array.isArray(cycle.evidence)) {
      errors.push({
        field: 'reactCycle.evidence',
        message: 'evidence must be an array',
        severity: 'error',
      })
    } else {
      if (cycle.evidence.length === 0) {
        errors.push({
          field: 'reactCycle.evidence',
          message: 'At least 1 evidence item is required',
          severity: 'error',
        })
      } else if (cycle.evidence.length > 10) {
        errors.push({
          field: 'reactCycle.evidence',
          message: 'Maximum 10 evidence items allowed',
          severity: 'error',
        })
      } else if (cycle.evidence.length < 3) {
        warnings.push({
          field: 'reactCycle.evidence',
          message: 'Consider providing at least 3 evidence items for stronger support',
        })
      }

      // Validate each evidence
      cycle.evidence.forEach((ev: any, idx: number) => {
        if (!ev.type || !ev.title) {
          errors.push({
            field: `reactCycle.evidence[${idx}]`,
            message: 'Each evidence must have type and title',
            severity: 'error',
          })
        }
        if (!['link', 'data', 'citation'].includes(ev.type)) {
          errors.push({
            field: `reactCycle.evidence[${idx}].type`,
            message: 'Evidence type must be "link", "data", or "citation"',
            severity: 'error',
          })
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}
