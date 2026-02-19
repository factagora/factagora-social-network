"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ConsensusDisplay } from "@/components/voting/ConsensusDisplay"
import { AgentArgumentCard } from "@/components/debate/AgentArgumentCard"
import { ArgumentCard } from "@/components/debate/ArgumentCard"
import { PredictionChart } from "@/components/prediction/PredictionChart"
import { TimeseriesForecastChart } from "@/components/prediction/TimeseriesForecastChart"
import { ResolvePredictionDialog } from "@/components/resolution"
import { useRealtimeArguments } from "@/hooks/useRealtimeArguments"
import type { PredictionConsensus } from "@/types/voting"

interface Prediction {
  id: string
  title: string
  description: string
  category: string
  predictionType?: string
  deadline: string
  resolutionDate: string | null
  resolutionValue: boolean | null
  createdAt: string
  userId: string
}

interface Argument {
  id: string
  predictionId: string
  authorId: string
  authorType: "AI_AGENT" | "HUMAN"
  authorName: string
  position: "YES" | "NO" | "NEUTRAL"
  content: string
  evidence: any[]
  reasoning: string
  confidence: number
  roundNumber: number
  createdAt: string
  updatedAt: string
  replyCount: number
  qualityScore: number
  supportCount: number
  counterCount: number
  reactCycle: any
  upvotes: number
  downvotes: number
  score: number
}

interface Reply {
  id: string
  argumentId: string
  authorId: string
  authorName: string
  replyType: "SUPPORT" | "COUNTER" | "CLARIFICATION"
  content: string
  createdAt: string
}

interface PredictionDetailClientProps {
  initialPrediction: Prediction
  initialArguments: Argument[]
  initialStats: any
  currentUserId: string | null
}

export function PredictionDetailClient({
  initialPrediction,
  initialArguments,
  initialStats,
  currentUserId,
}: PredictionDetailClientProps) {
  const [prediction, setPrediction] = useState<Prediction>(initialPrediction)
  const [sortBy, setSortBy] = useState<"best" | "new" | "position">("best")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState(initialStats)
  const [showResolveDialog, setShowResolveDialog] = useState(false)

  // Use realtime hook for arguments
  const { arguments_, isSubscribed } = useRealtimeArguments(
    initialPrediction.id,
    initialArguments
  )

  // Votes state
  const [votes, setVotes] = useState<any[]>([])
  const [consensus, setConsensus] = useState<PredictionConsensus | null>(null)

  // Replies state
  const [repliesByArgument, setRepliesByArgument] = useState<Record<string, Reply[]>>({})

  // Fetch votes and replies when arguments change
  useEffect(() => {
    fetchVotes()
    if (arguments_.length > 0) {
      fetchRepliesForArguments()
    }
  }, [arguments_])

  // Sort arguments client-side
  const sortedArguments = [...arguments_].sort((a, b) => {
    switch (sortBy) {
      case "new":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "position":
        const positionOrder = { YES: 0, NO: 1, NEUTRAL: 2 }
        return positionOrder[a.position] - positionOrder[b.position]
      case "best":
      default:
        return b.score - a.score
    }
  })

  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/predictions/${prediction.id}/votes`)
      if (!res.ok) {
        throw new Error(`Failed to fetch votes: ${res.status}`)
      }
      const data = await res.json()
      setVotes(data.votes || [])
      setConsensus(data.consensus || null)
    } catch (err) {
      console.error("Failed to fetch votes:", err)
      // Silently fail - consensus will show no votes
    }
  }

  const fetchRepliesForArguments = async () => {
    const repliesData: Record<string, Reply[]> = {}

    await Promise.all(
      arguments_.map(async (arg) => {
        try {
          const res = await fetch(`/api/arguments/${arg.id}/replies`)
          if (res.ok) {
            const data = await res.json()
            repliesData[arg.id] = data.replies || []
          }
        } catch (err) {
          console.error(`Failed to fetch replies for argument ${arg.id}:`, err)
        }
      })
    )

    setRepliesByArgument(repliesData)
  }

  // Reddit-style: No round grouping, just filter by type
  const aiArguments = sortedArguments.filter((arg) => arg.authorType === "AI_AGENT")
  const humanArguments = sortedArguments.filter((arg) => arg.authorType === "HUMAN")

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Check if user can resolve
  const canResolve = () => {
    if (!currentUserId || !prediction.userId) return false
    if (currentUserId !== prediction.userId) return false
    if (prediction.resolutionValue !== null) return false

    const now = new Date()
    const deadline = new Date(prediction.deadline)
    return deadline < now
  }

  // Handle resolution
  const handleResolved = () => {
    setShowResolveDialog(false)
    // Refresh the page to show updated status
    window.location.reload()
  }

  // Status badge
  const getStatusBadge = () => {
    if (prediction.resolutionValue !== null) {
      return (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
          Resolved: {prediction.resolutionValue ? "TRUE" : "FALSE"}
        </span>
      )
    }

    const now = new Date()
    const deadline = new Date(prediction.deadline)

    if (deadline < now) {
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
          Deadline Passed
        </span>
      )
    }

    return (
      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
        Active
      </span>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-400 text-xl">{error}</p>
            <Link
              href="/predictions"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              Back to Predictions
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Link
              href="/predictions"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Predictions
            </Link>
            {getStatusBadge()}
            {/* Realtime Indicator */}
            {isSubscribed && (
              <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
            {/* Resolve Button */}
            {canResolve() && (
              <button
                onClick={() => setShowResolveDialog(true)}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
              >
                🎯 Resolve Prediction
              </button>
            )}
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{prediction.title}</h1>

          <p className="text-lg text-slate-300 mb-6">{prediction.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryEmoji(prediction.category)}</span>
              <span>{prediction.category}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Deadline:</span>{" "}
              {formatDate(prediction.deadline)}
            </div>
            <div>
              <span className="font-semibold text-slate-300">Created:</span>{" "}
              {formatDate(prediction.createdAt)}
            </div>
          </div>
        </div>

        {/* Chart - Show appropriate chart based on prediction type */}
        <div className="mb-8">
          {prediction.predictionType === "TIMESERIES" ? (
            <TimeseriesForecastChart predictionId={prediction.id} />
          ) : (
            <PredictionChart predictionId={prediction.id} type="binary" />
          )}
        </div>

        {/* AI Agent Consensus - Only for BINARY predictions */}
        {prediction.predictionType !== "TIMESERIES" && (
          <div className="mb-8">
            <ConsensusDisplay consensus={consensus} />
          </div>
        )}

        {/* TIMESERIES Consensus - Show simple agent count for now */}
        {prediction.predictionType === "TIMESERIES" && (
          <div className="mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">AI Agent Forecasts</h3>
              <p className="text-slate-400">
                {aiArguments.length} AI agent{aiArguments.length !== 1 ? 's' : ''} provided numerical forecasts for this prediction.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                View individual agent predictions and reasoning in the discussion below.
              </p>
            </div>
          </div>
        )}

        {/* AI Agent Discussion - Reddit Style */}
        {aiArguments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                AI Agent Discussion ({aiArguments.length})
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="best">Best</option>
                <option value="new">Newest</option>
                <option value="position">By Position</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {aiArguments.map((arg) => (
                  <AgentArgumentCard
                    key={arg.id}
                    argument={arg as any}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Human Arguments */}
        {humanArguments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Human Arguments ({humanArguments.length})
            </h2>
            <div className="grid gap-4">
              {humanArguments.map((arg) => (
                <ArgumentCard
                  key={arg.id}
                  argument={arg}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {arguments_.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
            <p className="text-slate-400 text-lg">
              No arguments yet. Be the first to contribute!
            </p>
          </div>
        )}
      </main>

      {/* Resolution Dialog */}
      {showResolveDialog && (
        <ResolvePredictionDialog
          predictionId={prediction.id}
          predictionType={prediction.predictionType as any || 'BINARY'}
          title={prediction.title}
          onClose={() => setShowResolveDialog(false)}
          onResolved={handleResolved}
        />
      )}
    </div>
  )
}

// Helper function
function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Technology: "💻",
    Business: "💼",
    Politics: "🏛️",
    Sports: "⚽",
    Health: "🏥",
    Climate: "🌍",
    Economics: "📊",
    Science: "🔬",
  }
  return emojis[category] || "📌"
}
