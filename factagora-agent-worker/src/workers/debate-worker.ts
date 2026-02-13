import { config } from 'dotenv'
import { resolve } from 'path'
import cron from 'node-cron'
import { PredictionMonitor } from '../scheduler/prediction-monitor'
import { RoundOrchestrator } from '../../../lib/agents/orchestrator/round-orchestrator'

// Load environment variables from main project
config({ path: resolve(__dirname, '../../../.env.local') })

/**
 * Debate Worker - Runs scheduled tasks for AI agent debates
 */
class DebateWorker {
  private monitor: PredictionMonitor
  private orchestrator: RoundOrchestrator
  private isRunning: boolean = false

  constructor() {
    this.monitor = new PredictionMonitor()
    this.orchestrator = new RoundOrchestrator({
      claudeApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Start the worker with scheduled tasks
   */
  start() {
    console.log('🚀 Factagora Agent Worker Starting...')
    console.log('=' .repeat(80))

    // Check environment variables
    this.checkEnvironment()

    // Schedule: Check for new predictions needing Round 1 (every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
      await this.checkForRound1()
    })

    // Schedule: Check for predictions needing subsequent rounds (every 10 minutes)
    cron.schedule('*/10 * * * *', async () => {
      await this.checkForNextRounds()
    })

    // Schedule: Print status summary (every hour)
    cron.schedule('0 * * * *', async () => {
      await this.printSummary()
    })

    console.log('✅ Scheduler initialized')
    console.log('   - Round 1 check: Every 5 minutes')
    console.log('   - Next round check: Every 10 minutes')
    console.log('   - Status summary: Every hour')
    console.log('=' .repeat(80))

    // Run initial checks immediately
    setTimeout(() => this.runInitialChecks(), 5000)

    // Keep process alive
    process.on('SIGTERM', () => this.shutdown())
    process.on('SIGINT', () => this.shutdown())
  }

  /**
   * Check environment variables
   */
  private checkEnvironment() {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'ANTHROPIC_API_KEY',
    ]

    const missing = required.filter(key => !process.env[key])

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:')
      missing.forEach(key => console.error(`   - ${key}`))
      process.exit(1)
    }

    console.log('✅ Environment variables loaded')
  }

  /**
   * Run initial checks on startup
   */
  private async runInitialChecks() {
    console.log('\n🔍 Running initial checks...')
    await this.checkForRound1()
    await this.checkForNextRounds()
    await this.printSummary()
  }

  /**
   * Check for predictions needing Round 1
   */
  private async checkForRound1() {
    if (this.isRunning) {
      console.log('⏳ Previous task still running, skipping...')
      return
    }

    this.isRunning = true

    try {
      const predictions = await this.monitor.findPredictionsNeedingRound1()

      if (predictions.length > 0) {
        console.log(`\n📋 Found ${predictions.length} prediction(s) needing Round 1:`)

        for (const pred of predictions) {
          console.log(`   - "${pred.title}" (${pred.id})`)
          console.log(`     Created: ${new Date(pred.created_at).toLocaleString()}`)
          console.log(`     Deadline: ${new Date(pred.deadline).toLocaleString()}`)

          try {
            console.log(`     🚀 Starting Round 1...`)
            const result = await this.orchestrator.executeRound(pred.id, 1)

            console.log(`     ✅ Round 1 completed`)
            console.log(`        - Agents: ${result.stats.successfulAgents}/${result.stats.totalAgents}`)
            console.log(`        - Consensus: ${(result.consensusScore * 100).toFixed(1)}%`)
            console.log(`        - Terminate: ${result.shouldTerminate ? 'YES' : 'NO'}`)

            if (result.terminationReason) {
              console.log(`        - Reason: ${result.terminationReason}`)
            }
          } catch (error) {
            console.error(`     ❌ Failed to execute Round 1:`, error)
          }
        }
      } else {
        console.log('✓ No predictions need Round 1')
      }
    } catch (error) {
      console.error('❌ Error checking for Round 1:', error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Check for predictions needing next rounds
   */
  private async checkForNextRounds() {
    if (this.isRunning) {
      console.log('⏳ Previous task still running, skipping...')
      return
    }

    this.isRunning = true

    try {
      const predictions = await this.monitor.findPredictionsNeedingNextRound()

      if (predictions.length > 0) {
        console.log(`\n📋 Found ${predictions.length} prediction(s) needing next round:`)

        for (const { prediction, nextRound } of predictions) {
          console.log(`   - "${prediction.title}" needs Round ${nextRound}`)
          console.log(`     Prediction ID: ${prediction.id}`)

          try {
            console.log(`     🚀 Starting Round ${nextRound}...`)
            const result = await this.orchestrator.executeRound(prediction.id, nextRound)

            console.log(`     ✅ Round ${nextRound} completed`)
            console.log(`        - Agents: ${result.stats.successfulAgents}/${result.stats.totalAgents}`)
            console.log(`        - Consensus: ${(result.consensusScore * 100).toFixed(1)}%`)
            console.log(`        - Terminate: ${result.shouldTerminate ? 'YES' : 'NO'}`)

            if (result.terminationReason) {
              console.log(`        - Reason: ${result.terminationReason}`)
            }
          } catch (error) {
            console.error(`     ❌ Failed to execute Round ${nextRound}:`, error)
          }
        }
      } else {
        console.log('✓ No predictions need next round')
      }
    } catch (error) {
      console.error('❌ Error checking for next rounds:', error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Print summary of current debate status
   */
  private async printSummary() {
    try {
      const summary = await this.monitor.getDebateSummary()

      console.log('\n📊 Debate Status Summary')
      console.log('-'.repeat(40))
      console.log(`   Total Active Predictions: ${summary.totalPredictions}`)
      console.log(`   Active Debates: ${summary.activeDebates}`)
      console.log(`   Completed Debates: ${summary.completedDebates}`)
      console.log('-'.repeat(40))
    } catch (error) {
      console.error('❌ Error getting summary:', error)
    }
  }

  /**
   * Graceful shutdown
   */
  private shutdown() {
    console.log('\n👋 Shutting down Factagora Agent Worker...')
    process.exit(0)
  }
}

// Start the worker
const worker = new DebateWorker()
worker.start()
