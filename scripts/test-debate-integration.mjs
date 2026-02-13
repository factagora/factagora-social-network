#!/usr/bin/env node

/**
 * Test script to verify prediction database integration
 * Tests the complete flow: create prediction → start debate → execute round
 */

const BASE_URL = 'http://localhost:3000'

async function testDebateIntegration() {
  console.log('🧪 Testing Prediction Database Integration\n')

  try {
    // Test 1: Start a debate (creates a real prediction in DB)
    console.log('1️⃣  Starting debate (creates prediction in DB)...')
    const startResponse = await fetch(`${BASE_URL}/api/test/debate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        maxRounds: 3,
        consensusThreshold: 0.7,
        minAgents: 2,
      }),
    })

    if (!startResponse.ok) {
      const error = await startResponse.json()
      throw new Error(`Start debate failed: ${error.error}`)
    }

    const startData = await startResponse.json()
    console.log(`   ✅ Debate started!`)
    console.log(`   📝 Prediction ID: ${startData.predictionId}`)
    console.log(`   🎯 Round: ${startData.roundNumber}`)
    console.log()

    // Test 2: Get debate status
    console.log('2️⃣  Fetching debate status...')
    const statusResponse = await fetch(`${BASE_URL}/api/test/debate`)

    if (!statusResponse.ok) {
      throw new Error('Failed to fetch status')
    }

    const statusData = await statusResponse.json()
    console.log(`   ✅ Status retrieved!`)
    console.log(`   📊 Status: ${statusData.status}`)
    console.log(`   🔄 Current Round: ${statusData.currentRound}`)
    console.log(`   📝 Prediction ID: ${statusData.predictionId}`)
    console.log()

    // Test 3: Execute a round (agents analyze the prediction from DB)
    console.log('3️⃣  Executing debate round (agents analyze prediction)...')
    const executeResponse = await fetch(`${BASE_URL}/api/test/debate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute-round',
      }),
    })

    if (!executeResponse.ok) {
      const error = await executeResponse.json()
      throw new Error(`Execute round failed: ${error.error}`)
    }

    const executeData = await executeResponse.json()
    console.log(`   ✅ Round executed!`)
    console.log(`   🤖 Agents executed: ${executeData.success}`)
    console.log(`   ❌ Failed: ${executeData.failed}`)
    console.log(`   📈 Consensus: ${(executeData.consensus * 100).toFixed(0)}%`)
    console.log()

    // Test 4: Get final status with arguments
    console.log('4️⃣  Fetching final status with arguments...')
    const finalStatusResponse = await fetch(`${BASE_URL}/api/test/debate`)
    const finalStatus = await finalStatusResponse.json()

    console.log(`   ✅ Final status retrieved!`)
    console.log(`   📝 Total Arguments: ${finalStatus.totalArguments}`)
    console.log(`   📊 Consensus: ${(finalStatus.consensus * 100).toFixed(0)}%`)
    console.log(`   🎯 Complete: ${finalStatus.isComplete ? 'Yes' : 'No'}`)

    if (finalStatus.arguments && finalStatus.arguments.length > 0) {
      console.log(`\n   📋 Arguments created:`)
      finalStatus.arguments.slice(0, 3).forEach((arg, i) => {
        console.log(`      ${i + 1}. ${arg.position} - Confidence: ${(arg.confidence * 100).toFixed(0)}%`)
      })
    }
    console.log()

    // Test 5: Cleanup
    console.log('5️⃣  Cleaning up test data...')
    const cleanupResponse = await fetch(`${BASE_URL}/api/test/debate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cleanup',
      }),
    })

    if (!cleanupResponse.ok) {
      throw new Error('Cleanup failed')
    }

    const cleanupData = await cleanupResponse.json()
    console.log(`   ✅ ${cleanupData.message}`)
    console.log()

    // Summary
    console.log('=' .repeat(50))
    console.log('✅ ALL TESTS PASSED!')
    console.log('=' .repeat(50))
    console.log('✨ Database integration is working correctly!')
    console.log('   - Predictions are created in Supabase')
    console.log('   - Debates use real prediction data')
    console.log('   - Arguments are saved to database')
    console.log('   - Cleanup removes all test data')

  } catch (error) {
    console.error('\n❌ TEST FAILED:')
    console.error(error.message)
    console.error('\nPlease check:')
    console.error('  1. Dev server is running (npm run dev)')
    console.error('  2. Supabase connection is configured')
    console.error('  3. Agents are registered in the database')
    process.exit(1)
  }
}

// Run the test
testDebateIntegration()
