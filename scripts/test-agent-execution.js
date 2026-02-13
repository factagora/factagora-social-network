/**
 * Simple script to test agent execution
 * Usage: node scripts/test-agent-execution.js
 */

async function testAgentExecution() {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 Testing Agent Execution System\n')

  // Step 1: Check if agents exist
  console.log('📋 Step 1: Checking existing agents...')
  try {
    const agentsResponse = await fetch(`${baseUrl}/api/agents`, {
      headers: {
        'Cookie': 'authjs.session-token=test', // Mock auth for testing
      }
    })

    if (!agentsResponse.ok) {
      console.log('⚠️  Cannot fetch agents (auth required). Status:', agentsResponse.status)
      console.log('   You need to be logged in to test this.')
      console.log('   Please login at http://localhost:3000 first.\n')
      return
    }

    const agents = await agentsResponse.json()
    console.log(`   Found ${agents.length} agents`)

    const activeManaged = agents.filter(a => a.isActive && a.mode === 'MANAGED')
    console.log(`   Active MANAGED agents: ${activeManaged.length}\n`)

    if (activeManaged.length === 0) {
      console.log('⚠️  No active MANAGED agents found.')
      console.log('   Please create an agent at: http://localhost:3000/agent/register\n')
      return
    }

    // Display agents
    activeManaged.forEach(agent => {
      console.log(`   🤖 ${agent.name}`)
      console.log(`      - Personality: ${agent.personality}`)
      console.log(`      - Temperature: ${agent.temperature}`)
    })

  } catch (error) {
    console.error('❌ Error fetching agents:', error.message)
    return
  }

  // Step 2: Execute agents
  console.log('\n🚀 Step 2: Executing agents for prediction...')
  try {
    const executionResponse = await fetch(
      `${baseUrl}/api/predictions/test-prediction-123/execute-agents`,
      {
        method: 'POST',
        headers: {
          'Cookie': 'authjs.session-token=test',
        }
      }
    )

    if (!executionResponse.ok) {
      const errorText = await executionResponse.text()
      console.error(`❌ Execution failed with status ${executionResponse.status}`)
      console.error('Response:', errorText)
      return
    }

    const result = await executionResponse.json()

    console.log('\n✅ Execution completed!')
    console.log('\n📊 Summary:')
    console.log(`   - Total Agents: ${result.totalAgents}`)
    console.log(`   - Successful: ${result.successCount}`)
    console.log(`   - Failed: ${result.failureCount}`)

    if (result.statistics) {
      console.log(`   - Avg Confidence: ${(result.statistics.averageConfidence * 100).toFixed(1)}%`)
      console.log(`   - Position Distribution:`, result.statistics.positionDistribution)
    }

    console.log('\n🤖 Agent Results:\n')
    result.results.forEach((agentResult, index) => {
      console.log(`${index + 1}. ${agentResult.agentName} (${agentResult.personality})`)

      if (agentResult.success && agentResult.result?.response) {
        const response = agentResult.result.response
        console.log(`   ✅ SUCCESS`)
        console.log(`   Position: ${response.position}`)
        console.log(`   Confidence: ${(response.confidence * 100).toFixed(1)}%`)
        console.log(`   Reasoning: ${response.reasoning}`)
        console.log(`   Execution Time: ${agentResult.result.metadata?.executionTimeMs}ms`)
        console.log(`   Tokens Used: ${agentResult.result.metadata?.tokensUsed}`)
      } else {
        console.log(`   ❌ FAILED: ${agentResult.error || 'Unknown error'}`)
      }
      console.log()
    })

    console.log('✅ Test completed successfully!\n')

  } catch (error) {
    console.error('❌ Error executing agents:', error.message)
    console.error(error.stack)
  }
}

// Run the test
testAgentExecution().catch(console.error)
