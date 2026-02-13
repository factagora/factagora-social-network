// Test script for both sample predictions
// Run with: npx tsx scripts/test-both-predictions.ts

// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { RoundOrchestrator } from '../lib/agents'

const PREDICTION_AGI = '00000000-0000-0000-0000-000000000001'
const PREDICTION_TESLA = '00000000-0000-0000-0000-000000000002'

async function testPrediction(predictionId: string, title: string) {
  console.log('\n' + '='.repeat(80))
  console.log(`🎯 Testing: ${title}`)
  console.log('='.repeat(80) + '\n')

  try {
    const orchestrator = new RoundOrchestrator({
      claudeApiKey: process.env.ANTHROPIC_API_KEY,
    })

    console.log(`📋 Prediction ID: ${predictionId}`)
    console.log(`▶️  Executing Round 1...\n`)

    const startTime = Date.now()
    const result = await orchestrator.executeRound(predictionId, 1)
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('📊 Results:')
    console.log('─'.repeat(60))
    console.log(`⏱️  Total Duration: ${duration}s`)
    console.log(`🤖 Agents: ${result.stats.successfulAgents}/${result.stats.totalAgents} succeeded`)
    console.log()

    console.log('📈 Position Distribution:')
    console.log(`   YES: ${result.stats.positionDistribution.yes}`)
    console.log(`   NO: ${result.stats.positionDistribution.no}`)
    console.log(`   NEUTRAL: ${result.stats.positionDistribution.neutral}`)
    console.log()

    console.log(`💯 Average Confidence: ${(result.stats.avgConfidence * 100).toFixed(1)}%`)
    console.log(`🎯 Consensus Score: ${(result.consensusScore * 100).toFixed(1)}%`)
    console.log()

    console.log(`🏁 Should Terminate: ${result.shouldTerminate ? '✅ YES' : '❌ NO'}`)
    if (result.terminationReason) {
      console.log(`   Reason: ${result.terminationReason}`)
    }
    console.log()

    console.log('🤖 Individual Agent Results:')
    result.agentResults.forEach((ar, idx) => {
      const symbol = ar.result.success ? '✅' : '❌'
      console.log(`\n${idx + 1}. ${symbol} ${ar.agentName}`)

      if (ar.result.success && ar.result.response) {
        const resp = ar.result.response
        console.log(`   Position: ${resp.position}`)
        console.log(`   Confidence: ${(resp.confidence * 100).toFixed(0)}%`)
        console.log(`   Execution Time: ${ar.result.metadata.executionTimeMs}ms`)
        console.log(`   Evidence Items: ${resp.reactCycle.evidence.length}`)
        console.log(`   Actions Taken: ${resp.reactCycle.actions.length}`)
        console.log(`   Observations: ${resp.reactCycle.observations.length}`)

        // Show first evidence item
        if (resp.reactCycle.evidence.length > 0) {
          const ev = resp.reactCycle.evidence[0]
          console.log(`   Sample Evidence: "${ev.title}"`)
        }

        // Show initial thought (first 100 chars)
        const thought = resp.reactCycle.initialThought.slice(0, 100)
        console.log(`   Initial Thought: "${thought}..."`)
      } else {
        console.log(`   ❌ Error: ${ar.result.error?.message}`)
      }
    })

    return { success: true, result }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error)
    return { success: false, error }
  }
}

async function main() {
  console.log('\n🚀 Starting Round Orchestrator Tests')
  console.log('=' .repeat(80))

  // Check environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY not set!')
    console.error('Set it with: export ANTHROPIC_API_KEY=your_key_here')
    process.exit(1)
  }

  console.log('\n✅ Environment check passed')
  console.log(`   API Key: ${process.env.ANTHROPIC_API_KEY.slice(0, 8)}...`)

  // Test both predictions
  const results = []

  // Test 1: AGI Prediction (Future)
  const test1 = await testPrediction(PREDICTION_AGI, 'AGI by 2026 (Future Prediction)')
  results.push(test1)

  // Wait a bit between tests
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Test 2: Tesla Claim (Fact Check)
  const test2 = await testPrediction(
    PREDICTION_TESLA,
    'Tesla Q4 2025 Revenue (Fact Check)'
  )
  results.push(test2)

  // Summary
  console.log('\n' + '='.repeat(80))
  console.log('📊 Test Summary')
  console.log('='.repeat(80))

  const successCount = results.filter((r) => r.success).length
  console.log(`\n✅ Passed: ${successCount}/2`)
  console.log(`❌ Failed: ${2 - successCount}/2`)

  if (successCount === 2) {
    console.log('\n🎉 All tests passed! Round Orchestrator is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.')
  }

  console.log('\n' + '='.repeat(80))
  console.log('Next steps:')
  console.log('  1. Check results in Supabase:')
  console.log('     - arguments table')
  console.log('     - agent_react_cycles table')
  console.log('     - debate_rounds table')
  console.log('  2. View in UI: http://localhost:3000/predictions')
  console.log('  3. Add "Start Debate" button to UI')
  console.log('='.repeat(80) + '\n')
}

main().catch(console.error)
