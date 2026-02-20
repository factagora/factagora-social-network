"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import type { UnifiedArgument } from "@/types/detail-page"
import { getPositionColor, getAgentIcon } from "@/types/detail-page"

interface UnifiedArgumentCardProps {
  argument: UnifiedArgument
  voteEndpoint: string // e.g. "/api/arguments/{id}/vote" or "/api/claims/{claimId}/arguments/{id}/vote"
  compact?: boolean
  onReply?: (id: string) => void
  onSupport?: (id: string) => void
  onCounter?: (id: string) => void
}

export function UnifiedArgumentCard({
  argument,
  voteEndpoint,
  compact = false,
  onReply,
  onSupport,
  onCounter,
}: UnifiedArgumentCardProps) {
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
      const res = await fetch(voteEndpoint)
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
      const newVote = userVote === voteType ? null : voteType

      const res = await fetch(voteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: newVote }),
      })

      if (!res.ok) throw new Error('Failed to vote')

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

  const isAgent = argument.authorType === 'AI_AGENT'
  const confidencePercent = Math.round(argument.confidence * 100)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex">
        {/* Vote Column */}
        <div className={`flex flex-col items-center justify-start gap-1 ${compact ? 'p-3' : 'p-4'} border-r border-slate-700`}>
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

          <span className={`text-sm font-bold ${
            userVote === 'UP' ? 'text-orange-500' :
            userVote === 'DOWN' ? 'text-blue-500' :
            'text-slate-400'
          }`}>
            {score}
          </span>

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
          {/* Header */}
          <div className={compact ? 'p-4' : 'p-6 border-b border-slate-700'}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {isAgent ? (
                  <>
                    <div className={compact ? 'text-2xl' : 'text-4xl'}>{getAgentIcon(argument.authorName)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-white`}>{argument.authorName}</h3>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                          AI Agent
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">
                        {argument.roundNumber != null && `Round ${argument.roundNumber} • `}
                        {formatDistanceToNow(new Date(argument.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-white font-medium">{argument.authorName}</p>
                      <p className="text-slate-400 text-sm">
                        Human • {formatDistanceToNow(new Date(argument.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-lg font-bold border ${getPositionColor(argument.position)}`}>
                  {argument.position}
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Confidence</div>
                  <div className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-white`}>{confidencePercent}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className={compact ? 'p-4 pt-0' : 'p-6'}>
            <p className={`text-slate-200 ${compact ? 'text-base' : 'text-lg'} leading-relaxed mb-4`}>
              {argument.content}
            </p>

            {/* Reasoning */}
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
                  {argument.evidence.slice(0, compact ? 2 : 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-700/40 rounded-lg border border-slate-600">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 text-xs font-mono">{item.type.toUpperCase()}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-400 mb-1">{item.title}</div>
                          {item.description && (
                            <div className="text-sm text-slate-300">{item.description.substring(0, 150)}...</div>
                          )}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-flex items-center gap-1"
                            >
                              View source
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {argument.evidence.length > (compact ? 2 : 3) && (
                    <p className="text-sm text-slate-400 ml-3">
                      +{argument.evidence.length - (compact ? 2 : 3)} more evidence items
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ReAct Cycle Toggle (AI agents only) */}
            {isAgent && argument.reactCycle && (
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
                <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                  <h5 className="text-sm font-bold text-indigo-300 mb-2">🔍 Stage 1: Initial Reasoning</h5>
                  <p className="text-sm text-slate-300 mb-3">{argument.reactCycle.initialReasoning}</p>
                  <div className="text-xs text-indigo-400 font-medium">
                    Hypothesis: {argument.reactCycle.hypothesis}
                  </div>
                </div>

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

                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h5 className="text-sm font-bold text-purple-300 mb-2">💡 Stage 4: Synthesis</h5>
                  <p className="text-sm text-slate-300">{argument.reactCycle.synthesisReasoning}</p>
                  <div className="mt-3 text-xs text-purple-400">
                    ⏱️ Processing time: {argument.reactCycle.executionTimeMs}ms
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Bar */}
            <div className={`flex items-center justify-between ${compact ? 'pt-3' : 'pt-4'} border-t border-slate-700 mt-4`}>
              <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4'} text-sm`}>
                {argument.qualityScore != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Quality:</span>
                    <span className="text-white font-semibold">{argument.qualityScore}</span>
                    <span className="text-slate-500">/100</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReply?.(argument.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {argument.replyCount}
                </button>

                {argument.supportCount != null && onSupport && (
                  <button
                    onClick={() => onSupport(argument.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {argument.supportCount}
                  </button>
                )}

                {argument.counterCount != null && onCounter && (
                  <button
                    onClick={() => onCounter(argument.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    {argument.counterCount}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
