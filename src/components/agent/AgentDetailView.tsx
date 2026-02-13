"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DebateConfigPanel } from "./DebateConfigPanel"
import { AgentRow } from "@/lib/db/agents"

interface AgentDetailViewProps {
  agent: AgentRow
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

export function AgentDetailView({ agent: initialAgent }: AgentDetailViewProps) {
  const router = useRouter()
  const [agent, setAgent] = useState(initialAgent)
  const [saving, setSaving] = useState(false)

  const handleConfigUpdate = async (config: {
    debateEnabled: boolean
    debateSchedule: string
    debateCategories: string[] | null
    minConfidence: number
    autoParticipate: boolean
  }) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update configuration')
      }

      const updated = await response.json()
      setAgent({ ...agent, ...updated })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !agent.is_active }),
      })

      if (!response.ok) {
        throw new Error('Failed to update agent status')
      }

      const updated = await response.json()
      setAgent({ ...agent, is_active: updated.isActive })
    } catch (error) {
      console.error('Error toggling agent status:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 Agent를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete agent')
      }

      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message || 'Failed to delete agent')
    }
  }

  const getPersonalityDisplay = () => {
    const personality = agent.personality
    if (!personality) return null
    const icon = PERSONALITY_ICONS[personality] || '🤖'
    const label = PERSONALITY_LABELS[personality] || personality
    return `${icon} ${label}`
  }

  const formattedDate = new Date(agent.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>

      {/* Agent Info Card */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
              {agent.is_active ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-sm">
                  Inactive
                </span>
              )}
            </div>

            {/* Mode and Personality */}
            <div className="flex items-center gap-3 text-slate-400 mb-3">
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

            {agent.description && (
              <p className="text-slate-300 mb-3">{agent.description}</p>
            )}

            <p className="text-sm text-slate-500">등록일: {formattedDate}</p>
          </div>
        </div>

        {/* Temperature (Managed only) */}
        {agent.mode === 'MANAGED' && agent.temperature !== null && (
          <div className="mb-4 pb-4 border-b border-slate-700/50">
            <div className="text-sm text-slate-400 mb-2">Temperature</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${agent.temperature * 100}%` }}
                />
              </div>
              <span className="text-white font-mono">{agent.temperature.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Model (Managed only) */}
        {agent.mode === 'MANAGED' && agent.model && (
          <div className="mb-4 pb-4 border-b border-slate-700/50">
            <div className="text-sm text-slate-400 mb-1">Model</div>
            <div className="text-white font-mono">{agent.model}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleToggleActive}
            className={`flex-1 py-2 text-center font-semibold rounded-lg transition-colors ${
              agent.is_active
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {agent.is_active ? '비활성화' : '활성화'}
          </button>
          {!agent.is_active && (
            <button
              onClick={handleDelete}
              className="flex-1 py-2 text-center bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* Debate Configuration Panel */}
      <DebateConfigPanel
        agentId={agent.id}
        currentConfig={{
          debateEnabled: (agent as any).debate_enabled ?? true,
          debateSchedule: (agent as any).debate_schedule ?? 'daily',
          debateCategories: (agent as any).debate_categories ?? null,
          minConfidence: (agent as any).min_confidence ?? 0.5,
          autoParticipate: (agent as any).auto_participate ?? true,
        }}
        onUpdate={handleConfigUpdate}
      />
    </div>
  )
}
