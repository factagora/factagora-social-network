// ========================================
// Claim Types
// ========================================

export type ClaimType = 'FACTUAL' | 'STATISTICAL' | 'QUOTE' | 'EVENT'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type VerificationStatus =
  | 'PENDING'
  | 'VERIFIED_TRUE'
  | 'VERIFIED_FALSE'
  | 'PARTIALLY_TRUE'
  | 'MISLEADING'
  | 'UNVERIFIABLE'

// New: Verdict type for fact-checking (simpler than VerificationStatus)
export type ClaimVerdict =
  | 'TRUE'
  | 'FALSE'
  | 'PARTIALLY_TRUE'
  | 'UNVERIFIED'
  | 'MISLEADING'

export type ArgumentPosition = 'TRUE' | 'FALSE' | 'UNCERTAIN'

export type SourceType =
  | 'OFFICIAL_DOCUMENT'
  | 'NEWS_ARTICLE'
  | 'RESEARCH_PAPER'
  | 'STATISTICS'
  | 'VIDEO'
  | 'SOCIAL_MEDIA'
  | 'EXPERT_TESTIMONY'
  | 'OTHER'

export type ReplyType = 'SUPPORT' | 'COUNTER' | 'QUESTION' | 'CLARIFY'

// ========================================
// Main Claim Interface
// ========================================

export interface Claim {
  id: string

  // Basic info
  title: string
  description: string | null
  category: string | null

  // Claim-specific
  claimDate: string | null
  claimType: ClaimType
  sourceUrl: string | null
  sourceTitle: string | null

  // Approval
  approvalStatus: ApprovalStatus
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null

  // Verification
  verificationStatus: VerificationStatus
  verificationConfidence: number

  // New: Fact-checking verdict
  verdict?: ClaimVerdict | null
  verdictSummary?: string | null
  verdictDate?: string | null
  claimedBy?: string | null  // Who made the original claim
  sourceCredibility?: number | null  // 0-100

  // Resolution
  resolutionDate: string | null
  resolutionValue: boolean | null
  resolvedBy: string | null
  resolvedAt: string | null

  // Stats
  verifierCount: number
  evidenceCount: number
  argumentCount: number
  trueVotes: number
  falseVotes: number

  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ========================================
// Evidence
// ========================================

export interface Evidence {
  id: string
  claimId: string

  sourceType: SourceType
  title: string
  url: string
  description: string | null

  credibilityScore: number | null
  publisher: string | null
  publishedDate: string | null

  submittedBy: string
  submissionType: 'HUMAN' | 'AI_AGENT'

  createdAt: string

  helpfulVotes: number
  unhelpfulVotes: number
}

export interface EvidenceCreateInput {
  claimId: string
  sourceType: SourceType
  title: string
  url: string
  description?: string
  publisher?: string
  publishedDate?: string
}

// ========================================
// Votes
// ========================================

export interface ClaimVote {
  id: string
  claimId: string
  userId: string
  voteValue: boolean  // TRUE or FALSE
  confidence: number
  reasoning: string | null
  createdAt: string
  updatedAt: string
}

export interface ClaimVoteInput {
  voteValue: boolean
  confidence?: number
  reasoning?: string
}

// ========================================
// Arguments
// ========================================

export interface ClaimArgument {
  id: string
  claimId: string

  authorId: string
  authorType: 'HUMAN' | 'AI_AGENT'
  authorName: string

  position: ArgumentPosition
  content: string
  reasoning: string | null
  evidence: EvidenceItem[] | null
  confidence: number

  // Reddit-style voting
  upvotes: number
  downvotes: number
  score: number

  createdAt: string
  updatedAt: string

  // Nested replies
  replies?: ClaimArgumentReply[]
  replyCount?: number
}

export interface EvidenceItem {
  type: string
  title: string
  description?: string
  url?: string
  reliability?: number
}

export interface ClaimArgumentInput {
  position: ArgumentPosition
  content: string
  reasoning?: string
  evidence?: EvidenceItem[]
  confidence?: number
}

// ========================================
// Argument Replies
// ========================================

export interface ClaimArgumentReply {
  id: string
  argumentId: string
  parentReplyId: string | null

  authorId: string
  authorType: 'HUMAN' | 'AI_AGENT'
  authorName: string

  content: string
  replyType: ReplyType
  evidence: EvidenceItem[] | null

  // Reddit-style voting
  upvotes: number
  downvotes: number
  score: number

  createdAt: string

  // Nested replies
  replies?: ClaimArgumentReply[]
}

export interface ClaimReplyInput {
  argumentId: string
  parentReplyId?: string
  content: string
  replyType: ReplyType
  evidence?: EvidenceItem[]
}

// ========================================
// Claim Creation
// ========================================

export interface ClaimCreateInput {
  title: string
  description: string
  category: string

  claimDate?: string
  claimType?: ClaimType
  sourceUrl?: string
  sourceTitle?: string

  resolutionDate: string  // Required: when can be resolved
}

// ========================================
// Consensus (for UI display)
// ========================================

export interface ClaimConsensus {
  truePercentage: number
  falsePercentage: number
  totalVotes: number
  confidenceAverage: number
}

// ========================================
// User Permissions
// ========================================

export type UserTier = 'FREE' | 'PREMIUM' | 'ADMIN'

export interface AgendaCreationPermission {
  allowed: boolean
  requiresApproval: boolean
  remaining: number
  resetDate: string | null
}

// ========================================
// Helper Functions
// ========================================

export function getVerificationStatusColor(status: VerificationStatus): string {
  const colors = {
    PENDING: 'text-slate-400 bg-slate-500/10',
    VERIFIED_TRUE: 'text-green-400 bg-green-500/20',
    VERIFIED_FALSE: 'text-red-400 bg-red-500/20',
    PARTIALLY_TRUE: 'text-yellow-400 bg-yellow-500/20',
    MISLEADING: 'text-orange-400 bg-orange-500/20',
    UNVERIFIABLE: 'text-gray-400 bg-gray-500/20',
  }
  return colors[status]
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels = {
    PENDING: '⏳ 검증 중',
    VERIFIED_TRUE: '✅ 사실 확인',
    VERIFIED_FALSE: '❌ 거짓 확인',
    PARTIALLY_TRUE: '⚠️ 부분적 사실',
    MISLEADING: '🚫 오해의 소지',
    UNVERIFIABLE: '❓ 검증 불가',
  }
  return labels[status]
}

export function getPositionColor(position: ArgumentPosition): string {
  const colors = {
    TRUE: 'text-green-400 bg-green-500/10 border-green-500/30',
    FALSE: 'text-red-400 bg-red-500/10 border-red-500/30',
    UNCERTAIN: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  }
  return colors[position]
}

export function getReplyTypeColor(type: ReplyType): string {
  const colors = {
    SUPPORT: 'text-green-400 bg-green-500/10',
    COUNTER: 'text-red-400 bg-red-500/10',
    QUESTION: 'text-blue-400 bg-blue-500/10',
    CLARIFY: 'text-purple-400 bg-purple-500/10',
  }
  return colors[type]
}

export function getReplyTypeLabel(type: ReplyType): string {
  const labels = {
    SUPPORT: '지지',
    COUNTER: '반박',
    QUESTION: '질문',
    CLARIFY: '명확화',
  }
  return labels[type]
}

// ========================================
// Constants
// ========================================

// ========================================
// Verdict Helpers
// ========================================

export function getVerdictLabel(verdict: ClaimVerdict): string {
  const labels: Record<ClaimVerdict, string> = {
    TRUE: '✅ True',
    FALSE: '❌ False',
    PARTIALLY_TRUE: '⚠️ Partially True',
    UNVERIFIED: '❓ Unverified',
    MISLEADING: '🟠 Misleading',
  }
  return labels[verdict]
}

export function getVerdictColor(verdict: ClaimVerdict): string {
  const colors: Record<ClaimVerdict, string> = {
    TRUE: 'bg-green-500/20 text-green-400 border-green-500/50',
    FALSE: 'bg-red-500/20 text-red-400 border-red-500/50',
    PARTIALLY_TRUE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    UNVERIFIED: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    MISLEADING: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  }
  return colors[verdict]
}

export const CLAIM_CATEGORIES = [
  'tech',
  'politics',
  'economics',
  'science',
  'sports',
  'entertainment',
  'health',
  'business',
] as const

export const CLAIM_TITLE_MIN_LENGTH = 10
export const CLAIM_TITLE_MAX_LENGTH = 500
export const CLAIM_CONTENT_MIN_LENGTH = 50
export const CLAIM_CONTENT_MAX_LENGTH = 5000
export const CLAIM_REASONING_MAX_LENGTH = 2000
export const MAX_EVIDENCE_ITEMS = 10
