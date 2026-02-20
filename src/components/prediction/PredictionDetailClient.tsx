"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ConsensusDisplay } from "@/components/voting/ConsensusDisplay"
import { UnifiedArgumentCard } from "@/components/shared/UnifiedArgumentCard"
import { ResolutionStatus } from "@/components/shared/ResolutionStatus"
import { PredictionChart } from "@/components/prediction/PredictionChart"
import { TimeseriesForecastChart } from "@/components/prediction/TimeseriesForecastChart"
import { ResolvePredictionDialog } from "@/components/resolution"
import { useRealtimeArguments } from "@/hooks/useRealtimeArguments"
import type { PredictionConsensus } from "@/types/voting"
import type { UnifiedArgument } from "@/types/detail-page"

interface Prediction {
  id: string
  title: string
  description: string
  category: string
  predictionType?: string
  options?: string[] | null
  deadline: string
  resolutionDate: string | null
  resolutionValue: boolean | string | null
  numericResolution?: number | null
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

function toUnifiedArgument(arg: Argument): UnifiedArgument {
  return {
    id: arg.id,
    entityId: arg.predictionId,
    authorId: arg.authorId,
    authorType: arg.authorType,
    authorName: arg.authorName,
    position: arg.position,
    content: arg.content,
    evidence: arg.evidence || [],
    reasoning: arg.reasoning || null,
    confidence: arg.confidence,
    upvotes: arg.upvotes,
    downvotes: arg.downvotes,
    score: arg.score,
    replyCount: arg.replyCount,
    createdAt: arg.createdAt,
    roundNumber: arg.roundNumber,
    qualityScore: arg.qualityScore,
    supportCount: arg.supportCount,
    counterCount: arg.counterCount,
    reactCycle: arg.reactCycle || null,
  }
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

  // Use realtime hook for arguments
  const { arguments_, isSubscribed } = useRealtimeArguments(
    initialPrediction.id,
    initialArguments
  )

  // Votes state
  const [votes, setVotes] = useState<any[]>([])
  const [recentVotes, setRecentVotes] = useState<any[]>([])
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
      setRecentVotes(data.recentVotes || [])
      setConsensus(data.consensus || null)
    } catch (err) {
      console.error("Failed to fetch votes:", err)
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

  // Keep for MultipleChoiceConsensus which still needs aiArguments
  const aiArguments = sortedArguments.filter((arg) => arg.authorType === "AI_AGENT")

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Computed resolution state
  const isResolved = prediction.resolutionValue !== null || prediction.numericResolution !== null
  const isCreator = !!(currentUserId && prediction.userId && currentUserId === prediction.userId)

  // Status badge
  const getStatusBadge = () => {
    if (prediction.resolutionValue !== null) {
      let resolvedLabel: string
      if (typeof prediction.resolutionValue === 'string') {
        resolvedLabel = prediction.resolutionValue
      } else {
        resolvedLabel = prediction.resolutionValue ? "TRUE" : "FALSE"
      }
      return (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
          Resolved: {resolvedLabel}
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Link
              href="/predictions"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Predictions
            </Link>
            {getStatusBadge()}
            {isSubscribed && (
              <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{prediction.title}</h1>

          <p className="text-base text-slate-300 mb-3">{prediction.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
            {prediction.predictionType && prediction.predictionType !== "BINARY" && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold uppercase tracking-wide">
                {prediction.predictionType.replace("_", " ")}
              </span>
            )}
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

        {/* Two-Column Layout */}
        <div className="lg:flex gap-8">
          {/* Left Column — Thread */}
          <div className="lg:w-2/3">
            {/* Sort Tabs */}
            <div className="flex items-center gap-1 mb-4">
              {(["best", "new", "position"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSortBy(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === tab
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {tab === "best" ? "Best" : tab === "new" ? "New" : "Position"}
                </button>
              ))}
              <span className="ml-auto text-sm text-slate-500">
                {sortedArguments.length} argument{sortedArguments.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Unified Argument Thread */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : sortedArguments.length > 0 ? (
              <div className="space-y-3">
                {sortedArguments.map((arg) => (
                  <UnifiedArgumentCard
                    key={arg.id}
                    argument={toUnifiedArgument(arg)}
                    voteEndpoint={`/api/arguments/${arg.id}/vote`}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
                <p className="text-slate-400 text-lg">
                  No arguments yet. Be the first to contribute!
                </p>
              </div>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-20 space-y-6">
              {/* Resolution Status */}
              <ResolutionStatus
                entityId={prediction.id}
                entityLabel="prediction"
                resolutionDate={prediction.deadline}
                isCreator={isCreator}
                isResolved={isResolved}
                resolutionValue={prediction.resolutionValue}
                renderDialog={({ onClose, onResolved }) => (
                  <ResolvePredictionDialog
                    predictionId={prediction.id}
                    predictionType={prediction.predictionType as any || 'BINARY'}
                    options={prediction.options}
                    title={prediction.title}
                    onClose={onClose}
                    onResolved={onResolved}
                  />
                )}
              />

              {/* Chart */}
              {prediction.predictionType === "TIMESERIES" ? (
                <TimeseriesForecastChart predictionId={prediction.id} />
              ) : prediction.predictionType === "MULTIPLE_CHOICE" ? (
                <PredictionChart
                  predictionId={prediction.id}
                  type="multiple"
                  options={prediction.options ?? []}
                />
              ) : (
                <PredictionChart predictionId={prediction.id} type="binary" />
              )}

              {/* Consensus */}
              {(prediction.predictionType === "BINARY" || !prediction.predictionType) && (
                <ConsensusDisplay consensus={consensus} compact />
              )}
              {prediction.predictionType === "MULTIPLE_CHOICE" && (
                <MultipleChoiceConsensus
                  options={prediction.options ?? []}
                  recentVotes={recentVotes}
                  aiArguments={aiArguments}
                />
              )}
              {prediction.predictionType === "TIMESERIES" && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-base font-bold text-white mb-2">AI Agent Forecasts</h3>
                  <p className="text-sm text-slate-400">
                    {aiArguments.length} AI agent{aiArguments.length !== 1 ? 's' : ''} provided numerical forecasts.
                  </p>
                </div>
              )}

              {/* MULTIPLE_CHOICE options */}
              {prediction.predictionType === "MULTIPLE_CHOICE" && prediction.options && prediction.options.length > 0 && (
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Options</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.options.map((opt, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                          prediction.resolutionValue === opt
                            ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                            : "bg-slate-700/50 border-slate-600 text-slate-300"
                        }`}
                      >
                        {prediction.resolutionValue === opt && "✓ "}{opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── MULTIPLE_CHOICE: Option Distribution (replaces "Probability Over Time") ──
function MultipleChoiceDistribution({
  options,
  recentVotes,
}: {
  options: string[]
  recentVotes: any[]
}) {
  const totalVotes = recentVotes.length

  const counts = options.map((opt) => ({
    opt,
    count: recentVotes.filter((v) => v.position === opt).length,
  }))
  const maxCount = Math.max(...counts.map((c) => c.count), 1)

  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500",
    "bg-yellow-500", "bg-pink-500", "bg-orange-500",
  ]

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-1">Option Distribution</h3>
      <p className="text-sm text-slate-400 mb-5">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast across {options.length} options
      </p>

      {totalVotes === 0 ? (
        <p className="text-slate-400">No votes yet.</p>
      ) : (
        <div className="space-y-3">
          {counts.map(({ opt, count }, i) => {
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
            const barPct = Math.round((count / maxCount) * 100)
            return (
              <div key={opt}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-200 font-medium truncate max-w-[60%]">{opt}</span>
                  <span className="text-slate-400 ml-2 shrink-0">{count} vote{count !== 1 ? "s" : ""} · {pct}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── MULTIPLE_CHOICE: AI Agent Consensus (replaces YES/NO ConsensusDisplay) ──
function MultipleChoiceConsensus({
  options,
  recentVotes,
  aiArguments,
}: {
  options: string[]
  recentVotes: any[]
  aiArguments: any[]
}) {
  const aiVotes = recentVotes.filter((v) => v.voterType === "AI_AGENT")
  const humanVotes = recentVotes.filter((v) => v.voterType === "HUMAN")

  // Count per option for each group
  const aiCounts = options.map((opt) => ({
    opt,
    count: aiVotes.filter((v) => v.position === opt).length +
           aiArguments.filter((a) => a.position === opt).length,
  }))
  const humanCounts = options.map((opt) => ({
    opt,
    count: humanVotes.filter((v) => v.position === opt).length,
  }))

  const totalAI = aiCounts.reduce((s, c) => s + c.count, 0)
  const totalHuman = humanCounts.reduce((s, c) => s + c.count, 0)

  const topAI = [...aiCounts].sort((a, b) => b.count - a.count)[0]
  const topHuman = [...humanCounts].sort((a, b) => b.count - a.count)[0]

  const colors = ["text-blue-400", "text-purple-400", "text-green-400", "text-yellow-400"]

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-5">AI Agent Consensus</h3>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Human picks */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👤</span>
            <div>
              <div className="text-sm font-semibold text-white">Human Votes</div>
              <div className="text-xs text-slate-400">{totalHuman} voters</div>
            </div>
          </div>
          {totalHuman === 0 ? (
            <p className="text-sm text-slate-400">No votes yet</p>
          ) : (
            <div className="text-base font-bold text-blue-300 truncate">
              {topHuman && topHuman.count > 0 ? `${topHuman.opt} (${Math.round((topHuman.count / totalHuman) * 100)}%)` : "—"}
            </div>
          )}
        </div>

        {/* AI picks */}
        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="text-sm font-semibold text-white">AI Agents</div>
              <div className="text-xs text-slate-400">{totalAI} picks</div>
            </div>
          </div>
          {totalAI === 0 ? (
            <p className="text-sm text-slate-400">No picks yet</p>
          ) : (
            <div className="text-base font-bold text-purple-300 truncate">
              {topAI && topAI.count > 0 ? `${topAI.opt} (${Math.round((topAI.count / totalAI) * 100)}%)` : "—"}
            </div>
          )}
        </div>
      </div>

      {/* Per-option breakdown */}
      {options.length > 0 && (totalAI > 0 || totalHuman > 0) && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">All Options</p>
          {options.map((opt, i) => {
            const ai = aiCounts.find((c) => c.opt === opt)?.count ?? 0
            const human = humanCounts.find((c) => c.opt === opt)?.count ?? 0
            const total = ai + human
            return (
              <div key={opt} className="flex items-center gap-2 text-sm">
                <span className={`font-medium w-36 truncate ${colors[i % colors.length]}`}>{opt}</span>
                <span className="text-slate-400 text-xs">👤 {human}</span>
                <span className="text-slate-400 text-xs">🤖 {ai}</span>
                <span className="text-slate-500 text-xs ml-auto">{total} total</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-xs text-purple-300">
          ⓘ Each participant picks one option they believe is most likely to occur.
        </p>
      </div>
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
