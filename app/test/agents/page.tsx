'use client'

import { useState } from 'react'

export default function TestAgentsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function testAgentExecution() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/predictions/test-prediction-123/execute-agents', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🧪 Agent Execution Test</h1>

        {/* Test Button */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Test Agent Execution</h2>
          <p className="text-slate-400 mb-4">
            This will execute all active MANAGED agents on a mock Bitcoin prediction.
          </p>
          <button
            onClick={testAgentExecution}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '⏳ Executing Agents...' : '🚀 Run Test'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-red-400 mb-2">❌ Error</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Execution Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Agents</p>
                  <p className="text-2xl font-bold text-white">{result.totalAgents}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Successful</p>
                  <p className="text-2xl font-bold text-green-400">{result.successCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{result.failureCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Avg Confidence</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {result.statistics?.averageConfidence
                      ? `${(result.statistics.averageConfidence * 100).toFixed(0)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Position Distribution */}
              {result.statistics?.positionDistribution && (
                <div className="mt-6">
                  <p className="text-sm text-slate-400 mb-2">Position Distribution</p>
                  <div className="flex gap-4">
                    {Object.entries(result.statistics.positionDistribution).map(([position, count]) => (
                      <div key={position} className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          position === 'YES' ? 'bg-green-500/20 text-green-400' :
                          position === 'NO' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {position}
                        </span>
                        <span className="text-white font-bold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Individual Results */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🤖 Agent Results</h3>
              <div className="space-y-4">
                {result.results?.map((agentResult: any) => (
                  <div
                    key={agentResult.agentId}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                  >
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-white">{agentResult.agentName}</h4>
                        <p className="text-sm text-slate-400">{agentResult.personality}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          agentResult.success
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {agentResult.success ? '✅ Success' : '❌ Failed'}
                      </span>
                    </div>

                    {/* Success Details */}
                    {agentResult.success && agentResult.result?.response && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Position</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                agentResult.result.response.position === 'YES'
                                  ? 'bg-green-500/20 text-green-400'
                                  : agentResult.result.response.position === 'NO'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}
                            >
                              {agentResult.result.response.position}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Confidence</p>
                            <p className="text-lg font-bold text-blue-400">
                              {(agentResult.result.response.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400 mb-1">Reasoning</p>
                          <p className="text-sm text-slate-300">
                            {agentResult.result.response.reasoning || 'No reasoning provided'}
                          </p>
                        </div>

                        {/* ReAct Cycle */}
                        {agentResult.result.response.reactCycle && (
                          <details className="mt-4">
                            <summary className="text-sm text-blue-400 cursor-pointer hover:text-blue-300">
                              View ReAct Cycle
                            </summary>
                            <div className="mt-3 space-y-2 text-xs">
                              <div>
                                <p className="text-slate-400">Initial Thought:</p>
                                <p className="text-slate-300">
                                  {agentResult.result.response.reactCycle.initialThought}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Synthesis:</p>
                                <p className="text-slate-300">
                                  {agentResult.result.response.reactCycle.synthesisThought}
                                </p>
                              </div>
                            </div>
                          </details>
                        )}

                        {/* Metadata */}
                        <div className="pt-3 border-t border-slate-700 flex gap-4 text-xs text-slate-400">
                          <span>⏱️ {agentResult.result.metadata?.executionTimeMs}ms</span>
                          <span>🔤 {agentResult.result.metadata?.tokensUsed} tokens</span>
                          <span>🤖 {agentResult.result.metadata?.llmModel}</span>
                        </div>
                      </div>
                    )}

                    {/* Error Details */}
                    {!agentResult.success && agentResult.error && (
                      <div className="text-sm text-red-300">
                        <p className="font-semibold mb-1">Error:</p>
                        <p>{agentResult.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Raw JSON */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <summary className="text-lg font-bold text-white cursor-pointer hover:text-slate-300">
                📄 Raw JSON Response
              </summary>
              <pre className="mt-4 p-4 bg-slate-900 rounded-lg overflow-x-auto text-xs text-slate-300">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        {!result && !error && !loading && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">📝 Prerequisites</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Go to <a href="/agent/register" className="text-blue-400 hover:underline">/agent/register</a></li>
              <li>Create at least one MANAGED agent with any personality</li>
              <li>Make sure the agent is active</li>
              <li>Come back and click "Run Test"</li>
            </ol>
            <p className="mt-4 text-sm text-slate-400">
              💡 The test will execute all active managed agents on a mock Bitcoin prediction.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
