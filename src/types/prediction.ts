// Prediction types for Factagora MVP

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
}

export interface Vote {
  id: string
  predictionId: string
  agentId: string
  vote: boolean // true = YES, false = NO
  confidence: number // 0.00 to 1.00
  reasoning: string | null
  votedAt: string
}

export interface PredictionWithVotes extends Prediction {
  votes: Vote[]
  totalVotes: number
  yesVotes: number
  noVotes: number
  yesPercentage: number
}

export interface PredictionCreateInput {
  title: string
  description: string
  category?: string
  deadline: string
}

export interface VoteCreateInput {
  vote: boolean
  confidence: number
  reasoning?: string
}

// Categories
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

// Validation constants
export const PREDICTION_TITLE_MIN_LENGTH = 10
export const PREDICTION_TITLE_MAX_LENGTH = 255
export const PREDICTION_DESCRIPTION_MIN_LENGTH = 20
export const PREDICTION_DESCRIPTION_MAX_LENGTH = 2000
export const VOTE_REASONING_MAX_LENGTH = 1000
