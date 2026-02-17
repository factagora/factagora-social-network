'use client'

// ReAct Cycle Visualization Component
// Shows the 5-stage reasoning process of an AI agent

import { useState, useEffect } from 'react'
import type { ReActCycleResponse, Action } from '@/src/types/debate'

interface ReActCycleViewProps {
  argumentId: string
}

export function ReActCycleView({ argumentId }: ReActCycleViewProps) {
  const [cycle, setCycle] = useState<ReActCycleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedStage, setExpandedStage] = useState<number | null>(null)

  // Fetch ReAct cycle on mount
  useEffect(() => {
    async function fetchCycle() {
      try {
        const response = await fetch(`/api/arguments/${argumentId}/react-cycle`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('No reasoning process available for this argument')
          } else {
            setError('Failed to load reasoning process')
          }
          return
        }

        const data = await response.json()
        setCycle(data)
      } catch (err) {
        setError('Failed to load reasoning process')
        console.error('Error fetching ReAct cycle:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCycle()
  }, [argumentId])

  // Toggle stage expansion
  const toggleStage = (stageNumber: number) => {
    setExpandedStage(expandedStage === stageNumber ? null : stageNumber)
  }

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      </div>
    )
  }

  // Error state
  if (error || !cycle) {
    return (
      <div className="text-sm text-slate-400 italic">
        {error || 'No reasoning process available'}
      </div>
    )
  }

  // Stage configuration
  const stages = [
    {
      number: 1,
      title: 'Initial Thought',
      icon: '💭',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      content: cycle.initialThought,
    },
    {
      number: 2,
      title: 'Actions',
      icon: '🔍',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      content: cycle.actions,
    },
    {
      number: 3,
      title: 'Observations',
      icon: '👁️',
      color: 'bg-green-500/10 border-green-500/30 text-green-400',
      content: cycle.observations,
    },
    {
      number: 4,
      title: 'Synthesis',
      icon: '🧠',
      color: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      content: cycle.synthesisThought,
    },
    {
      number: 5,
      title: 'Final Answer',
      icon: '✨',
      color: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
      content: 'See argument above',
    },
  ]

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="font-medium">🤖 {cycle.agentName}'s Reasoning Process</span>
        {cycle.confidenceAdjustment !== null && (
          <span className="text-xs">
            (Confidence: {cycle.confidenceAdjustment > 0 ? '+' : ''}
            {(cycle.confidenceAdjustment * 100).toFixed(0)}%)
          </span>
        )}
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {stages.map((stage) => (
          <div key={stage.number} className="border border-slate-700 rounded-lg overflow-hidden">
            {/* Stage Header (Clickable) */}
            <button
              onClick={() => toggleStage(stage.number)}
              className={`w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-slate-800/50 ${stage.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{stage.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-sm">
                    Stage {stage.number}: {stage.title}
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${
                  expandedStage === stage.number ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Stage Content (Expandable) */}
            {expandedStage === stage.number && (
              <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700">
                {stage.number === 2 ? (
                  // Actions (array of objects)
                  <div className="space-y-3">
                    {(stage.content as Action[]).map((action, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 uppercase">
                            {action.type}
                          </span>
                          {action.reliability !== undefined && (
                            <span className="text-xs text-slate-500">
                              ({(action.reliability * 100).toFixed(0)}% reliable)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-300">
                          <strong>Query:</strong> {action.query}
                        </div>
                        <div className="text-sm text-slate-400">{action.result}</div>
                        {action.source && (
                          <a
                            href={action.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Source: {action.source}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : stage.number === 3 ? (
                  // Observations (array of strings)
                  <ul className="space-y-2 list-disc list-inside text-sm text-slate-300">
                    {(stage.content as string[]).map((observation, idx) => (
                      <li key={idx}>{observation}</li>
                    ))}
                  </ul>
                ) : stage.number === 5 ? (
                  // Final Answer (reference)
                  <div className="text-sm text-slate-400 italic">
                    The final answer is the argument shown above. This stage links the reasoning
                    process to the published argument.
                  </div>
                ) : (
                  // Initial Thought & Synthesis (text)
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">
                    {stage.content as string}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-500 text-center">
        <a
          href="https://react-lm.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-400 underline"
        >
          Learn more about ReAct (Reasoning + Acting)
        </a>
      </div>
    </div>
  )
}
