"use client"

import { useState, useEffect } from "react"

interface DebateRound {
  roundNumber: number
  startedAt: string
  endedAt: string | null
  consensus: number
  positionDistribution: Record<string, number>
  avgConfidence: number
  argumentsSubmitted: number
  isFinal: boolean
  terminationReason: string | null
}

interface DebateArgument {
  id: string
  authorId: string
  authorType: string
  position: 'YES' | 'NO' | 'NEUTRAL'
  content: string
  reasoning: string
  confidence: number
  roundNumber: number
  createdAt: string
}

interface DebateStatus {
  predictionId: string
  status: string
  currentRound: number
  isComplete: boolean
  consensus: number
  positionDistribution: Record<string, number>
  avgConfidence: number
  terminationReason: string | null
  totalArguments: number
  rounds: DebateRound[]
  arguments: DebateArgument[]
}

interface DebateOrchestratorProps {
  predictionId: string
  onDebateUpdate?: () => void
}

export function DebateOrchestrator({ predictionId, onDebateUpdate }: DebateOrchestratorProps) {
  const [status, setStatus] = useState<DebateStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    loadDebateStatus()
  }, [predictionId])

  const loadDebateStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/predictions/${predictionId}/debate`)

      if (!response.ok) {
        if (response.status === 404) {
          // No debate started yet
          setStatus(null)
          return
        }
        throw new Error('Failed to load debate status')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      console.error('Error loading debate status:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const startDebate = async () => {
    try {
      setExecuting(true)
      setError(null)

      const response = await fetch(`/api/predictions/${predictionId}/start-debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxRounds: 5,
          consensusThreshold: 0.7,
          minAgents: 2,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start debate')
      }

      await loadDebateStatus()
      onDebateUpdate?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setExecuting(false)
    }
  }

  const executeRound = async () => {
    try {
      setExecuting(true)
      setError(null)

      const response = await fetch(`/api/predictions/${predictionId}/execute-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to execute round')
      }

      await loadDebateStatus()
      onDebateUpdate?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setExecuting(false)
    }
  }

  if (loading && !status) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="text-center text-slate-400">Loading debate status...</div>
      </div>
    )
  }

  // No debate started yet
  if (!status) {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">🤖 AI Multi-Round Debate</h3>
          <p className="text-slate-400 mb-6">
            Let AI agents analyze this prediction through multiple rounds of debate
          </p>
          <button
            onClick={startDebate}
            disabled={executing}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executing ? 'Starting Debate...' : '🚀 Start AI Debate'}
          </button>
          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>
    )
  }

  // Debate in progress or completed
  return (
    <div className="space-y-6">
      {/* Debate Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span>🤖</span>
              AI Multi-Round Debate
            </h3>
            <p className="text-slate-400">
              {status.isComplete ?
                `Debate concluded after ${status.currentRound} round${status.currentRound > 1 ? 's' : ''}` :
                `Round ${status.currentRound} in progress`
              }
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            status.isComplete ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
          }`}>
            {status.isComplete ? '✓ Complete' : '⏳ Active'}
          </div>
        </div>

        {/* Debate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Consensus</div>
            <div className="text-2xl font-bold text-white">
              {(status.consensus * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Rounds</div>
            <div className="text-2xl font-bold text-white">
              {status.currentRound}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Arguments</div>
            <div className="text-2xl font-bold text-white">
              {status.totalArguments}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Avg Confidence</div>
            <div className="text-2xl font-bold text-white">
              {status.avgConfidence ? (status.avgConfidence * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        {/* Position Distribution */}
        {status.positionDistribution && Object.keys(status.positionDistribution).length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-slate-400 mb-2">Position Distribution</div>
            <div className="flex gap-3">
              {['YES', 'NO', 'NEUTRAL'].map(position => (
                <div key={position} className={`flex-1 rounded-lg p-3 text-center ${
                  position === 'YES' ? 'bg-green-500/20' :
                  position === 'NO' ? 'bg-red-500/20' :
                  'bg-gray-500/20'
                }`}>
                  <div className={`text-sm font-medium ${
                    position === 'YES' ? 'text-green-300' :
                    position === 'NO' ? 'text-red-300' :
                    'text-gray-300'
                  }`}>
                    {position}
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {status.positionDistribution[position] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!status.isComplete && (
          <div className="flex gap-3">
            <button
              onClick={executeRound}
              disabled={executing}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {executing ? '⏳ Executing...' : '▶️ Execute Next Round'}
            </button>
            <button
              onClick={loadDebateStatus}
              disabled={executing}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {status.terminationReason && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>Conclusion:</strong> {
                status.terminationReason === 'CONSENSUS' ? 'Consensus reached' :
                status.terminationReason === 'MAX_ROUNDS' ? 'Maximum rounds reached' :
                status.terminationReason === 'DEADLINE' ? 'Deadline reached' :
                status.terminationReason
              }
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}
      </div>

      {/* Round History */}
      {status.rounds && status.rounds.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h4 className="text-xl font-bold text-white mb-4">📊 Round History</h4>
          <div className="space-y-3">
            {status.rounds.map((round) => (
              <div
                key={round.roundNumber}
                className={`p-4 rounded-lg border ${
                  round.isFinal
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-slate-700/30 border-slate-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      Round {round.roundNumber}
                    </span>
                    {round.isFinal && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded">
                        Final
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {round.argumentsSubmitted} argument{round.argumentsSubmitted !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Consensus: </span>
                    <span className="text-white font-semibold">
                      {(round.consensus * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Confidence: </span>
                    <span className="text-white font-semibold">
                      {(round.avgConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Position: </span>
                    <span className="text-white font-semibold">
                      {Object.entries(round.positionDistribution || {})
                        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arguments by Round - Will be displayed by parent component using existing AgentArgumentCard */}
    </div>
  )
}
