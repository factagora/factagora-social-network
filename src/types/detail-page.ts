// Unified types for both Prediction and Claim detail pages

// ============================================================================
// POSITIONS
// ============================================================================

/** Prediction positions */
export type PredictionPosition = 'YES' | 'NO' | 'NEUTRAL'

/** Claim positions */
export type ClaimPosition = 'TRUE' | 'FALSE' | 'UNCERTAIN'

/** Superset covering both page types */
export type UnifiedPosition = PredictionPosition | ClaimPosition

// ============================================================================
// EVIDENCE
// ============================================================================

export interface UnifiedEvidence {
  type: string
  title: string
  description?: string
  url?: string
  reliability?: number
}

// ============================================================================
// REACT CYCLE (AI Agent thinking process)
// ============================================================================

export interface UnifiedReactCycle {
  id: string
  initialReasoning: string
  hypothesis: string
  informationNeeds: string[]
  actions: { type: string; query?: string; result?: any }[]
  evidenceGathered: UnifiedEvidence[]
  observations: { observation: string; relevance?: number }[]
  synthesisReasoning: string
  counterArgumentsConsidered: string[]
  executionTimeMs: number
}

// ============================================================================
// UNIFIED ARGUMENT
// ============================================================================

export interface UnifiedArgument {
  id: string
  entityId: string // predictionId or claimId

  // Author
  authorId: string
  authorType: 'AI_AGENT' | 'HUMAN'
  authorName: string

  // Content
  position: UnifiedPosition
  content: string
  evidence: UnifiedEvidence[]
  reasoning: string | null
  confidence: number

  // Reddit-style voting
  upvotes: number
  downvotes: number
  score: number

  // Counts
  replyCount: number

  // Timestamps
  createdAt: string

  // Prediction-only fields (optional)
  roundNumber?: number
  qualityScore?: number
  supportCount?: number
  counterCount?: number
  reactCycle?: UnifiedReactCycle | null
}

// ============================================================================
// UI HELPERS
// ============================================================================

const POSITION_COLORS: Record<string, string> = {
  YES: 'text-green-400 bg-green-500/10 border-green-500/30',
  NO: 'text-red-400 bg-red-500/10 border-red-500/30',
  NEUTRAL: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  TRUE: 'text-green-400 bg-green-500/10 border-green-500/30',
  FALSE: 'text-red-400 bg-red-500/10 border-red-500/30',
  UNCERTAIN: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
}

export function getPositionColor(position: string): string {
  return POSITION_COLORS[position] || 'text-slate-400 bg-slate-500/10 border-slate-500/30'
}

export function getAgentIcon(name: string): string {
  if (name.includes('Skeptic')) return '🤔'
  if (name.includes('Optimist')) return '😊'
  if (name.includes('Data') || name.includes('Analyst')) return '📊'
  return '🤖'
}
