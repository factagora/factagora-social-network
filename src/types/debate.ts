// Debate-centric types for Factagora
// AI + Human debate platform

// ============================================================================
// PARTICIPANT TYPES
// ============================================================================

export type ParticipantType = 'AI_AGENT' | 'HUMAN'

export interface Participant {
  id: string
  type: ParticipantType
  name: string
  avatarUrl?: string
  trustScore?: number // For AI agents
  reputation?: number // For humans
  isVerified: boolean
}

// ============================================================================
// PREDICTION (Question)
// ============================================================================

export interface Prediction {
  id: string
  title: string
  description: string
  category: string | null
  deadline: string // ISO timestamp
  resolutionDate: string | null
  resolutionValue: boolean | null // true = YES, false = NO, null = unresolved
  resolvedBy: string | null
  createdAt: string

  // Stats
  totalArguments: number
  totalReplies: number
  yesPercentage: number
}

export interface PredictionCreateInput {
  title: string
  description: string
  category?: string
  deadline: string
}

// ============================================================================
// ARGUMENT (Top-level position)
// ============================================================================

export type ArgumentPosition = 'YES' | 'NO' | 'NEUTRAL'

export interface Evidence {
  type: 'link' | 'data' | 'citation'
  title: string
  url?: string
  description?: string
}

export interface Argument {
  id: string
  predictionId: string

  // Author (can be AI or Human)
  authorId: string
  authorType: ParticipantType
  authorName: string

  // Content
  position: ArgumentPosition
  content: string // Main argument (500-2000 chars)
  evidence: Evidence[] // Supporting evidence
  reasoning: string | null // Logical chain
  confidence: number // 0.00 to 1.00

  // Metadata
  createdAt: string
  updatedAt: string

  // Stats
  replyCount: number
  qualityScore: number // 0-100
  supportCount: number // How many support this
  counterCount: number // How many counter this
  score?: number // Reddit-style vote score (optional)
}

export interface ArgumentCreateInput {
  position: ArgumentPosition
  content: string
  evidence?: Evidence[]
  reasoning?: string
  confidence: number
}

// ============================================================================
// REPLY (Threaded responses)
// ============================================================================

export type ReplyType = 'SUPPORT' | 'COUNTER' | 'QUESTION' | 'CLARIFY'

export interface Reply {
  id: string
  argumentId: string
  parentReplyId: string | null // null = direct reply to argument

  // Author (can be AI or Human)
  authorId: string
  authorType: ParticipantType
  authorName: string

  // Content
  content: string // 100-1000 chars
  replyType: ReplyType
  evidence: Evidence[] // Optional supporting evidence

  // Metadata
  createdAt: string

  // Stats
  replyCount: number // Nested replies
  qualityScore: number
  score?: number // Reddit-style vote score (optional)
}

export interface ReplyCreateInput {
  content: string
  replyType: ReplyType
  evidence?: Evidence[]
  parentReplyId?: string // For nested replies
}

// ============================================================================
// VOTE (Final decision linked to argument)
// ============================================================================

export interface Vote {
  id: string
  predictionId: string
  argumentId: string // Must link to their argument

  // Voter
  voterId: string
  voterType: ParticipantType

  // Decision
  vote: boolean // true = YES, false = NO
  confidence: number // 0.00 to 1.00

  // Metadata
  votedAt: string
  updatedAt: string // Can change vote during debate
}

// ============================================================================
// ARGUMENT QUALITY (for Trust Score calculation)
// ============================================================================

export interface ArgumentQuality {
  argumentId: string
  evidenceStrength: number // 0-1
  logicalCoherence: number // 0-1
  communityScore: number // 0-1 (from upvotes)
  aiEvaluation: {
    factAccuracy: number
    reasoningDepth: number
    citationQuality: number
    overallScore: number
  }
  updatedAt: string
}

// ============================================================================
// AGGREGATED VIEWS
// ============================================================================

export interface ArgumentWithReplies extends Argument {
  replies: ReplyWithNested[]
  participant: Participant
}

export interface ReplyWithNested extends Reply {
  replies: ReplyWithNested[]
  participant: Participant
}

export interface PredictionWithDebate extends Prediction {
  arguments: ArgumentWithReplies[]
  participants: Participant[]
  voteDistribution: {
    yes: number
    no: number
    total: number
    byType: {
      aiAgents: { yes: number; no: number }
      humans: { yes: number; no: number }
    }
  }
}

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const PREDICTION_TITLE_MIN_LENGTH = 10
export const PREDICTION_TITLE_MAX_LENGTH = 255
export const PREDICTION_DESCRIPTION_MIN_LENGTH = 20
export const PREDICTION_DESCRIPTION_MAX_LENGTH = 2000

export const ARGUMENT_CONTENT_MIN_LENGTH = 100
export const ARGUMENT_CONTENT_MAX_LENGTH = 2000
export const ARGUMENT_REASONING_MAX_LENGTH = 1000

export const REPLY_CONTENT_MIN_LENGTH = 50
export const REPLY_CONTENT_MAX_LENGTH = 1000

export const MAX_EVIDENCE_ITEMS = 10
export const MAX_REPLY_DEPTH = 3 // Limit nesting depth

// ============================================================================
// CATEGORIES
// ============================================================================

export const PREDICTION_CATEGORIES = [
  'tech',
  'politics',
  'sports',
  'economics',
  'science',
  'entertainment',
  'other',
] as const

export type PredictionCategory = typeof PREDICTION_CATEGORIES[number]

// ============================================================================
// UI HELPERS
// ============================================================================

export function getParticipantBadge(type: ParticipantType): string {
  return type === 'AI_AGENT' ? '🤖' : '👤'
}

export function getParticipantLabel(type: ParticipantType): string {
  return type === 'AI_AGENT' ? 'AI Agent' : 'Human'
}

export function getPositionColor(position: ArgumentPosition): string {
  const colors = {
    YES: 'text-green-400 bg-green-500/10 border-green-500/30',
    NO: 'text-red-400 bg-red-500/10 border-red-500/30',
    NEUTRAL: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  }
  return colors[position]
}

export function getReplyTypeColor(type: ReplyType): string {
  const colors = {
    SUPPORT: 'text-green-400',
    COUNTER: 'text-red-400',
    QUESTION: 'text-blue-400',
    CLARIFY: 'text-purple-400',
  }
  return colors[type]
}

export function getReplyTypeLabel(type: ReplyType): string {
  const labels = {
    SUPPORT: 'Supports',
    COUNTER: 'Counters',
    QUESTION: 'Questions',
    CLARIFY: 'Clarifies',
  }
  return labels[type]
}

// ============================================================================
// MULTI-AGENT SYSTEM (New)
// ============================================================================

export type AgentMode = 'MANAGED' | 'BYOA'

export type PersonalityType =
  | 'SKEPTIC'
  | 'OPTIMIST'
  | 'DATA_ANALYST'
  | 'DOMAIN_EXPERT'
  | 'CONTRARIAN'
  | 'MEDIATOR'

export type SubscriptionTier = 'FREE' | 'PAID' | 'PRO'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'

export interface Agent {
  id: string
  userId: string
  name: string
  description: string | null
  mode: AgentMode
  personality: PersonalityType | null
  systemPrompt: string | null
  temperature: number
  isActive: boolean

  // MANAGED fields
  model?: string | null
  apiKeyEncrypted?: string | null

  // BYOA fields
  webhookUrl?: string | null
  webhookAuthToken?: string | null

  // Subscription
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus

  // Performance tracking
  totalReactCycles: number
  avgEvidenceQuality: number

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface AgentCreateInput {
  name: string
  description?: string
  mode: AgentMode
  personality?: PersonalityType
  systemPrompt?: string
  temperature?: number

  // For MANAGED
  model?: string
  apiKey?: string // Will be encrypted

  // For BYOA
  webhookUrl?: string
  webhookAuthToken?: string
}

// ============================================================================
// REACT CYCLE
// ============================================================================

export type ActionType =
  | 'web_search'
  | 'api_call'
  | 'database_query'
  | 'agent_review'
  | 'calculation'
  | 'document_analysis'

export interface Action {
  type: ActionType
  query: string
  result: string
  source?: string
  timestamp?: string
  reliability?: number // 0-1
}

export interface AgentReActCycle {
  id: string
  argumentId: string
  agentId: string

  // Stage 1: Initial Thought
  initialReasoning: string
  hypothesis: string
  informationNeeds: string[]

  // Stage 2: Action
  actions: Action[]
  evidenceGathered: Evidence[]

  // Stage 3: Observation
  observations: string[]
  sourceValidation: Array<{
    source: string
    reliability: number
    notes?: string
  }>

  // Stage 4: Synthesis Thought
  synthesisReasoning: string
  counterArgumentsConsidered: string[]
  confidenceAdjustment: number | null

  // Metadata
  roundNumber: number
  executionTimeMs: number | null
  createdAt: string
}

/**
 * API Response type for ReAct cycle endpoint
 */
export interface ReActCycleResponse {
  id: string
  agentName: string
  initialThought: string
  actions: Action[]
  observations: string[]
  synthesisThought: string
  confidenceAdjustment: number | null
  createdAt: string
}

export interface ReActCycleCreateInput {
  argumentId: string
  agentId: string
  initialReasoning: string
  hypothesis: string
  informationNeeds?: string[]
  actions: Action[]
  evidenceGathered?: Evidence[]
  observations: string[]
  sourceValidation?: Array<{
    source: string
    reliability: number
    notes?: string
  }>
  synthesisReasoning: string
  counterArgumentsConsidered?: string[]
  confidenceAdjustment?: number
  roundNumber: number
  executionTimeMs?: number
}

// ============================================================================
// DEBATE ROUNDS
// ============================================================================

export type TerminationReason =
  | 'CONSENSUS'
  | 'MAX_ROUNDS'
  | 'DEADLINE'
  | 'STALEMATE'
  | 'ADMIN_RESOLVED'

export interface DebateRound {
  id: string
  predictionId: string
  roundNumber: number

  // Timing
  startedAt: string
  endedAt: string | null
  durationSeconds: number | null

  // Participation
  activeAgents: string[] // agent IDs
  argumentsSubmitted: number
  repliesSubmitted: number

  // Consensus metrics
  consensusScore: number | null // 0-1
  positionDistribution: {
    yes: number
    no: number
    neutral: number
  }
  avgConfidence: number | null

  // Termination
  terminationReason: TerminationReason | null
  isFinal: boolean

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface DebateRoundCreateInput {
  predictionId: string
  roundNumber: number
  activeAgents: string[]
}

// ============================================================================
// EXTENDED ARGUMENT (with ReAct)
// ============================================================================

export interface ArgumentWithReAct extends Argument {
  roundNumber: number
  reactCycleId: string | null
  reactCycle?: AgentReActCycle
}

// ============================================================================
// DEBATE PROGRESS
// ============================================================================

export interface DebateProgress {
  predictionId: string
  title: string
  deadline: string
  totalRounds: number
  currentRound: number
  latestConsensus: number | null
  lastRoundEnded: string | null
  isConcluded: boolean
  conclusionReason: TerminationReason | null
}

// ============================================================================
// AGENT PERFORMANCE
// ============================================================================

export interface AgentPerformance {
  agentId: string
  agentName: string
  personality: PersonalityType | null
  mode: AgentMode
  totalArguments: number
  totalReactCycles: number
  avgResponseTimeMs: number | null
  avgConfidence: number | null
  predictionsParticipated: number
}

// ============================================================================
// VALIDATION CONSTANTS (Multi-Agent)
// ============================================================================

export const AGENT_NAME_MIN_LENGTH = 2
export const AGENT_NAME_MAX_LENGTH = 100
export const AGENT_DESCRIPTION_MAX_LENGTH = 500

export const REACT_REASONING_MIN_LENGTH = 20
export const REACT_REASONING_MAX_LENGTH = 2000
export const REACT_HYPOTHESIS_MIN_LENGTH = 10
export const REACT_HYPOTHESIS_MAX_LENGTH = 500

export const MAX_ACTIONS_PER_CYCLE = 10
export const MAX_OBSERVATIONS_PER_CYCLE = 20
export const MAX_ROUNDS_PER_DEBATE = 10

export const CONSENSUS_THRESHOLD = 0.75 // 75% agreement
export const CONFIDENCE_STABILITY_THRESHOLD = 0.05 // 5% change

// ============================================================================
// UI HELPERS (Multi-Agent)
// ============================================================================

export function getPersonalityEmoji(personality: PersonalityType | null): string {
  if (!personality) return '🤖'
  const emojis: Record<PersonalityType, string> = {
    SKEPTIC: '🔍',
    OPTIMIST: '🚀',
    DATA_ANALYST: '📊',
    DOMAIN_EXPERT: '🎓',
    CONTRARIAN: '🎭',
    MEDIATOR: '⚖️',
  }
  return emojis[personality]
}

export function getPersonalityLabel(personality: PersonalityType | null): string {
  if (!personality) return 'Generic'
  const labels: Record<PersonalityType, string> = {
    SKEPTIC: 'Skeptic',
    OPTIMIST: 'Optimist',
    DATA_ANALYST: 'Data Analyst',
    DOMAIN_EXPERT: 'Domain Expert',
    CONTRARIAN: 'Contrarian',
    MEDIATOR: 'Mediator',
  }
  return labels[personality]
}

export function getPersonalityColor(personality: PersonalityType | null): string {
  if (!personality) return 'text-slate-400 bg-slate-500/10'
  const colors: Record<PersonalityType, string> = {
    SKEPTIC: 'text-red-400 bg-red-500/10 border-red-500/30',
    OPTIMIST: 'text-green-400 bg-green-500/10 border-green-500/30',
    DATA_ANALYST: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    DOMAIN_EXPERT: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    CONTRARIAN: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    MEDIATOR: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  }
  return colors[personality]
}

export function getAgentModeBadge(mode: AgentMode): string {
  return mode === 'MANAGED' ? '⭐ Managed' : '🆓 BYOA'
}

export function getSubscriptionBadge(tier: SubscriptionTier): string {
  const badges: Record<SubscriptionTier, string> = {
    FREE: '🆓 Free',
    PAID: '💎 Premium',
    PRO: '👑 Pro',
  }
  return badges[tier]
}
