// Core types for Agent Manager

import type {
  PersonalityType,
  AgentMode,
  Evidence,
  Action,
  ActionType,
} from '@/src/types/debate'

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Prediction request sent to agents for analysis
 */
export interface PredictionRequest {
  predictionId: string
  title: string
  description: string
  category: string | null
  deadline: string // ISO 8601
  roundNumber: number

  // Round 2+ includes previous arguments
  existingArguments?: ExistingArgument[]

  // Optional metadata
  metadata?: {
    resolutionCriteria?: string
    sourceLinks?: string[]
  }
}

export interface ExistingArgument {
  agentName: string
  position: 'YES' | 'NO' | 'NEUTRAL'
  confidence: number
  reasoning: string
  evidence?: Evidence[]
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Agent's response to prediction request
 */
export interface AgentResponse {
  // Final decision
  position: 'YES' | 'NO' | 'NEUTRAL'
  confidence: number // 0.0 to 1.0

  // ReAct cycle (for transparency)
  reactCycle: {
    initialThought: string
    actions: Action[]
    observations: string[]
    synthesisThought: string
    evidence: Evidence[]
  }

  // Optional fields
  reasoning?: string
  limitations?: string[]
  executionTimeMs?: number
}

// ============================================================================
// AGENT CONTEXT
// ============================================================================

/**
 * Agent configuration for execution
 */
export interface AgentContext {
  id: string
  name: string
  mode: AgentMode
  personality: PersonalityType | null
  temperature: number
  systemPrompt: string | null

  // MANAGED specific
  model?: string | null
  apiKeyEncrypted?: string | null

  // BYOA specific
  webhookUrl?: string | null
  webhookAuthToken?: string | null
}

// ============================================================================
// EXECUTION RESULT
// ============================================================================

/**
 * Result of agent execution with metadata
 */
export interface ExecutionResult {
  success: boolean
  response?: AgentResponse
  error?: {
    code: string
    message: string
    details?: unknown
  }
  metadata: {
    executionTimeMs: number
    retryCount: number
    llmProvider?: 'claude' | 'openai'
    llmModel?: string
    tokensUsed?: number
  }
}

// ============================================================================
// ROUND EXECUTION
// ============================================================================

/**
 * Result of executing a full debate round
 */
export interface RoundResult {
  roundNumber: number
  agentResults: Array<{
    agentId: string
    agentName: string
    result: ExecutionResult
  }>

  // Round statistics
  stats: {
    totalAgents: number
    successfulAgents: number
    failedAgents: number
    avgExecutionTimeMs: number
    positionDistribution: {
      yes: number
      no: number
      neutral: number
    }
    avgConfidence: number
    consensusScore: number // Added for convenience
  }

  // Consensus detection
  consensusScore: number // 0.0 to 1.0
  shouldTerminate: boolean
  terminationReason?: 'CONSENSUS' | 'MAX_ROUNDS' | 'DEADLINE' | 'STALEMATE' | 'ADMIN_RESOLVED'
}

// ============================================================================
// PROMPT CONTEXT
// ============================================================================

/**
 * Context for building personality-specific prompts
 */
export interface PromptContext {
  agentId: string // Added for memory loading
  personality: PersonalityType
  temperature: number
  customSystemPrompt?: string | null

  // Prediction details
  prediction: {
    title: string
    description: string
    category: string | null
    deadline: string
  }

  // Round context
  roundNumber: number
  existingArguments?: ExistingArgument[]
}

// ============================================================================
// PARSER RESULT
// ============================================================================

/**
 * Result of parsing LLM output
 */
export interface ParseResult {
  success: boolean
  reactCycle?: AgentResponse['reactCycle']
  position?: 'YES' | 'NO' | 'NEUTRAL'
  confidence?: number
  error?: {
    code: 'INVALID_JSON' | 'MISSING_FIELD' | 'VALIDATION_ERROR'
    message: string
    rawOutput?: string
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validation result for ReAct cycle
 */
export interface ValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
  warnings: Array<{
    field: string
    message: string
  }>
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Agent Manager configuration
 */
export interface AgentManagerConfig {
  // LLM API keys
  claudeApiKey?: string
  openaiApiKey?: string

  // Execution settings
  maxRetries?: number
  timeoutMs?: number
  parallelExecution?: boolean

  // Validation
  strictValidation?: boolean

  // Logging
  enableLogging?: boolean
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
}
