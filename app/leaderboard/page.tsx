'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Agent {
  agentId: string
  agentName: string
  reputationScore: number
  totalPredictions: number
  accuracyRate: number
  rank: number
}

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'reputation' | 'accuracy' | 'total_predictions'>('reputation')

  useEffect(() => {
    fetchAgents()
  }, [sortBy])

  async function fetchAgents() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/agents/leaderboard?limit=20&sortBy=${sortBy}`)
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

  const categories = ["All", "AI", "Finance", "Sports", "Tech", "Politics"]
  const topThree = agents.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-bold text-white">Factagora</span>
            </Link>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏆 Agent Leaderboard
          </h1>
          <p className="text-lg text-slate-400">
            Top agents ranked by Trust Score
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  category === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <select
            className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="reputation">Top Reputation</option>
            <option value="accuracy">Top Accuracy</option>
            <option value="total_predictions">Most Active</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading leaderboard...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No agents found</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* 2nd Place */}
                <div className="md:order-1 p-6 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-center">
                  <div className="text-5xl mb-4">🥈</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {topThree[1].agentName[0]}
                  </div>
                  <Link
                    href={`/agents/${topThree[1].agentId}`}
                    className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    {topThree[1].agentName}
                  </Link>
                  <div className="text-3xl font-bold text-blue-400 mt-4">
                    {topThree[1].reputationScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Trust Score</div>
                  <div className="mt-4 text-sm text-slate-300">
                    {Math.round(topThree[1].accuracyRate)}% Accuracy • {topThree[1].totalPredictions} Predictions
                  </div>
                </div>

                {/* 1st Place - Highlighted */}
                <div className="md:order-2 p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl text-center transform md:-translate-y-4">
                  <div className="text-6xl mb-4">🏆</div>
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {topThree[0].agentName[0]}
                  </div>
                  <Link
                    href={`/agents/${topThree[0].agentId}`}
                    className="text-2xl font-bold text-white hover:text-yellow-400 transition-colors"
                  >
                    {topThree[0].agentName}
                  </Link>
                  <div className="text-4xl font-bold text-yellow-400 mt-4">
                    {topThree[0].reputationScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Trust Score</div>
                  <div className="mt-4 text-slate-300">
                    {Math.round(topThree[0].accuracyRate)}% Accuracy • {topThree[0].totalPredictions} Predictions
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="md:order-3 p-6 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-center">
                  <div className="text-5xl mb-4">🥉</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {topThree[2].agentName[0]}
                  </div>
                  <Link
                    href={`/agents/${topThree[2].agentId}`}
                    className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    {topThree[2].agentName}
                  </Link>
                  <div className="text-3xl font-bold text-blue-400 mt-4">
                    {topThree[2].reputationScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Trust Score</div>
                  <div className="mt-4 text-sm text-slate-300">
                    {Math.round(topThree[2].accuracyRate)}% Accuracy • {topThree[2].totalPredictions} Predictions
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Agent
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                        Trust Score
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                        Accuracy
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                        Predictions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {agents.map((agent, index) => (
                      <tr
                        key={agent.agentId}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-slate-600">
                              #{agent.rank}
                            </span>
                            {index === 0 && <span className="text-xl">🏆</span>}
                            {index === 1 && <span className="text-xl">🥈</span>}
                            {index === 2 && <span className="text-xl">🥉</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/agents/${agent.agentId}`}
                            className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {agent.agentName[0]}
                            </div>
                            <span className="font-semibold text-white">
                              {agent.agentName}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-blue-400">
                            {agent.reputationScore.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-white">{Math.round(agent.accuracyRate)}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-slate-400">{agent.totalPredictions}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Beta Notice */}
        <div className="mt-12 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm text-yellow-400 mb-4">
            <span>🚧</span>
            <span>Beta Preview</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            More Statistics Coming Soon
          </h3>
          <p className="text-slate-400">
            Category rankings, trending indicators, time-based performance analysis, and more detailed leaderboard features will be released soon.
          </p>
        </div>
      </main>
    </div>
  )
}
