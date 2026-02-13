"use client"

import Link from "next/link"
import { AgentWithStats } from "@/types/agent"

interface AgentCardProps {
  agent: AgentWithStats
  onDeactivate?: (id: string) => void
  onDelete?: (id: string) => void
}

const PERSONALITY_ICONS: Record<string, string> = {
  'SKEPTIC': '🔍',
  'OPTIMIST': '🚀',
  'DATA_ANALYST': '📊',
  'DOMAIN_EXPERT': '🎓',
  'CONTRARIAN': '⚡',
  'MEDIATOR': '⚖️',
}

const PERSONALITY_LABELS: Record<string, string> = {
  'SKEPTIC': 'Skeptic',
  'OPTIMIST': 'Optimist',
  'DATA_ANALYST': 'Data Analyst',
  'DOMAIN_EXPERT': 'Domain Expert',
  'CONTRARIAN': 'Contrarian',
  'MEDIATOR': 'Mediator',
}

export function AgentCard({ agent, onDeactivate, onDelete }: AgentCardProps) {
  const formattedDate = new Date(agent.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Helper to get personality display
  const getPersonalityDisplay = () => {
    const personality = (agent as any).personality
    if (!personality) return null
    const icon = PERSONALITY_ICONS[personality] || '🤖'
    const label = PERSONALITY_LABELS[personality] || personality
    return `${icon} ${label}`
  }

  const mode = (agent as any).mode || 'MANAGED'
  const personality = (agent as any).personality
  const temperature = (agent as any).temperature

  return (
    <div className={`bg-slate-800/50 border ${agent.isActive ? 'border-slate-700' : 'border-slate-700/30'} rounded-xl p-6 hover:border-blue-500/50 transition-all ${!agent.isActive && 'opacity-50'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{agent.name}</h3>
            {agent.isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Active
              </span>
            ) : (
              <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded-full text-xs">
                Inactive
              </span>
            )}
          </div>

          {/* Mode and Personality */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span className={mode === 'MANAGED' ? 'text-blue-400' : 'text-purple-400'}>
              {mode === 'MANAGED' ? '🤖 Managed' : '🔗 BYOA'}
            </span>
            {mode === 'MANAGED' && personality && (
              <>
                <span>•</span>
                <span>{getPersonalityDisplay()}</span>
              </>
            )}
          </div>

          {agent.description && (
            <p className="text-sm text-slate-400 mb-2">{agent.description}</p>
          )}
          <p className="text-xs text-slate-500">Registered: {formattedDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-xs text-slate-400 mb-1">Trust Score</p>
          <p className="text-lg font-bold text-white">{agent.stats.score.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Predictions</p>
          <p className="text-lg font-bold text-white">{agent.stats.totalPredictions}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Accuracy</p>
          <p className="text-lg font-bold text-white">
            {agent.stats.accuracy.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Success</p>
          <p className="text-lg font-bold text-green-400">
            {agent.stats.correctPredictions}
          </p>
        </div>
      </div>

      {/* Temperature (Managed only) */}
      {mode === 'MANAGED' && temperature !== null && (
        <div className="mb-4 pb-4 border-b border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Temperature</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${temperature * 100}%` }}
              />
            </div>
            <span className="text-sm text-white">{temperature.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/agent/${agent.id}`}
          className="flex-1 py-2 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View Details
        </Link>
        {agent.isActive ? (
          <button
            onClick={() => onDeactivate?.(agent.id)}
            className="flex-1 py-2 text-center bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => onDelete?.(agent.id)}
            className="flex-1 py-2 text-center bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-semibold rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
