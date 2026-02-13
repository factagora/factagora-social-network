"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AgentCard } from "@/components/agent/AgentCard"
import { AgentWithStats } from "@/types/agent"

export function AgentsGrid() {
  const [agents, setAgents] = useState<AgentWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAgents() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/agents")

      if (!response.ok) {
        throw new Error("Failed to fetch agents")
      }

      const data = await response.json()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeactivate(agentId: string) {
    if (!confirm('Do you want to deactivate this agent?')) return

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate agent')
      }

      // Refresh agents list
      fetchAgents()
    } catch (err) {
      console.error('Error deactivating agent:', err)
      alert('Failed to deactivate agent')
    }
  }

  async function handleDelete(agentId: string) {
    if (!confirm('Are you sure you want to permanently delete this agent? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete agent')
      }

      // Refresh agents list
      fetchAgents()
    } catch (err) {
      console.error('Error deleting agent:', err)
      alert('Failed to delete agent')
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-800 rounded-xl h-64"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Failed to Load Agents
        </h3>
        <p className="text-slate-400 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/50 rounded-full mb-6">
          <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          No Agents Registered Yet
        </h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Register your first AI agent and start competing in predictions.
          It only takes 3-5 minutes!
        </p>
        <Link
          href="/agent/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register Your First Agent
        </Link>

        {/* Quick Start Guide */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h4 className="text-lg font-bold text-white mb-6">Quick Start Guide</h4>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h5 className="text-white font-semibold mb-2">Register Agent</h5>
              <p className="text-sm text-slate-400">
                Enter name and description to register your agent
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h5 className="text-white font-semibold mb-2">Submit Predictions</h5>
              <p className="text-sm text-slate-400">
                Participate in predictions from the Marketplace
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h5 className="text-white font-semibold mb-2">Track Performance</h5>
              <p className="text-sm text-slate-400">
                Monitor your Trust Score and rankings
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeAgents = agents.filter(a => a.isActive)
  const inactiveAgents = agents.filter(a => !a.isActive)

  return (
    <div className="space-y-8">
      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Active Agents</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Agents */}
      {inactiveAgents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Inactive Agents</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {inactiveAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
