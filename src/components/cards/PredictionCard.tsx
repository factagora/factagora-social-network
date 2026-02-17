"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { Prediction } from "@/types/prediction";
import { PredictionConsensus } from "@/types/voting";

interface PredictionCardProps {
  prediction: Prediction;
  onVote?: (predictionId: string) => void;
}

export function PredictionCard({ prediction, onVote }: PredictionCardProps) {
  const [consensus, setConsensus] = useState<PredictionConsensus | null>(null);
  const deadline = new Date(prediction.deadline);
  const isResolved = prediction.resolutionValue !== null;

  const daysUntilDeadline = Math.ceil(
    (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    fetchConsensus();
  }, [prediction.id]);

  async function fetchConsensus() {
    try {
      const res = await fetch(`/api/predictions/${prediction.id}/votes`);
      if (res.ok) {
        const data = await res.json();
        setConsensus(data.consensus);
      }
    } catch (error) {
      console.error('Failed to fetch consensus:', error);
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
    };
    return colors[category || ""] || "bg-slate-500/10 text-slate-400";
  };

  const yesPercent = isResolved
    ? (prediction.resolutionValue ? 100 : 0)
    : (consensus?.consensusYesPct ? consensus.consensusYesPct * 100 : 0);

  const noPercent = isResolved
    ? (prediction.resolutionValue ? 0 : 100)
    : (consensus?.consensusYesPct ? (1 - consensus.consensusYesPct) * 100 : 0);

  return (
    <Link href={`/predictions/${prediction.id}`}>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all cursor-pointer group">
        {/* Header - Category & Status */}
        <div className="flex items-center justify-between mb-3">
          {prediction.category && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(prediction.category)}`}>
              {prediction.category}
            </span>
          )}
          {isResolved && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              prediction.resolutionValue
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {prediction.resolutionValue ? "✓ RESOLVED YES" : "✗ RESOLVED NO"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
          {prediction.title}
        </h3>

        {/* Yes/No Percentages - Kalshi Style */}
        <div className="space-y-2">
          {/* YES */}
          <div className="flex items-center gap-3">
            <div className="w-16 text-right">
              <span className="text-lg font-bold text-green-400">{Math.round(yesPercent)}%</span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                style={{ width: `${yesPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-8">YES</span>
          </div>

          {/* NO */}
          <div className="flex items-center gap-3">
            <div className="w-16 text-right">
              <span className="text-lg font-bold text-red-400">{Math.round(noPercent)}%</span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                style={{ width: `${noPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-8">NO</span>
          </div>
        </div>

        {/* Footer - Deadline & Volume */}
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{daysUntilDeadline > 0 ? `${daysUntilDeadline}d left` : 'Closed'}</span>
          </div>
          {consensus && consensus.totalVotes > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{consensus.totalVotes} votes</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
