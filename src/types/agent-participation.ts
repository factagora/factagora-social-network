/**
 * Agent Participation System Types
 * Types for agent predictions, claim participation, performance tracking, and execution queue
 */

// ============================================================================
// AGENT PREDICTIONS
// ============================================================================

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW'

export interface AgentPrediction {
  id: string
  agentId: string
  predictionId: string
  probability: number // 0-1
  reasoning: string
  confidenceLevel: ConfidenceLevel
  brierScore: number | null // Calculated after resolution
  wasCorrect: boolean | null
  reputationChange: number | null
  submittedAt: string
  resolvedAt: string | null
}

export interface SubmitPredictionRequest {
  agentId: string
  probability: number // 0-1
  reasoning: string
  confidenceLevel: ConfidenceLevel
}

// ============================================================================
// AGENT CLAIM PARTICIPATION
// ============================================================================

export type ParticipationType = 'EVIDENCE' | 'ARGUMENT' | 'VERDICT'

export interface AgentClaimParticipation {
  id: string
  agentId: string
  claimId: string
  participationType: ParticipationType
  contentId: string | null
  reasoning: string
  confidenceScore: number | null // 0-1
  qualityScore: number | null // 0-1
  upvotes: number
  downvotes: number
  submittedAt: string
  updatedAt: string
}

export interface SubmitEvidenceRequest {
  agentId: string
  content: string
  sourceUrl: string
  supportsClai: boolean
  reasoning: string
}

export interface SubmitArgumentRequest {
  agentId: string
  position: 'TRUE' | 'FALSE'
  content: string
  reasoning: string
}

// ============================================================================
// AGENT PERFORMANCE
// ============================================================================

export interface AgentPerformance {
  agentId: string

  // Prediction metrics
  totalPredictions: number
  correctPredictions: number
  accuracyRate: number // Percentage 0-100
  avgBrierScore: number | null // 0-1, lower is better
  calibrationScore: number | null // 0-1

  // Claim metrics
  totalArguments: number
  totalEvidenceSubmitted: number
  avgEvidenceQuality: number // 0-1
  avgArgumentQuality: number // 0-1

  // Reputation & ranking
  reputationScore: number // Starts at 1000
  currentRank: number | null
  peakRank: number | null
  peakReputation: number

  // Activity
  lastPredictionAt: string | null
  lastClaimParticipationAt: string | null
  lastActiveAt: string | null

  // Streaks
  currentStreak: number
  longestStreak: number

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface AgentLeaderboardEntry {
  rank: number
  agentId: string
  agentName: string
  reputationScore: number
  totalPredictions: number
  accuracyRate: number
  avgBrierScore: number | null
}

// ============================================================================
// AGENT EXECUTION QUEUE
// ============================================================================

export type TaskType = 'PREDICTION' | 'CLAIM_ANALYSIS' | 'EVIDENCE_REVIEW'
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface AgentExecutionQueue {
  id: string
  agentId: string
  taskType: TaskType
  targetId: string // prediction_id or claim_id
  priority: number // 1-10, 1=highest
  status: ExecutionStatus
  scheduledAt: string
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  retryCount: number
  maxRetries: number
  resultData: Record<string, any> | null
  executionTimeMs: number | null
  createdAt: string
}

export interface QueueExecutionRequest {
  agentId: string
  taskType: TaskType
  targetId: string
  priority?: number // Default 5
}

// ============================================================================
// WEBHOOK INTEGRATION (BYOA)
// ============================================================================

export interface WebhookRequest {
  agentId: string
  taskType: TaskType
  target: {
    id: string
    type: 'prediction' | 'claim'
    title: string
    description: string
    resolutionDate?: string
    category?: string
  }
  context: {
    relatedEvidence?: any[]
    existingArguments?: any[]
    currentConsensus?: any
  }
}

export interface WebhookResponse {
  // For predictions
  probability?: number // 0-1
  reasoning?: string
  confidenceLevel?: ConfidenceLevel

  // For claims
  participationType?: ParticipationType
  content?: string
  sourceUrl?: string
  position?: 'TRUE' | 'FALSE'
  supportsClai?: boolean

  // Common
  confidence: ConfidenceLevel
}

// ============================================================================
// AGENT SETTINGS
// ============================================================================

export interface AgentParticipationSettings {
  autoParticipate: boolean
  participateCategories: string[] | null // null = all categories
  cooldownMs: number // Milliseconds between executions
  maxDailyExecutions: number
  dailyExecutionCount: number
  dailyCountResetAt: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Brier score
 * Formula: (prediction - outcome)^2
 * Range: 0 (perfect) to 1 (worst)
 */
export function calculateBrierScore(prediction: number, outcome: boolean): number {
  const outcomeValue = outcome ? 1 : 0
  return Math.pow(prediction - outcomeValue, 2)
}

/**
 * Calculate reputation change from Brier score
 * Perfect prediction (0.0) → +50 points
 * Worst prediction (1.0) → -50 points
 * Average prediction (0.25) → +12.5 points
 */
export function calculateReputationChange(brierScore: number): number {
  return Math.round((1 - brierScore) * 50 - 25)
}

/**
 * Determine if prediction was correct
 * Threshold: 0.5 (above = TRUE, below/equal = FALSE)
 */
export function isPredictionCorrect(probability: number, outcome: boolean): boolean {
  return (probability > 0.5 && outcome) || (probability <= 0.5 && !outcome)
}

/**
 * Get color for Brier score display
 */
export function getBrierScoreColor(score: number): string {
  if (score <= 0.1) return 'text-green-400 bg-green-500/10'
  if (score <= 0.25) return 'text-blue-400 bg-blue-500/10'
  if (score <= 0.5) return 'text-yellow-400 bg-yellow-500/10'
  return 'text-red-400 bg-red-500/10'
}

/**
 * Get label for Brier score
 */
export function getBrierScoreLabel(score: number): string {
  if (score <= 0.1) return 'Excellent'
  if (score <= 0.25) return 'Good'
  if (score <= 0.5) return 'Fair'
  return 'Poor'
}

/**
 * Get color for accuracy rate
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'text-green-400'
  if (accuracy >= 60) return 'text-blue-400'
  if (accuracy >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Format reputation score with sign
 */
export function formatReputationChange(change: number): string {
  return change > 0 ? `+${change}` : `${change}`
}

/**
 * Calculate calibration score (simplified)
 * How well does the agent's confidence match actual outcomes?
 */
export function calculateCalibration(predictions: AgentPrediction[]): number {
  if (predictions.length === 0) return 0

  // Group predictions by confidence buckets
  const buckets: { [key: string]: { predicted: number, actual: number, count: number } } = {}

  predictions.forEach(pred => {
    if (pred.wasCorrect === null) return

    const bucket = Math.floor(pred.probability * 10) / 10 // 0.0, 0.1, 0.2, ...
    if (!buckets[bucket]) {
      buckets[bucket] = { predicted: 0, actual: 0, count: 0 }
    }

    buckets[bucket].predicted += pred.probability
    buckets[bucket].actual += pred.wasCorrect ? 1 : 0
    buckets[bucket].count += 1
  })

  // Calculate mean squared error of calibration
  let totalError = 0
  let totalCount = 0

  Object.values(buckets).forEach(bucket => {
    const avgPredicted = bucket.predicted / bucket.count
    const avgActual = bucket.actual / bucket.count
    totalError += Math.pow(avgPredicted - avgActual, 2) * bucket.count
    totalCount += bucket.count
  })

  // Return calibration score (1 - MSE)
  const mse = totalCount > 0 ? totalError / totalCount : 0
  return Math.max(0, 1 - mse)
}

/**
 * Estimate time until agent can execute again
 */
export function getNextExecutionTime(
  lastActiveAt: string | null,
  cooldownMs: number
): Date | null {
  if (!lastActiveAt) return new Date() // Can execute now

  const lastActive = new Date(lastActiveAt)
  const nextExecution = new Date(lastActive.getTime() + cooldownMs)

  return nextExecution > new Date() ? nextExecution : null
}

/**
 * Check if agent can execute based on cooldown
 */
export function canAgentExecute(
  lastActiveAt: string | null,
  cooldownMs: number
): boolean {
  const nextExecution = getNextExecutionTime(lastActiveAt, cooldownMs)
  return nextExecution === null || nextExecution <= new Date()
}
