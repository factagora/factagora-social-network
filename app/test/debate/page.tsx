"use client"

import { useState } from "react"

export default function DebateTestPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Use test-only API route that bypasses authentication
  const testApiBase = '/api/test/debate'

  async function startDebate() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(testApiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          maxRounds: 3, // Test with 3 rounds
          consensusThreshold: 0.7,
          minAgents: 2,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start debate')
      }

      setResult(data)
      await loadStatus()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function executeRound() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(testApiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-round',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute round')
      }

      setResult(data)
      await loadStatus()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadStatus() {
    try {
      const response = await fetch(testApiBase)
      const data = await response.json()

      if (response.ok) {
        setStatus(data)
      }
    } catch (err) {
      console.error('Failed to load status:', err)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Multi-Round Debate Test</h1>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={startDebate}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start New Debate'}
          </button>

          <button
            onClick={executeRound}
            disabled={loading || !status || status.isComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Executing...' : 'Execute Current Round'}
          </button>

          <button
            onClick={loadStatus}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Last Operation Result */}
      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Last Operation Result</h2>
          <pre className="bg-white p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Debate Status */}
      {status && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debate Status</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold">{status.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Round</p>
              <p className="text-lg font-semibold">{status.currentRound}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Consensus</p>
              <p className="text-lg font-semibold">{(status.consensus * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-lg font-semibold">{status.avgConfidence ? (status.avgConfidence * 100).toFixed(0) + '%' : 'N/A'}</p>
            </div>
          </div>

          {/* Position Distribution */}
          {status.positionDistribution && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Position Distribution</p>
              <div className="flex gap-4">
                <div className="flex-1 bg-green-100 p-3 rounded text-center">
                  <p className="text-sm text-gray-600">YES</p>
                  <p className="text-2xl font-bold">{status.positionDistribution.YES || 0}</p>
                </div>
                <div className="flex-1 bg-red-100 p-3 rounded text-center">
                  <p className="text-sm text-gray-600">NO</p>
                  <p className="text-2xl font-bold">{status.positionDistribution.NO || 0}</p>
                </div>
                <div className="flex-1 bg-gray-100 p-3 rounded text-center">
                  <p className="text-sm text-gray-600">NEUTRAL</p>
                  <p className="text-2xl font-bold">{status.positionDistribution.NEUTRAL || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rounds History */}
          {status.rounds && status.rounds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Rounds History</h3>
              <div className="space-y-2">
                {status.rounds.map((round: any) => (
                  <div key={round.roundNumber} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Round {round.roundNumber}</p>
                        <p className="text-sm text-gray-600">
                          Arguments: {round.argumentsSubmitted} |
                          Consensus: {(round.consensus * 100).toFixed(0)}%
                        </p>
                      </div>
                      {round.isFinal && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          Final
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arguments */}
          {status.arguments && status.arguments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Arguments ({status.arguments.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {status.arguments.map((arg: any) => (
                  <div key={arg.id} className="border rounded p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          arg.position === 'YES' ? 'bg-green-100 text-green-800' :
                          arg.position === 'NO' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {arg.position}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          Round {arg.roundNumber} | Confidence: {(arg.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{arg.reasoning || arg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!status && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Click "Start New Debate" to begin a new multi-round debate</li>
            <li>Click "Execute Current Round" to run the current round with all active agents</li>
            <li>Agents will analyze the prediction and previous arguments (if any)</li>
            <li>The debate continues until consensus is reached or max rounds exceeded</li>
            <li>Click "Refresh Status" to see the latest debate state</li>
          </ol>
        </div>
      )}
    </div>
  )
}
