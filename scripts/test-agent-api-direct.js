/**
 * Direct API test for agent execution
 * Bypasses browser entirely to avoid cache issues
 */

const baseUrl = 'http://localhost:3000'

// Mock session for testing
const mockSession = {
  user: {
    id: '5d375915-4e84-4478-90e8-16ff299e2165',
    email: 'test@example.com',
  }
}

async function testAgentSystem() {
  console.log('🧪 Testing Agent System via Direct API\n')

  try {
    // Step 1: Create a test agent directly via API
    console.log('Step 1: Creating test agent...')

    const agentData = {
      mode: 'MANAGED',
      name: 'API Test Agent',
      description: 'Direct API test agent',
      personality: 'SKEPTIC',
      temperature: 0.7,
      model: 'claude-3-5-sonnet-20241022', // Explicitly set Claude model
    }

    console.log('Agent data:', JSON.stringify(agentData, null, 2))

    const createResponse = await fetch(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error(`❌ Failed to create agent: ${createResponse.status}`)
      console.error('Response:', errorText)
      return
    }

    const agent = await createResponse.json()
    console.log(`✅ Agent created: ${agent.name} (${agent.id})`)
    console.log(`   Model: ${agent.model}`)
    console.log(`   Personality: ${agent.personality}`)
    console.log(`   Active: ${agent.isActive}\n`)

    // Step 2: Execute agents
    console.log('Step 2: Executing agent for prediction...')
    console.log('This will call Anthropic API - may take 5-10 seconds...\n')

    const executeResponse = await fetch(
      `${baseUrl}/api/predictions/test-prediction-123/execute-agents`,
      {
        method: 'POST',
      }
    )

    if (!executeResponse.ok) {
      const errorText = await executeResponse.text()
      console.error(`❌ Execution failed: ${executeResponse.status}`)
      console.error('Response:', errorText)
      return
    }

    const result = await executeResponse.json()

    console.log('✅ Execution completed!\n')
    console.log('═══════════════════════════════════════════════════════')
    console.log('📊 EXECUTION SUMMARY')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`Total Agents: ${result.totalAgents}`)
    console.log(`Successful: ${result.successCount}`)
    console.log(`Failed: ${result.failureCount}`)

    if (result.statistics) {
      console.log(`Average Confidence: ${(result.statistics.averageConfidence * 100).toFixed(1)}%`)
      console.log(`Position Distribution:`, result.statistics.positionDistribution)
    }

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('🤖 AGENT RESULTS')
    console.log('═══════════════════════════════════════════════════════\n')

    result.results.forEach((agentResult, index) => {
      console.log(`${index + 1}. ${agentResult.agentName} (${agentResult.personality})`)
      console.log(`   Agent ID: ${agentResult.agentId}`)

      if (agentResult.success && agentResult.result?.response) {
        const response = agentResult.result.response
        console.log(`   ✅ SUCCESS`)
        console.log(`   Position: ${response.position}`)
        console.log(`   Confidence: ${(response.confidence * 100).toFixed(1)}%`)
        console.log(`   Reasoning: ${response.reasoning}`)

        if (agentResult.result.metadata) {
          console.log(`   Execution Time: ${agentResult.result.metadata.executionTimeMs}ms`)
          console.log(`   Tokens Used: ${agentResult.result.metadata.tokensUsed}`)
          console.log(`   Model: ${agentResult.result.metadata.llmModel}`)
        }

        if (response.reactCycle) {
          console.log(`\n   ReAct Cycle:`)
          console.log(`   - Initial Thought: ${response.reactCycle.initialThought.substring(0, 100)}...`)
          console.log(`   - Actions: ${response.reactCycle.actions?.length || 0}`)
          console.log(`   - Observations: ${response.reactCycle.observations?.length || 0}`)
          console.log(`   - Evidence: ${response.reactCycle.evidence?.length || 0}`)
        }
      } else {
        console.log(`   ❌ FAILED`)
        console.log(`   Error: ${agentResult.error || 'Unknown error'}`)

        if (agentResult.result?.error) {
          console.log(`   Error Code: ${agentResult.result.error.code}`)
          console.log(`   Error Message: ${agentResult.result.error.message}`)
        }
      }
      console.log()
    })

    console.log('═══════════════════════════════════════════════════════')

    if (result.successCount > 0) {
      console.log('\n🎉 TEST PASSED! Agent execution working correctly!\n')
    } else {
      console.log('\n❌ TEST FAILED! No agents executed successfully.\n')
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message)
    console.error(error.stack)
  }
}

// Run the test
console.log('Starting test...\n')
testAgentSystem().catch(console.error)
