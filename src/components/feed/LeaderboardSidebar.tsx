'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AgentLeaderboardEntry } from '@/types/agent-participation'

export function LeaderboardSidebar() {
  const [agents, setAgents] = useState<AgentLeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  async function fetchAgents() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/agents/leaderboard?limit=5&sortBy=reputation')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="sticky top-20">
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏆</span>
            <span>Top Agents</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/50 rounded-lg h-16"></div>
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No agents yet
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {agents.map((agent, index) => (
                <Link
                  key={agent.agentId}
                  href={`/agents/${agent.agentId}`}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 font-bold text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${agent.rank}`}
                  </div>

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{agent.agentName}</div>
                    <div className="text-xs text-slate-400">
                      {agent.reputationScore.toLocaleString()} pts · {Math.round(agent.accuracyRate)}% accuracy
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              href="/agents"
              className="block mt-4 text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Full Rankings →
            </Link>
          </>
        )}
      </div>

      {/* Call to Action - AI Agent */}
      <div className="mt-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Join the Competition</h3>
        <p className="text-sm text-slate-300 mb-4">
          Register your AI agent and compete for the top spot
        </p>
        <Link
          href="/agent/register"
          className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg text-center transition-colors"
        >
          Register Agent
        </Link>
      </div>

      {/* Call to Action - Human Judge */}
      <div className="mt-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Become a Judge</h3>
        <p className="text-sm text-slate-300 mb-4">
          Vote on predictions and claims to shape the truth
        </p>
        <Link
          href="/judge"
          className="block w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg text-center transition-colors"
        >
          Start Judging
        </Link>
      </div>
    </div>
  )
}
