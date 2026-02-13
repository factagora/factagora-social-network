// ========================================
// User Stats Types
// ========================================

export interface UserStats {
  id: string
  userId: string

  // Claim Voting Stats
  totalClaimVotes: number
  correctClaimVotes: number
  claimAccuracy: number

  // Prediction Voting Stats
  totalPredictionVotes: number
  correctPredictionVotes: number
  predictionAccuracy: number

  // Overall Stats
  totalVotes: number
  correctVotes: number
  overallAccuracy: number

  // Points & Rewards
  points: number
  level: number
  experience: number

  // Reputation
  reputationScore: number
  trustScore: number

  // Activity
  claimsCreated: number
  evidenceSubmitted: number
  argumentsWritten: number

  // Timestamps
  createdAt: string
  updatedAt: string
}

// ========================================
// Leaderboard Entry
// ========================================

export interface LeaderboardEntry {
  userId: string
  userName: string
  userEmail: string
  rank: number
  points: number
  accuracy: number
  totalVotes: number
  level: number
  reputationScore: number
}

// ========================================
// User Activity Log
// ========================================

export interface UserActivity {
  type: 'vote' | 'claim' | 'evidence' | 'argument'
  claimId: string
  claimTitle: string
  timestamp: string
  result?: 'correct' | 'incorrect' | 'pending'
  pointsEarned?: number
}

// ========================================
// Points Breakdown
// ========================================

export interface PointsBreakdown {
  totalPoints: number
  breakdown: {
    correctVotes: number
    earlyVoterBonus: number
    confidenceBonus: number
    evidenceSubmission: number
    argumentQuality: number
    claimCreation: number
  }
}

// ========================================
// Helper Functions
// ========================================

export function getLevelFromExperience(exp: number): number {
  // Simple level formula: level = floor(sqrt(exp / 100)) + 1
  return Math.floor(Math.sqrt(exp / 100)) + 1
}

export function getExperienceForNextLevel(currentLevel: number): number {
  // Experience needed for next level
  return currentLevel * currentLevel * 100
}

export function getTrustScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400 bg-green-500/20'
  if (score >= 60) return 'text-blue-400 bg-blue-500/20'
  if (score >= 40) return 'text-yellow-400 bg-yellow-500/20'
  return 'text-red-400 bg-red-500/20'
}

export function getTrustScoreLabel(score: number): string {
  if (score >= 80) return '🌟 Excellent'
  if (score >= 60) return '✓ Good'
  if (score >= 40) return '⚠ Average'
  return '❌ Poor'
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'text-green-400'
  if (accuracy >= 60) return 'text-blue-400'
  if (accuracy >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

export function calculatePointsForVote(
  confidence: number,
  isEarlyVote: boolean,
  basePoints: number = 10
): number {
  // Base points
  let points = basePoints

  // Confidence bonus (0.5-1.0 confidence → 0-50% bonus)
  const confidenceBonus = (confidence - 0.5) * basePoints
  points += confidenceBonus

  // Early voter bonus (20% bonus)
  if (isEarlyVote) {
    points *= 1.2
  }

  return Math.floor(points)
}
