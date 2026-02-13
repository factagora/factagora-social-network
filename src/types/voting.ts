// Voting System Types

export type VoterType = 'HUMAN' | 'AI_AGENT'
export type VotePosition = 'YES' | 'NO' | 'NEUTRAL'

export interface Vote {
  id: string
  predictionId: string
  voterId: string
  voterType: VoterType
  voterName: string
  position: VotePosition
  confidence: number // 0.0 to 1.0
  weight: number // 0.1 to 3.0
  reasoning?: string
  createdAt: string
  updatedAt: string
}

export interface VoteCreateInput {
  predictionId: string
  position: VotePosition
  confidence?: number // Default 0.8
  reasoning?: string
}

export interface PredictionConsensus {
  predictionId: string

  // Total counts
  totalVotes: number
  humanVotes: number
  aiVotes: number

  // Position distribution (all)
  yesVotes: number
  noVotes: number
  neutralVotes: number

  // Human position distribution
  humanYes: number
  humanNo: number
  humanNeutral: number

  // AI position distribution
  aiYes: number
  aiNo: number
  aiNeutral: number

  // Weighted consensus
  weightedYes: number
  weightedNo: number
  weightedNeutral: number
  totalWeight: number

  // Consensus percentages
  consensusYesPct: number // Overall
  humanConsensusYesPct: number // Human only
  aiConsensusYesPct: number // AI only

  // Average confidence
  avgConfidence: number
  humanAvgConfidence: number
  aiAvgConfidence: number
}

export interface VotingStats {
  consensus: PredictionConsensus
  recentVotes: Vote[]
  breakdown: {
    human: {
      total: number
      yes: number
      no: number
      neutral: number
      yesPct: number
    }
    ai: {
      total: number
      yes: number
      no: number
      neutral: number
      yesPct: number
    }
  }
}

// Platform phase for weight calculation
export type PlatformPhase = 'bootstrap' | 'growth' | 'mature'

export interface WeightConfig {
  phase: PlatformPhase
  humanWeight: number
  aiWeight: number
  userThreshold: number
}

export const WEIGHT_CONFIG: Record<PlatformPhase, WeightConfig> = {
  bootstrap: {
    phase: 'bootstrap',
    humanWeight: 1.0,
    aiWeight: 0.5,
    userThreshold: 100,
  },
  growth: {
    phase: 'growth',
    humanWeight: 1.0,
    aiWeight: 0.3,
    userThreshold: 1000,
  },
  mature: {
    phase: 'mature',
    humanWeight: 1.0,
    aiWeight: 0.1,
    userThreshold: Infinity,
  },
}

export function getCurrentPhase(totalUsers: number): PlatformPhase {
  if (totalUsers < WEIGHT_CONFIG.bootstrap.userThreshold) {
    return 'bootstrap'
  } else if (totalUsers < WEIGHT_CONFIG.growth.userThreshold) {
    return 'growth'
  } else {
    return 'mature'
  }
}

export function getVoteWeight(voterType: VoterType, totalUsers: number): number {
  const phase = getCurrentPhase(totalUsers)
  const config = WEIGHT_CONFIG[phase]

  return voterType === 'HUMAN' ? config.humanWeight : config.aiWeight
}
