"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Prediction } from "@/types/prediction"

interface PredictionCardProps {
  prediction: Prediction
  onVote?: (predictionId: string) => void
}

interface Consensus {
  yesPercentage: number
  noPercentage: number
  totalVotes: number
}

export function PredictionCard({ prediction, onVote }: PredictionCardProps) {
  const [consensus, setConsensus] = useState<Consensus | null>(null)
  const deadline = new Date(prediction.deadline)
  const isResolved = prediction.resolutionValue !== null

  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  useEffect(() => {
    fetchConsensus()
  }, [prediction.id])

  async function fetchConsensus() {
    try {
      const res = await fetch(`/api/predictions/${prediction.id}/votes`)
      if (res.ok) {
        const data = await res.json()
        setConsensus(data.consensus)
      }
    } catch (error) {
      console.error('Failed to fetch consensus:', error)
    }
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      tech: "bg-blue-500/10 text-blue-400",
      politics: "bg-purple-500/10 text-purple-400",
      sports: "bg-green-500/10 text-green-400",
      economics: "bg-yellow-500/10 text-yellow-400",
      science: "bg-cyan-500/10 text-cyan-400",
      entertainment: "bg-pink-500/10 text-pink-400",
    }
    return colors[category || ""] || "bg-slate-500/10 text-slate-400"
  }

  const yesPercent = isResolved
    ? (prediction.resolutionValue ? 100 : 0)
    : (consensus?.yesPercentage || 0)

  const noPercent = isResolved
    ? (prediction.resolutionValue ? 0 : 100)
    : (consensus?.noPercentage || 0)

  return (
    <Link href={`/predictions/${prediction.id}`} className="block">
      <article className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 md:p-8 min-h-[200px] hover:border-blue-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500">
        {/* Header - Category & Status */}
        <div className="flex items-center justify-between mb-4">
          {prediction.category && (
            <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getCategoryColor(prediction.category)}`}>
              {prediction.category}
            </span>
          )}
          {isResolved && (
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              prediction.resolutionValue
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
              {prediction.resolutionValue ? "✓ RESOLVED YES" : "✗ RESOLVED NO"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold text-white mb-6 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-relaxed">
          {prediction.title}
        </h3>

        {/* Yes/No Percentages - Kalshi Style with improved sizing */}
        <div className="space-y-3">
          {/* YES */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-xl font-bold text-green-400">{Math.round(yesPercent)}%</span>
            </div>
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out"
                style={{ width: `${yesPercent}%` }}
                role="progressbar"
                aria-valuenow={yesPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Yes votes: ${Math.round(yesPercent)}%`}
              />
            </div>
            <span className="text-sm text-slate-300 w-10 font-medium">YES</span>
          </div>

          {/* NO */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-xl font-bold text-red-400">{Math.round(noPercent)}%</span>
            </div>
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 ease-out"
                style={{ width: `${noPercent}%` }}
                role="progressbar"
                aria-valuenow={noPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`No votes: ${Math.round(noPercent)}%`}
              />
            </div>
            <span className="text-sm text-slate-300 w-10 font-medium">NO</span>
          </div>
        </div>

        {/* Footer - Deadline & Volume with improved contrast */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'Closed'}</span>
          </div>
          {consensus && consensus.totalVotes > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{consensus.totalVotes} votes</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
