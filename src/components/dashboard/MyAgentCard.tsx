'use client'

import Link from 'next/link'

interface Agent {
  id: string
  mode: 'MANAGED' | 'BYOA'
  name: string
  description: string | null
  personality: string | null
  temperature: number | null
  isActive: boolean
  createdAt: string
  stats: {
    score: number
    totalPredictions: number
    correctPredictions: number
    accuracy: number
  }
}

interface MyAgentCardProps {
  agent: Agent
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
  'SKEPTIC': 'The Skeptic',
  'OPTIMIST': 'The Optimist',
  'DATA_ANALYST': 'The Data Analyst',
  'DOMAIN_EXPERT': 'The Domain Expert',
  'CONTRARIAN': 'The Contrarian',
  'MEDIATOR': 'The Mediator',
}

export function MyAgentCard({ agent, onDeactivate, onDelete }: MyAgentCardProps) {
  const getPersonalityDisplay = () => {
    if (!agent.personality) return null
    const icon = PERSONALITY_ICONS[agent.personality] || '🤖'
    const label = PERSONALITY_LABELS[agent.personality] || agent.personality
    return `${icon} ${label}`
  }

  return (
    <div className={`bg-slate-800/30 border ${agent.isActive ? 'border-slate-700/50' : 'border-slate-700/30'} rounded-xl p-6 ${!agent.isActive && 'opacity-50'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{agent.name}</h3>
            {!agent.isActive && (
              <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className={agent.mode === 'MANAGED' ? 'text-blue-400' : 'text-purple-400'}>
              {agent.mode === 'MANAGED' ? '🤖 Managed' : '🔗 BYOA'}
            </span>
            {agent.mode === 'MANAGED' && agent.personality && (
              <>
                <span>•</span>
                <span>{getPersonalityDisplay()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-sm text-slate-300 mb-4 line-clamp-2">
          {agent.description}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Score</div>
          <div className="text-lg font-bold text-white">{agent.stats.score}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Predictions</div>
          <div className="text-lg font-bold text-white">{agent.stats.totalPredictions}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Correct</div>
          <div className="text-lg font-bold text-green-400">{agent.stats.correctPredictions}</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Accuracy</div>
          <div className="text-lg font-bold text-blue-400">
            {agent.stats.totalPredictions > 0 ? `${agent.stats.accuracy}%` : '-'}
          </div>
        </div>
      </div>

      {/* Managed Agent Details */}
      {agent.mode === 'MANAGED' && agent.temperature !== null && (
        <div className="mb-4 pb-4 border-b border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Temperature</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${agent.temperature * 100}%` }}
              />
            </div>
            <span className="text-sm text-white">{agent.temperature.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/agents/${agent.id}`}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors text-center"
        >
          상세보기
        </Link>
        {agent.isActive ? (
          <button
            onClick={() => onDeactivate?.(agent.id)}
            className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            비활성화
          </button>
        ) : (
          <button
            onClick={() => onDelete?.(agent.id)}
            className="py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  )
}
