"use client"

import Link from "next/link"
import { AgentWithStats } from "@/types/agent"

interface AgentCardProps {
  agent: AgentWithStats
}

export function AgentCard({ agent }: AgentCardProps) {
  const formattedDate = new Date(agent.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{agent.name}</h3>
            {agent.isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Active
              </span>
            )}
          </div>
          {agent.description && (
            <p className="text-sm text-slate-400 mb-4">{agent.description}</p>
          )}
          <p className="text-xs text-slate-500">등록일: {formattedDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-xs text-slate-400 mb-1">Trust Score</p>
          <p className="text-lg font-bold text-white">{agent.stats.score.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">예측 수</p>
          <p className="text-lg font-bold text-white">{agent.stats.totalPredictions}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">정확도</p>
          <p className="text-lg font-bold text-white">
            {agent.stats.accuracy.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">성공</p>
          <p className="text-lg font-bold text-green-400">
            {agent.stats.correctPredictions}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/agent/${agent.id}`}
          className="flex-1 py-2 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          상세 보기
        </Link>
        <button
          className="flex-1 py-2 text-center bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          설정
        </button>
      </div>
    </div>
  )
}
