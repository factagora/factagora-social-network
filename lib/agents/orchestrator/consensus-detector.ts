// Consensus detection and termination logic

import type { TerminationReason } from '@/src/types/debate'

export interface ConsensusInput {
  // Current round data
  roundNumber: number
  positionDistribution: {
    yes: number
    no: number
    neutral: number
  }
  avgConfidence: number

  // Historical data (for stability check)
  previousRoundConfidence?: number

  // Prediction metadata
  deadline: string
  maxRounds?: number

  // Admin override
  adminResolved?: boolean
}

export interface ConsensusResult {
  shouldTerminate: boolean
  terminationReason?: TerminationReason
  consensusScore: number
  details: {
    message: string
    threshold?: number
    actual?: number
  }
}

/**
 * Detects consensus and determines if debate should terminate
 */
export class ConsensusDetector {
  private readonly CONSENSUS_THRESHOLD = 0.75 // 75% agreement
  private readonly CONFIDENCE_STABILITY_THRESHOLD = 0.05 // 5% change
  private readonly DEFAULT_MAX_ROUNDS = 10

  /**
   * Check if debate should terminate
   */
  detect(input: ConsensusInput): ConsensusResult {
    // Priority 1: Admin override
    if (input.adminResolved) {
      return {
        shouldTerminate: true,
        terminationReason: 'ADMIN_RESOLVED',
        consensusScore: this.calculateConsensusScore(input.positionDistribution),
        details: {
          message: 'Debate manually resolved by administrator',
        },
      }
    }

    // Priority 2: Deadline reached
    const isDeadlinePassed = new Date() > new Date(input.deadline)
    if (isDeadlinePassed) {
      return {
        shouldTerminate: true,
        terminationReason: 'DEADLINE',
        consensusScore: this.calculateConsensusScore(input.positionDistribution),
        details: {
          message: 'Prediction deadline has passed',
        },
      }
    }

    // Priority 3: Max rounds reached
    const maxRounds = input.maxRounds || this.DEFAULT_MAX_ROUNDS
    if (input.roundNumber >= maxRounds) {
      return {
        shouldTerminate: true,
        terminationReason: 'MAX_ROUNDS',
        consensusScore: this.calculateConsensusScore(input.positionDistribution),
        details: {
          message: `Maximum rounds (${maxRounds}) reached`,
          threshold: maxRounds,
          actual: input.roundNumber,
        },
      }
    }

    // Calculate consensus score
    const consensusScore = this.calculateConsensusScore(input.positionDistribution)

    // Priority 4: Consensus reached
    if (consensusScore >= this.CONSENSUS_THRESHOLD) {
      return {
        shouldTerminate: true,
        terminationReason: 'CONSENSUS',
        consensusScore,
        details: {
          message: `Consensus reached: ${(consensusScore * 100).toFixed(1)}% agreement`,
          threshold: this.CONSENSUS_THRESHOLD,
          actual: consensusScore,
        },
      }
    }

    // Priority 5: Stalemate (confidence stability)
    if (input.roundNumber >= 3 && input.previousRoundConfidence !== undefined) {
      const confidenceChange = Math.abs(
        input.avgConfidence - input.previousRoundConfidence
      )

      if (confidenceChange < this.CONFIDENCE_STABILITY_THRESHOLD) {
        return {
          shouldTerminate: true,
          terminationReason: 'STALEMATE',
          consensusScore,
          details: {
            message: `Stalemate detected: confidence change <${(this.CONFIDENCE_STABILITY_THRESHOLD * 100).toFixed(0)}%`,
            threshold: this.CONFIDENCE_STABILITY_THRESHOLD,
            actual: confidenceChange,
          },
        }
      }
    }

    // Continue debate
    return {
      shouldTerminate: false,
      consensusScore,
      details: {
        message: `Debate continues: ${(consensusScore * 100).toFixed(1)}% agreement (need ${(this.CONSENSUS_THRESHOLD * 100).toFixed(0)}%)`,
        threshold: this.CONSENSUS_THRESHOLD,
        actual: consensusScore,
      },
    }
  }

  /**
   * Calculate consensus score (0.0 to 1.0)
   *
   * Consensus = (max position count) / (total agents)
   * Example: 5 YES, 2 NO, 1 NEUTRAL → 5/8 = 0.625
   */
  private calculateConsensusScore(distribution: {
    yes: number
    no: number
    neutral: number
  }): number {
    const total = distribution.yes + distribution.no + distribution.neutral

    if (total === 0) {
      return 0
    }

    const maxPosition = Math.max(distribution.yes, distribution.no, distribution.neutral)

    return maxPosition / total
  }

  /**
   * Get dominant position
   */
  getDominantPosition(distribution: {
    yes: number
    no: number
    neutral: number
  }): 'YES' | 'NO' | 'NEUTRAL' | null {
    const { yes, no, neutral } = distribution

    if (yes === 0 && no === 0 && neutral === 0) {
      return null
    }

    const max = Math.max(yes, no, neutral)

    if (yes === max) return 'YES'
    if (no === max) return 'NO'
    return 'NEUTRAL'
  }

  /**
   * Check if consensus is strong (>90%)
   */
  isStrongConsensus(consensusScore: number): boolean {
    return consensusScore >= 0.9
  }

  /**
   * Check if debate is close (consensus between 40-60%)
   */
  isCloseDebate(consensusScore: number): boolean {
    return consensusScore >= 0.4 && consensusScore <= 0.6
  }
}
