// Test script for Round Orchestrator
// Run with: npx tsx lib/agents/test-orchestrator.ts

import { RoundOrchestrator } from './orchestrator/round-orchestrator'

async function testRoundOrchestrator() {
  console.log('🎬 Testing Round Orchestrator...\n')

  try {
    // Initialize orchestrator
    const orchestrator = new RoundOrchestrator({
      claudeApiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Get prediction ID from command line or use default
    const predictionId = process.argv[2] || 'your-prediction-id-here'

    if (predictionId === 'your-prediction-id-here') {
      console.error('❌ Please provide a prediction ID:')
      console.error('   npx tsx lib/agents/test-orchestrator.ts <prediction-id>')
      console.error('\nOr create a prediction first in the UI')
      process.exit(1)
    }

    console.log(`📋 Prediction ID: ${predictionId}`)
    console.log(`🤖 API Key: ${process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing'}`)
    console.log()

    // Execute Round 1
    console.log('▶️  Executing Round 1...\n')
    const round1 = await orchestrator.executeRound(predictionId, 1)

    console.log('\n📊 Round 1 Results:')
    console.log('─────────────────────────────────────────────────')
    console.log(`Total Agents: ${round1.stats.totalAgents}`)
    console.log(`Successful: ${round1.stats.successfulAgents}`)
    console.log(`Failed: ${round1.stats.failedAgents}`)
    console.log()
    console.log(`Position Distribution:`)
    console.log(`  YES: ${round1.stats.positionDistribution.yes}`)
    console.log(`  NO: ${round1.stats.positionDistribution.no}`)
    console.log(`  NEUTRAL: ${round1.stats.positionDistribution.neutral}`)
    console.log()
    console.log(`Average Confidence: ${(round1.stats.avgConfidence * 100).toFixed(1)}%`)
    console.log(`Consensus Score: ${(round1.consensusScore * 100).toFixed(1)}%`)
    console.log()
    console.log(`Should Terminate: ${round1.shouldTerminate ? '✅ YES' : '❌ NO'}`)
    if (round1.terminationReason) {
      console.log(`Termination Reason: ${round1.terminationReason}`)
    }
    console.log()

    // Show agent details
    console.log('🤖 Agent Results:')
    round1.agentResults.forEach((ar) => {
      const symbol = ar.result.success ? '✅' : '❌'
      console.log(`${symbol} ${ar.agentName}`)
      if (ar.result.success && ar.result.response) {
        console.log(
          `   Position: ${ar.result.response.position} (${(ar.result.response.confidence * 100).toFixed(0)}%)`
        )
        console.log(`   Execution: ${ar.result.metadata.executionTimeMs}ms`)
        console.log(
          `   Evidence: ${ar.result.response.reactCycle.evidence.length} items`
        )
      } else {
        console.log(`   Error: ${ar.result.error?.message}`)
      }
      console.log()
    })

    // Execute Round 2 if needed
    if (!round1.shouldTerminate) {
      console.log('▶️  Executing Round 2...\n')
      const round2 = await orchestrator.executeRound(predictionId, 2)

      console.log('\n📊 Round 2 Results:')
      console.log('─────────────────────────────────────────────────')
      console.log(`Consensus Score: ${(round2.consensusScore * 100).toFixed(1)}%`)
      console.log(`Should Terminate: ${round2.shouldTerminate ? '✅ YES' : '❌ NO'}`)
      if (round2.terminationReason) {
        console.log(`Termination Reason: ${round2.terminationReason}`)
      }
    }

    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

// Run test
testRoundOrchestrator()
