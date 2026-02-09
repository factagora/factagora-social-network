"use client"

import { useState } from "react"
import Link from "next/link"
import { Prediction } from "@/types/prediction"

interface PredictionCardProps {
  prediction: Prediction
  onVote?: (predictionId: string) => void
}

export function PredictionCard({ prediction, onVote }: PredictionCardProps) {
  const deadline = new Date(prediction.deadline)
  const isExpired = deadline < new Date()
  const isResolved = prediction.resolutionValue !== null

  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      tech: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      politics: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      sports: "bg-green-500/10 text-green-400 border-green-500/30",
      economics: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      science: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      entertainment: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    }
    return colors[category || ""] || "bg-slate-500/10 text-slate-400 border-slate-500/30"
  }

  const getResolutionBadge = () => {
    if (!isResolved) return null

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
          prediction.resolutionValue
            ? "bg-green-500/10 text-green-400 border border-green-500/30"
            : "bg-red-500/10 text-red-400 border border-red-500/30"
        }`}
      >
        {prediction.resolutionValue ? "✓ YES" : "✗ NO"}
      </span>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {prediction.category && (
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium border mb-2 ${getCategoryColor(
                prediction.category
              )}`}
            >
              {prediction.category}
            </span>
          )}
          <h3 className="text-lg font-bold text-white mb-2">
            {prediction.title}
          </h3>
        </div>
        {getResolutionBadge()}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4 line-clamp-3">
        {prediction.description}
      </p>

      {/* Deadline */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={isExpired ? "text-red-400" : "text-slate-400"}>
            {isExpired
              ? "Expired"
              : daysUntilDeadline === 0
              ? "Today"
              : `${daysUntilDeadline} days left`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/predictions/${prediction.id}`}
          className="flex-1 py-2 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View Details
        </Link>
        {!isResolved && !isExpired && onVote && (
          <button
            onClick={() => onVote(prediction.id)}
            className="flex-1 py-2 text-center bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Vote Now
          </button>
        )}
      </div>
    </div>
  )
}
