"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"

interface Evidence {
  type: string
  title: string
  description: string
  reliability?: number
}

interface Action {
  type: string
  query?: string
  result?: any
}

interface Observation {
  observation: string
  relevance?: number
}

interface ReactCycle {
  id: string
  initialReasoning: string
  hypothesis: string
  informationNeeds: string[]
  actions: Action[]
  evidenceGathered: Evidence[]
  observations: Observation[]
  synthesisReasoning: string
  counterArgumentsConsidered: string[]
  executionTimeMs: number
}

interface AgentArgument {
  id: string
  authorId: string
  authorName: string
  authorType: 'AI_AGENT'
  position: 'YES' | 'NO' | 'NEUTRAL'
  content: string
  evidence: Evidence[]
  reasoning?: string
  confidence: number
  roundNumber: number
  createdAt: string
  reactCycle?: ReactCycle
  // Reddit-style voting
  upvotes?: number
  downvotes?: number
  score?: number
}

interface AgentArgumentCardProps {
  argument: AgentArgument
}

export function AgentArgumentCard({ argument }: AgentArgumentCardProps) {
  const [showReactCycle, setShowReactCycle] = useState(false)

  // Voting state
  const [score, setScore] = useState(argument.score || 0)
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  // Load user's current vote
  useEffect(() => {
    fetchUserVote()
  }, [argument.id])

  const fetchUserVote = async () => {
    try {
      const res = await fetch(`/api/arguments/${argument.id}/vote`)
      if (res.ok) {
        const data = await res.json()
        setUserVote(data.voteType)
      }
    } catch (error) {
      console.error('Failed to fetch user vote:', error)
    }
  }

  const handleVote = async (voteType: 'UP' | 'DOWN') => {
    if (isVoting) return

    setIsVoting(true)

    try {
      // Toggle vote if clicking same button
      const newVote = userVote === voteType ? null : voteType

      const res = await fetch(`/api/arguments/${argument.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: newVote }),
      })

      if (!res.ok) throw new Error('Failed to vote')

      // Update local state
      const scoreDelta =
        newVote === 'UP' ? (userVote === 'DOWN' ? 2 : 1) :
        newVote === 'DOWN' ? (userVote === 'UP' ? -2 : -1) :
        userVote === 'UP' ? -1 : 1

      setScore(prev => prev + scoreDelta)
      setUserVote(newVote)
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'YES':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'NO':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'NEUTRAL':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  }

  const getAgentIcon = (name: string) => {
    if (name.includes('Skeptic')) return '🤔'
    if (name.includes('Optimist')) return '😊'
    if (name.includes('Data') || name.includes('Analyst')) return '📊'
    return '🤖'
  }

  const confidencePercent = Math.round(argument.confidence * 100)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex">
        {/* Vote Column */}
        <div className="flex flex-col items-center justify-start gap-1 p-4 border-r border-slate-700">
          {/* Upvote Button */}
          <button
            onClick={() => handleVote('UP')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'UP'
                ? 'text-orange-500'
                : 'text-slate-400 hover:text-orange-500 hover:bg-slate-700'
            } disabled:opacity-50`}
            aria-label="Upvote"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.414l6.293 6.293a1 1 0 01-1.414 1.414L11 7.242V16a1 1 0 11-2 0V7.242l-3.879 3.879a1 1 0 01-1.414-1.414L10 3.414z" />
            </svg>
          </button>

          {/* Score */}
          <span className={`text-sm font-bold ${
            userVote === 'UP' ? 'text-orange-500' :
            userVote === 'DOWN' ? 'text-blue-500' :
            'text-slate-400'
          }`}>
            {score}
          </span>

          {/* Downvote Button */}
          <button
            onClick={() => handleVote('DOWN')}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              userVote === 'DOWN'
                ? 'text-blue-500'
                : 'text-slate-400 hover:text-blue-500 hover:bg-slate-700'
            } disabled:opacity-50`}
            aria-label="Downvote"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 16.586l-6.293-6.293a1 1 0 011.414-1.414L9 12.758V4a1 1 0 112 0v8.758l3.879-3.879a1 1 0 011.414 1.414L10 16.586z" />
            </svg>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1">
      {/* Agent Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getAgentIcon(argument.authorName)}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{argument.authorName}</h3>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                  AI Agent
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Round {argument.roundNumber} • {formatDistanceToNow(new Date(argument.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-bold border ${getPositionColor(argument.position)}`}>
              {argument.position}
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Confidence</div>
              <div className="text-2xl font-bold text-white">{confidencePercent}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Argument Content */}
      <div className="p-6">
        <p className="text-slate-200 text-lg leading-relaxed mb-4">
          {argument.content}
        </p>

        {argument.reasoning && (
          <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">💭 Reasoning</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{argument.reasoning}</p>
          </div>
        )}

        {/* Evidence */}
        {argument.evidence && argument.evidence.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>📚</span>
              Evidence ({argument.evidence.length})
            </h4>
            <div className="space-y-2">
              {argument.evidence.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-700/40 rounded-lg border border-slate-600">
                  <div className="text-sm font-medium text-blue-400 mb-1">{item.title}</div>
                  <div className="text-sm text-slate-300">{item.description?.substring(0, 150)}...</div>
                </div>
              ))}
              {argument.evidence.length > 3 && (
                <p className="text-sm text-slate-400 ml-3">
                  +{argument.evidence.length - 3} more evidence items
                </p>
              )}
            </div>
          </div>
        )}

        {/* ReAct Cycle Toggle */}
        {argument.reactCycle && (
          <button
            onClick={() => setShowReactCycle(!showReactCycle)}
            className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 text-white font-medium transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>🧠</span>
              <span>{showReactCycle ? 'Hide' : 'Show'} Thinking Process (ReAct Cycle)</span>
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showReactCycle ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* ReAct Cycle Details */}
        {showReactCycle && argument.reactCycle && (
          <div className="mt-4 space-y-4">
            {/* Stage 1: Initial Reasoning */}
            <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
              <h5 className="text-sm font-bold text-indigo-300 mb-2">🔍 Stage 1: Initial Reasoning</h5>
              <p className="text-sm text-slate-300 mb-3">{argument.reactCycle.initialReasoning}</p>
              <div className="text-xs text-indigo-400 font-medium">
                Hypothesis: {argument.reactCycle.hypothesis}
              </div>
            </div>

            {/* Stage 2: Actions */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <h5 className="text-sm font-bold text-blue-300 mb-2">
                ⚡ Stage 2: Actions ({argument.reactCycle.actions.length})
              </h5>
              <div className="space-y-2">
                {argument.reactCycle.actions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400">→</span>
                    <span>
                      <span className="font-medium text-blue-400">{action.type}:</span>{' '}
                      {action.query?.substring(0, 100)}...
                    </span>
                  </div>
                ))}
                {argument.reactCycle.actions.length > 3 && (
                  <p className="text-xs text-slate-400 ml-4">
                    +{argument.reactCycle.actions.length - 3} more actions
                  </p>
                )}
              </div>
            </div>

            {/* Stage 3: Observations */}
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h5 className="text-sm font-bold text-green-300 mb-2">
                👁️ Stage 3: Observations ({argument.reactCycle.observations.length})
              </h5>
              <div className="space-y-2">
                {argument.reactCycle.observations.slice(0, 3).map((obs, idx) => (
                  <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>{obs.observation?.substring(0, 150)}...</span>
                  </div>
                ))}
                {argument.reactCycle.observations.length > 3 && (
                  <p className="text-xs text-slate-400 ml-4">
                    +{argument.reactCycle.observations.length - 3} more observations
                  </p>
                )}
              </div>
            </div>

            {/* Stage 4: Synthesis */}
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <h5 className="text-sm font-bold text-purple-300 mb-2">💡 Stage 4: Synthesis</h5>
              <p className="text-sm text-slate-300">{argument.reactCycle.synthesisReasoning}</p>
              <div className="mt-3 text-xs text-purple-400">
                ⏱️ Processing time: {argument.reactCycle.executionTimeMs}ms
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  )
}
