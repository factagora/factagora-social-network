import { NextRequest, NextResponse } from "next/server"
import { mockAgents } from "@/app/api/_mock/data"
import { createExecutor } from "@/lib/agents/core/agent-executor"
import type { AgentContext, PredictionRequest } from "@/lib/agents/core/types"

/**
 * POST /api/predictions/[id]/execute-agents-test
 *
 * Test endpoint - NO AUTH REQUIRED
 * Execute all active managed agents for a specific prediction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: predictionId } = await params

    // Mock prediction request
    const mockPredictionRequest: PredictionRequest = {
      predictionId,
      title: "Bitcoin will reach $150,000 by December 31, 2025",
      description: "This prediction concerns whether Bitcoin (BTC) will reach or exceed a price of $150,000 USD before the end of 2025.",
      category: "Cryptocurrency",
      deadline: "2025-12-31T23:59:59Z",
      roundNumber: 1,
      metadata: {
        resolutionCriteria: "Bitcoin (BTC/USD) must reach or exceed $150,000 on any major exchange (Coinbase, Binance, Kraken) at any point before midnight UTC on December 31, 2025.",
        sourceLinks: [
          "https://www.coinbase.com/price/bitcoin",
          "https://www.coingecko.com/en/coins/bitcoin"
        ]
      }
    }

    // Get all active MANAGED agents
    const activeAgents = Array.from(mockAgents.values())
      .filter(agent => agent.isActive && agent.mode === 'MANAGED')

    console.log(`\n🧪 TEST MODE: Found ${activeAgents.length} active managed agents`)
    activeAgents.forEach(agent => {
      console.log(`   - ${agent.name} (${agent.id}), model: ${agent.model}`)
    })

    if (activeAgents.length === 0) {
      return NextResponse.json(
        { message: "No active managed agents found", results: [] },
        { status: 200 }
      )
    }

    console.log(`🤖 Executing ${activeAgents.length} agents for prediction ${predictionId}`)

    // Execute all agents in parallel
    const results = await Promise.allSettled(
      activeAgents.map(async (agent) => {
        try {
          const agentContext: AgentContext = {
            id: agent.id,
            name: agent.name,
            mode: agent.mode,
            personality: agent.personality,
            temperature: agent.temperature ?? 0.7,
            systemPrompt: null,
            model: agent.model,
          }

          const executor = createExecutor(agentContext)
          const executionResult = await executor.execute(mockPredictionRequest)

          return {
            agentId: agent.id,
            agentName: agent.name,
            personality: agent.personality,
            model: agent.model,
            success: executionResult.success,
            result: executionResult,
          }
        } catch (error) {
          console.error(`Agent ${agent.id} execution failed:`, error)
          return {
            agentId: agent.id,
            agentName: agent.name,
            personality: agent.personality,
            model: agent.model,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    const executionResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          agentId: activeAgents[index].id,
          agentName: activeAgents[index].name,
          personality: activeAgents[index].personality,
          model: activeAgents[index].model,
          success: false,
          error: result.reason?.message || 'Execution failed',
        }
      }
    })

    const successCount = executionResults.filter(r => r.success).length
    const failureCount = executionResults.filter(r => !r.success).length

    const successfulResults = executionResults.filter((r): r is typeof r & { result: any } => r.success && 'result' in r && !!r.result?.response)
    const positionCounts = successfulResults.reduce((acc, r) => {
      const position = r.result.response.position
      acc[position] = (acc[position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgConfidence = successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + r.result.response.confidence, 0) / successfulResults.length
      : 0

    console.log(`✅ Executed ${successCount} agents successfully, ${failureCount} failed`)
    console.log(`📊 Positions: ${JSON.stringify(positionCounts)}, Avg Confidence: ${avgConfidence.toFixed(2)}`)

    return NextResponse.json({
      predictionId,
      roundNumber: 1,
      totalAgents: activeAgents.length,
      successCount,
      failureCount,
      statistics: {
        positionDistribution: positionCounts,
        averageConfidence: avgConfidence,
      },
      results: executionResults,
    })
  } catch (error) {
    console.error("Error executing agents:", error)
    return NextResponse.json(
      { error: "Failed to execute agents", details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
