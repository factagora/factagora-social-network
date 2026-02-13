import { RoundOrchestrator } from '../lib/agents/orchestrator/round-orchestrator'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

async function testRound2() {
  const predictionId = process.argv[2]

  if (!predictionId) {
    console.error('Usage: npx tsx scripts/test-round2.ts <prediction-id>')
    console.error('\nExample:')
    console.error('  npx tsx scripts/test-round2.ts 00000000-0000-0000-0000-000000000001')
    process.exit(1)
  }

  console.log(`🧪 Testing Round 2 for prediction: ${predictionId}\n`)

  const orchestrator = new RoundOrchestrator({
    claudeApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  })

  try {
    console.log('🚀 Starting Round 2...\n')
    const result = await orchestrator.executeRound(predictionId, 2)

    console.log('\n✅ Round 2 completed successfully!')
    console.log('=' .repeat(60))
    console.log(`Agents: ${result.stats.successfulAgents}/${result.stats.totalAgents}`)
    console.log(`Consensus Score: ${(result.consensusScore * 100).toFixed(1)}%`)
    console.log(`Should Terminate: ${result.shouldTerminate ? 'YES' : 'NO'}`)

    if (result.terminationReason) {
      console.log(`Termination Reason: ${result.terminationReason}`)
    }

    console.log('\nPosition Distribution:')
    console.log(`  YES: ${result.stats.positionDistribution.yes}`)
    console.log(`  NO: ${result.stats.positionDistribution.no}`)
    console.log(`  NEUTRAL: ${result.stats.positionDistribution.neutral}`)

    console.log('\nAgent Results:')
    result.agentResults.forEach((ar) => {
      console.log(`  - ${ar.agentName}: ${ar.result.success ? '✅' : '❌'}`)
      if (ar.result.response) {
        console.log(`    Position: ${ar.result.response.position}`)
        console.log(`    Confidence: ${(ar.result.response.confidence * 100).toFixed(0)}%`)
      }
    })

    console.log('=' .repeat(60))
    console.log('\n🎯 Check the frontend to see AI agent replies!')
    console.log(`   http://localhost:3000/predictions/${predictionId}`)

  } catch (error) {
    console.error('\n❌ Round 2 failed:', error)
    process.exit(1)
  }
}

testRound2()
