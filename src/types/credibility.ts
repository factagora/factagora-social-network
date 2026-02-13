/**
 * Evidence Credibility System Types
 * Types for source reputation, fact-checker reputation, consensus tracking, and Google Fact Check API
 */

// ============================================================================
// SOURCE REPUTATION
// ============================================================================

export type SourceType =
  | 'NEWS_OUTLET'
  | 'ACADEMIC'
  | 'GOVERNMENT'
  | 'FACT_CHECKER'
  | 'SOCIAL_MEDIA'
  | 'BLOG'
  | 'OTHER'

export type BiasRating =
  | 'LEFT'
  | 'CENTER_LEFT'
  | 'CENTER'
  | 'CENTER_RIGHT'
  | 'RIGHT'
  | 'UNKNOWN'

export interface SourceReputation {
  id: string
  domain: string
  sourceName: string | null
  sourceType: SourceType | null
  credibilityScore: number // 0-100
  verificationCount: number
  accuracyRate: number // 0-100
  biasRating: BiasRating | null
  factCheckRating: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  lastVerifiedAt: string | null
}

// ============================================================================
// FACT-CHECKER REPUTATION
// ============================================================================

export interface FactCheckerReputation {
  id: string
  userId: string
  reputationScore: number // 0-100
  totalVerifications: number
  accurateVerifications: number
  accuracyRate: number // 0-100
  expertiseAreas: string[] | null
  verifiedClaimsCount: number
  currentStreak: number
  longestStreak: number
  lastVerificationAt: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// CLAIM CONSENSUS
// ============================================================================

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'

export interface ClaimConsensus {
  id: string
  claimId: string
  trueVotes: number
  falseVotes: number
  totalVotes: number
  truePercentage: number // 0-100
  evidenceWeightedScore: number // -100 to +100
  highCredibilityEvidenceCount: number
  lowCredibilityEvidenceCount: number
  consensusReached: boolean
  consensusThreshold: number // Default 70%
  confidenceLevel: ConfidenceLevel
  createdAt: string
  updatedAt: string
}

// ============================================================================
// ENHANCED EVIDENCE WITH CREDIBILITY
// ============================================================================

export interface EnhancedEvidence {
  id: string
  claimId: string
  content: string
  sourceUrl: string
  sourceDomain: string | null
  sourceReputationId: string | null
  credibilityScore: number // 0-100
  supportsClai: boolean
  verifiedBy: string | null
  verifiedAt: string | null
  verificationNotes: string | null
  createdBy: string
  createdAt: string
  updatedAt: string

  // Joined data
  sourceReputation?: SourceReputation
  verifierProfile?: {
    id: string
    displayName: string
    reputation?: FactCheckerReputation
  }
}

// ============================================================================
// GOOGLE FACT CHECK API
// ============================================================================

export interface GoogleFactCheckClaim {
  text: string
  claimant: string
  claimDate?: string
  claimReview: GoogleFactCheckReview[]
}

export interface GoogleFactCheckReview {
  publisher: {
    name: string
    site?: string
  }
  url: string
  title: string
  reviewDate: string
  textualRating: string // e.g., "False", "Mostly True", "Mixture"
  languageCode: string
}

export interface GoogleFactCheckCache {
  id: string
  queryText: string
  queryHash: string
  factCheckResults: {
    claims: GoogleFactCheckClaim[]
  } | null
  claimsFound: number
  createdAt: string
  expiresAt: string
  lastAccessedAt: string
}

export interface GoogleFactCheckAPIResponse {
  claims?: GoogleFactCheckClaim[]
  nextPageToken?: string
}

// ============================================================================
// CREDIBILITY CALCULATION UTILITIES
// ============================================================================

export interface CredibilityFactors {
  sourceScore: number // 0-100 from source reputation
  verificationBonus: number // 0-20 if verified by fact-checker
  recencyPenalty: number // 0-10 based on age of evidence
  userReputationBonus: number // 0-15 based on submitter reputation
}

export interface CredibilityBreakdown {
  totalScore: number // 0-100
  factors: CredibilityFactors
  confidence: ConfidenceLevel
  explanation: string
}

// ============================================================================
// CONSENSUS ALGORITHM TYPES
// ============================================================================

export interface ConsensusInput {
  votes: {
    true: number
    false: number
  }
  evidence: {
    supporting: EnhancedEvidence[]
    opposing: EnhancedEvidence[]
  }
}

export interface ConsensusResult {
  verdict: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIED' | 'MISLEADING'
  confidence: ConfidenceLevel
  consensusReached: boolean
  breakdown: {
    votePercentage: number
    evidenceScore: number
    factCheckerAgreement: number
  }
  recommendation: string
}

// ============================================================================
// UI DISPLAY TYPES
// ============================================================================

export interface CredibilityBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export interface ConsensusIndicatorProps {
  consensus: ClaimConsensus
  showBreakdown?: boolean
}

export interface SourceReputationBadgeProps {
  source: SourceReputation
  compact?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color class based on credibility score
 */
export function getCredibilityColor(score: number): string {
  if (score >= 80) return 'text-green-400 bg-green-500/10 border-green-500/30'
  if (score >= 60) return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
  if (score >= 40) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
  return 'text-red-400 bg-red-500/10 border-red-500/30'
}

/**
 * Get label for credibility score
 */
export function getCredibilityLabel(score: number): string {
  if (score >= 80) return 'High Credibility'
  if (score >= 60) return 'Moderate Credibility'
  if (score >= 40) return 'Low Credibility'
  return 'Very Low Credibility'
}

/**
 * Get color for confidence level
 */
export function getConfidenceColor(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case 'HIGH':
      return 'text-green-400 bg-green-500/10'
    case 'MEDIUM':
      return 'text-blue-400 bg-blue-500/10'
    case 'LOW':
      return 'text-yellow-400 bg-yellow-500/10'
    case 'NONE':
      return 'text-gray-400 bg-gray-500/10'
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return null
  }
}

/**
 * Calculate consensus verdict from votes and evidence
 */
export function calculateConsensusVerdict(
  truePercentage: number,
  evidenceScore: number,
  totalVotes: number
): 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNVERIFIED' | 'MISLEADING' {
  if (totalVotes < 3) return 'UNVERIFIED'

  // Strong consensus with evidence support
  if (truePercentage >= 80 && evidenceScore > 60) return 'TRUE'
  if (truePercentage <= 20 && evidenceScore < -60) return 'FALSE'

  // Moderate consensus
  if (truePercentage >= 60 && evidenceScore > 30) return 'PARTIALLY_TRUE'
  if (truePercentage <= 40 && evidenceScore < -30) return 'FALSE'

  // Mixed signals or misleading
  if (Math.abs(truePercentage - 50) < 10) return 'MISLEADING'

  return 'UNVERIFIED'
}
