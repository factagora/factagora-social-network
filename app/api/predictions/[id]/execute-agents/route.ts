import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getActiveAgents } from "@/lib/db/agents"
import { createExecutor } from "@/lib/agents/core/agent-executor"
import type { AgentContext, PredictionRequest } from "@/lib/agents/core/types"

/**
 * POST /api/predictions/[id]/execute-agents
 *
 * Execute all active managed agents for a specific prediction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: predictionId } = await params

    // TODO: Fetch real prediction from database
    // For now, using mock data
    const mockPredictionRequest: PredictionRequest = {
      predictionId,
      title: "Bitcoin will reach $150,000 by December 31, 2025",
      description: "This prediction concerns whether Bitcoin (BTC) will reach or exceed a price of $150,000 USD before the end of 2025.",
      category: "Cryptocurrency",
      deadline: "2025-12-31T23:59:59Z",
      roundNumber: 1,
      metadata: {
        resolutionCriteria: "Bitcoin (BTC/USD) must reach or exceed $150,000 on any major exchange (Coinbase, Binance, Kraken) at any point before midnight UTC on December 31, 2025. The price must be verifiable via public exchange APIs or CoinGecko/CoinMarketCap data.",
        sourceLinks: [
          "https://www.coinbase.com/price/bitcoin",
          "https://www.coingecko.com/en/coins/bitcoin"
        ]
      }
    }

    // Get all active MANAGED agents from database
    const dbAgents = await getActiveAgents()
    const activeAgents = dbAgents.filter(agent => agent.mode === 'MANAGED')

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
          // Build AgentContext from stored agent
          const agentContext: AgentContext = {
            id: agent.id,
            name: agent.name,
            mode: agent.mode as 'MANAGED' | 'BYOA',
            personality: agent.personality as any,
            temperature: agent.temperature ?? 0.7,
            systemPrompt: null,
            model: agent.model || 'claude-sonnet-4-5',
          }

          // Create executor using factory
          const executor = createExecutor(agentContext)

          // Execute prediction
          const executionResult = await executor.execute(mockPredictionRequest)

          return {
            agentId: agent.id,
            agentName: agent.name,
            personality: agent.personality,
            success: executionResult.success,
            result: executionResult,
          }
        } catch (error) {
          console.error(`Agent ${agent.id} execution failed:`, error)
          return {
            agentId: agent.id,
            agentName: agent.name,
            personality: agent.personality,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    // Process results
    const executionResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          agentId: activeAgents[index].id,
          agentName: activeAgents[index].name,
          personality: activeAgents[index].personality,
          success: false,
          error: result.reason?.message || 'Execution failed',
        }
      }
    })

    // Count successes and failures
    const successCount = executionResults.filter(r => r.success).length
    const failureCount = executionResults.filter(r => !r.success).length

    // Calculate statistics from successful executions
    const successfulResults = executionResults.filter((r): r is typeof r & { result: any } => r.success && 'result' in r && !!r.result?.response)
    const positionCounts = successfulResults.reduce((acc, r) => {
      const position = r.result.response.position
      acc[position] = (acc[position] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgConfidence = successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + r.result!.response!.confidence, 0) / successfulResults.length
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
      { error: "Failed to execute agents" },
      { status: 500 }
    )
  }
}
