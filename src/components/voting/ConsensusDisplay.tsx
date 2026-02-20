'use client'

import type { PredictionConsensus } from '@/src/types/voting'

interface ConsensusDisplayProps {
  consensus: PredictionConsensus | null
  positiveLabel?: string
  negativeLabel?: string
  neutralLabel?: string
  title?: string
  compact?: boolean
}

export function ConsensusDisplay({
  consensus,
  positiveLabel = 'YES',
  negativeLabel = 'NO',
  neutralLabel = 'NEUTRAL',
  title = 'AI Agent Consensus',
  compact = false,
}: ConsensusDisplayProps) {
  if (!consensus || consensus.totalVotes === 0) {
    return (
      <div className={`bg-slate-800 border border-slate-700 rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
        <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-white mb-4`}>{title}</h3>
        <p className="text-slate-400">No positions yet. Waiting for analysis...</p>
      </div>
    )
  }

  const overallYesPct = consensus.consensusYesPct * 100
  const humanYesPct = consensus.humanConsensusYesPct * 100
  const aiYesPct = consensus.aiConsensusYesPct * 100

  const getConsensusColor = (pct: number) => {
    if (pct >= 65) return 'text-green-400'
    if (pct >= 35) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConsensusLabel = (pct: number) => {
    if (pct >= 65) return `Leaning ${positiveLabel}`
    if (pct >= 35) return 'Uncertain'
    return `Leaning ${negativeLabel}`
  }

  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
      <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold text-white mb-4`}>{title}</h3>

      {/* Overall Consensus */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-white">Overall Consensus</span>
          <span className={`${compact ? 'text-xl' : 'text-3xl'} font-bold ${getConsensusColor(overallYesPct)}`}>
            {overallYesPct.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`relative w-full ${compact ? 'h-6' : 'h-8'} bg-slate-700 rounded-lg overflow-hidden mb-2`}>
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
            style={{ width: `${overallYesPct}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
            style={{ width: `${100 - overallYesPct}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {getConsensusLabel(overallYesPct)}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-slate-400">
          <span>👎 {negativeLabel}</span>
          <span className="text-slate-300">
            {consensus.totalVotes} vote{consensus.totalVotes !== 1 ? 's' : ''}
          </span>
          <span>👍 {positiveLabel}</span>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="grid grid-cols-2 gap-4">
        {/* Human Votes */}
        <div className={`bg-slate-700/30 rounded-lg ${compact ? 'p-3' : 'p-4'} border border-slate-600/50`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={compact ? 'text-lg' : 'text-2xl'}>👤</span>
            <div>
              <div className="text-sm font-semibold text-white">Human Votes</div>
              <div className="text-xs text-slate-400">{consensus.humanVotes} voters</div>
            </div>
          </div>
          <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold ${getConsensusColor(humanYesPct)}`}>
            {humanYesPct.toFixed(1)}% {positiveLabel}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {consensus.humanYes} {positiveLabel} · {consensus.humanNo} {negativeLabel} · {consensus.humanNeutral} {neutralLabel}
          </div>
        </div>

        {/* AI Votes */}
        <div className={`bg-slate-700/30 rounded-lg ${compact ? 'p-3' : 'p-4'} border border-slate-600/50`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={compact ? 'text-lg' : 'text-2xl'}>🤖</span>
            <div>
              <div className="text-sm font-semibold text-white">AI Agents</div>
              <div className="text-xs text-slate-400">{consensus.aiVotes} agents</div>
            </div>
          </div>
          <div className={`${compact ? 'text-lg' : 'text-2xl'} font-bold ${getConsensusColor(aiYesPct)}`}>
            {aiYesPct.toFixed(1)}% {positiveLabel}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {consensus.aiYes} {positiveLabel} · {consensus.aiNo} {negativeLabel} · {consensus.aiNeutral} {neutralLabel}
          </div>
        </div>
      </div>

      {/* Weight Info */}
      {!compact && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            ⓘ Human votes are weighted more than AI votes to ensure human governance.
          </p>
        </div>
      )}
    </div>
  )
}
