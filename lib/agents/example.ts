// Example usage of Agent Manager
// This is for reference only - not part of the production code

import { AgentManager } from './index'
import type { AgentContext, PredictionRequest } from './core/types'

// Example 1: Execute a single MANAGED agent
async function executeSingleAgent() {
  const manager = new AgentManager({
    claudeApiKey: process.env.ANTHROPIC_API_KEY,
  })

  // Define agent
  const skepticAgent: AgentContext = {
    id: 'agent-001',
    name: 'Skeptic Bot',
    mode: 'MANAGED',
    personality: 'SKEPTIC',
    temperature: 0.2,
    systemPrompt: null,
    model: 'claude-3-5-sonnet-20241022',
    apiKeyEncrypted: null,
  }

  // Define prediction request
  const request: PredictionRequest = {
    predictionId: 'pred-123',
    title: 'Will AGI be achieved by end of 2026?',
    description:
      'Artificial General Intelligence (AGI) - an AI system that can perform any intellectual task that a human can do...',
    category: 'tech',
    deadline: '2026-12-31T23:59:59Z',
    roundNumber: 1,
  }

  // Execute
  const result = await manager.executeAgent(skepticAgent, request)

  if (result.success) {
    console.log('Position:', result.response?.position)
    console.log('Confidence:', result.response?.confidence)
    console.log('Initial Thought:', result.response?.reactCycle.initialThought)
    console.log('Evidence Count:', result.response?.reactCycle.evidence.length)
    console.log('Execution Time:', result.metadata.executionTimeMs, 'ms')
  } else {
    console.error('Error:', result.error?.message)
  }
}

// Example 2: Execute multiple agents in parallel
async function executeMultipleAgents() {
  const manager = new AgentManager({
    claudeApiKey: process.env.ANTHROPIC_API_KEY,
    parallelExecution: true, // Execute in parallel
  })

  // Define 3 agents with different personalities
  const agents: AgentContext[] = [
    {
      id: 'agent-001',
      name: 'Skeptic Bot',
      mode: 'MANAGED',
      personality: 'SKEPTIC',
      temperature: 0.2,
      systemPrompt: null,
      model: 'claude-3-5-sonnet-20241022',
      apiKeyEncrypted: null,
    },
    {
      id: 'agent-002',
      name: 'Optimist Bot',
      mode: 'MANAGED',
      personality: 'OPTIMIST',
      temperature: 0.7,
      systemPrompt: null,
      model: 'claude-3-5-sonnet-20241022',
      apiKeyEncrypted: null,
    },
    {
      id: 'agent-003',
      name: 'Data Analyst Bot',
      mode: 'MANAGED',
      personality: 'DATA_ANALYST',
      temperature: 0.3,
      systemPrompt: null,
      model: 'claude-3-5-sonnet-20241022',
      apiKeyEncrypted: null,
    },
  ]

  const request: PredictionRequest = {
    predictionId: 'pred-123',
    title: 'Will AGI be achieved by end of 2026?',
    description: 'Full prediction description here...',
    category: 'tech',
    deadline: '2026-12-31T23:59:59Z',
    roundNumber: 1,
  }

  // Execute all agents in parallel
  const results = await manager.executeAgents(agents, request)

  // Analyze results
  const successful = results.filter((r) => r.success)
  console.log(`${successful.length}/${results.length} agents succeeded`)

  // Show position distribution
  const positions = successful.map((r) => r.response?.position)
  const yesCount = positions.filter((p) => p === 'YES').length
  const noCount = positions.filter((p) => p === 'NO').length
  const neutralCount = positions.filter((p) => p === 'NEUTRAL').length

  console.log('Position Distribution:')
  console.log(`  YES: ${yesCount}`)
  console.log(`  NO: ${noCount}`)
  console.log(`  NEUTRAL: ${neutralCount}`)

  // Calculate average confidence
  const avgConfidence =
    successful.reduce((sum, r) => sum + (r.response?.confidence || 0), 0) /
    successful.length

  console.log(`Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`)
}

// Example 3: BYOA agent execution
async function executeBYOAAgent() {
  const manager = new AgentManager({})

  const byoaAgent: AgentContext = {
    id: 'agent-byoa-001',
    name: 'Custom Python Agent',
    mode: 'BYOA',
    personality: null,
    temperature: 0.5,
    systemPrompt: null,
    webhookUrl: 'https://myagent.example.com/webhook',
    webhookAuthToken: 'secret-token-12345',
  }

  const request: PredictionRequest = {
    predictionId: 'pred-456',
    title: 'Will Bitcoin exceed $100K by end of 2026?',
    description: 'Cryptocurrency prediction...',
    category: 'economics',
    deadline: '2026-12-31T23:59:59Z',
    roundNumber: 1,
  }

  const result = await manager.executeAgent(byoaAgent, request)

  if (result.success) {
    console.log('BYOA Agent Response:', result.response?.position)
  } else {
    console.error('BYOA Error:', result.error?.message)
  }
}

// Run examples (uncomment to test)
// executeSingleAgent()
// executeMultipleAgents()
// executeBYOAAgent()
