import { createClient } from '@supabase/supabase-js'

interface Prediction {
  id: string
  title: string
  deadline: string
  created_at: string
}

interface DebateRound {
  id: string
  prediction_id: string
  round_number: number
  is_final: boolean
  ended_at: string | null
  created_at: string
}

/**
 * Monitors predictions and identifies which ones need new debate rounds
 */
export class PredictionMonitor {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * Find predictions that need Round 1 (initial debate)
   */
  async findPredictionsNeedingRound1(): Promise<Prediction[]> {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Find predictions that:
    // 1. Don't have any debate rounds yet
    // 2. Created at least 5 minutes ago
    // 3. Deadline is within 7 days OR already passed
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

    const { data: predictions, error } = await this.supabase
      .from('predictions')
      .select(`
        id,
        title,
        deadline,
        created_at
      `)
      .is('resolution_value', null) // Not resolved yet
      .lt('created_at', fiveMinutesAgo.toISOString())

    if (error) {
      console.error('[PredictionMonitor] Error fetching predictions:', error)
      return []
    }

    if (!predictions || predictions.length === 0) {
      return []
    }

    // Filter predictions that don't have any rounds yet
    const predictionsWithoutRounds: Prediction[] = []

    for (const pred of predictions) {
      const { data: rounds } = await this.supabase
        .from('debate_rounds')
        .select('id')
        .eq('prediction_id', pred.id)
        .limit(1)

      if (!rounds || rounds.length === 0) {
        // Check if deadline is approaching or passed
        const deadline = new Date(pred.deadline)
        if (deadline <= sevenDaysFromNow) {
          predictionsWithoutRounds.push(pred)
        }
      }
    }

    return predictionsWithoutRounds
  }

  /**
   * Find predictions that need subsequent rounds (Round 2+)
   */
  async findPredictionsNeedingNextRound(): Promise<Array<{ prediction: Prediction; nextRound: number }>> {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find predictions with non-final rounds created more than 24 hours ago
    const { data: rounds, error } = await this.supabase
      .from('debate_rounds')
      .select(`
        id,
        prediction_id,
        round_number,
        is_final,
        ended_at,
        created_at,
        predictions!inner (
          id,
          title,
          deadline,
          created_at,
          resolution_value
        )
      `)
      .eq('is_final', false)
      .is('predictions.resolution_value', null)
      .lt('created_at', twentyFourHoursAgo.toISOString())

    if (error) {
      console.error('[PredictionMonitor] Error fetching rounds:', error)
      return []
    }

    if (!rounds || rounds.length === 0) {
      return []
    }

    const result: Array<{ prediction: Prediction; nextRound: number }> = []

    for (const round of rounds) {
      // Check if this is the latest round for this prediction
      const { data: latestRound } = await this.supabase
        .from('debate_rounds')
        .select('round_number, is_final')
        .eq('prediction_id', round.prediction_id)
        .order('round_number', { ascending: false })
        .limit(1)
        .single()

      if (latestRound && latestRound.round_number === round.round_number && !latestRound.is_final) {
        // Check if we haven't exceeded max rounds
        if (round.round_number < 10) {
          const prediction = (round as any).predictions
          result.push({
            prediction,
            nextRound: round.round_number + 1,
          })
        }
      }
    }

    return result
  }

  /**
   * Get summary of current debate status
   */
  async getDebateSummary() {
    const { count: totalPredictions } = await this.supabase
      .from('predictions')
      .select('*', { count: 'exact', head: true })
      .is('resolution_value', null)

    const { count: activeDebates } = await this.supabase
      .from('debate_rounds')
      .select('*', { count: 'exact', head: true })
      .eq('is_final', false)

    const { count: completedDebates } = await this.supabase
      .from('debate_rounds')
      .select('*', { count: 'exact', head: true })
      .eq('is_final', true)

    return {
      totalPredictions: totalPredictions || 0,
      activeDebates: activeDebates || 0,
      completedDebates: completedDebates || 0,
    }
  }
}
