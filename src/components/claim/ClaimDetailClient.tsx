"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { UnifiedArgumentCard } from "@/components/shared/UnifiedArgumentCard"
import { ResolutionStatus } from "@/components/shared/ResolutionStatus"
import { VerdictBadge } from "@/components/claim/VerdictBadge"
import ArgumentSubmitForm from "@/components/forms/ArgumentSubmitForm"
import { PredictionChart } from "@/components/prediction/PredictionChart"
import { ConsensusDisplay } from "@/components/voting/ConsensusDisplay"
import { ResolveClaimDialog } from "@/components/resolution"
import { useRealtimeClaimArguments } from "@/hooks/useRealtimeClaimArguments"
import type { UnifiedArgument } from "@/types/detail-page"
import type { Claim } from "@/types/claim"
import type { PredictionConsensus } from "@/src/types/voting"
import {
  getVerificationStatusColor,
  getVerificationStatusLabel,
} from "@/types/claim"

interface ClaimDetailClientProps {
  initialClaim: Claim
  initialArguments: UnifiedArgument[]
  initialStats: {
    trueCount: number
    falseCount: number
    uncertainCount: number
    aiCount: number
    humanCount: number
  }
  currentUserId: string | null
}

export function ClaimDetailClient({
  initialClaim,
  initialArguments,
  initialStats,
  currentUserId,
}: ClaimDetailClientProps) {
  const [claim] = useState<Claim>(initialClaim)
  const [sortBy, setSortBy] = useState<"best" | "new" | "position">("best")
  const [stats] = useState(initialStats)
  const [consensus, setConsensus] = useState<PredictionConsensus | null>(null)

  const isCreator = currentUserId === claim.createdBy

  // Fetch consensus data
  useEffect(() => {
    const fetchConsensus = async () => {
      try {
        const res = await fetch(`/api/claims/${claim.id}/votes`)
        if (res.ok) {
          const data = await res.json()
          setConsensus(data.consensus || null)
        }
      } catch (err) {
        console.error("Failed to fetch claim consensus:", err)
      }
    }
    fetchConsensus()
  }, [claim.id])

  // Realtime arguments
  const { arguments_, isSubscribed } = useRealtimeClaimArguments(
    claim.id,
    initialArguments
  )

  // Sort arguments
  const sortedArguments = [...arguments_].sort((a, b) => {
    switch (sortBy) {
      case "new":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "position": {
        const order: Record<string, number> = { TRUE: 0, FALSE: 1, UNCERTAIN: 2 }
        return (order[a.position] ?? 3) - (order[b.position] ?? 3)
      }
      case "best":
      default:
        return b.score - a.score
    }
  })

  // humanArguments no longer needed for separate section, but keep reference if ArgumentSubmitForm needs it

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Link
              href="/claims"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Claims
            </Link>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getVerificationStatusColor(
                claim.verificationStatus
              )}`}
            >
              {getVerificationStatusLabel(claim.verificationStatus)}
            </span>
            {isSubscribed && (
              <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{claim.title}</h1>

          {claim.description && (
            <p className="text-base text-slate-300 mb-3 whitespace-pre-wrap">
              {claim.description}
            </p>
          )}

          {claim.sourceUrl && (
            <a
              href={claim.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mb-3"
            >
              View source →
            </a>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
            {claim.category && (
              <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded">
                {claim.category}
              </span>
            )}
            {claim.resolvedAt ? (
              <div>
                <span className="font-semibold text-slate-300">Resolved: </span>
                <span className={claim.resolutionValue ? "text-green-400" : "text-red-400"}>
                  {claim.resolutionValue ? "TRUE" : "FALSE"}
                </span>
                <span className="ml-2">on {formatDate(claim.resolvedAt)}</span>
              </div>
            ) : claim.resolutionDate ? (
              <div>
                <span className="font-semibold text-slate-300">Resolves: </span>
                {formatDate(claim.resolutionDate)}
              </div>
            ) : null}
            <div>
              <span className="font-semibold text-slate-300">Created: </span>
              {formatDate(claim.createdAt)}
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="lg:flex gap-8">
          {/* Left Column — Thread */}
          <div className="lg:w-2/3">
            {/* Resolved Banner */}
            {claim.resolvedAt && (
              <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  This claim has been resolved. No new arguments can be added.
                </p>
              </div>
            )}

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
              {!claim.resolvedAt && (
                <div className="ml-2">
                  <ArgumentSubmitForm claimId={claim.id} />
                </div>
              )}
            </div>

            {/* Unified Argument Thread */}
            {sortedArguments.length > 0 ? (
              <div className="space-y-3">
                {sortedArguments.map((arg) => (
                  <UnifiedArgumentCard
                    key={arg.id}
                    argument={arg}
                    voteEndpoint={`/api/claims/${claim.id}/arguments/${arg.id}/vote`}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
                <p className="text-slate-400 text-lg">
                  No arguments yet. Be the first to contribute!
                </p>
                {!claim.resolvedAt && (
                  <div className="mt-4">
                    <ArgumentSubmitForm claimId={claim.id} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-20 space-y-6">
              {/* Verdict Section */}
              {claim.verdict && claim.verdict !== "UNVERIFIED" ? (
                <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-slate-400 font-semibold">Verdict:</span>
                    <VerdictBadge verdict={claim.verdict} size="lg" />
                  </div>

                  {claim.verdictSummary && (
                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                      {claim.verdictSummary}
                    </p>
                  )}

                  <div className="space-y-1 text-xs text-slate-400">
                    {claim.verdictDate && (
                      <div>
                        <span className="font-medium">Verified: </span>
                        {formatDate(claim.verdictDate)}
                      </div>
                    )}
                    {claim.claimedBy && (
                      <div>
                        <span className="font-medium">Claimed by: </span>
                        <span className="text-white">{claim.claimedBy}</span>
                      </div>
                    )}
                    {claim.sourceCredibility != null && (
                      <div>
                        <span className="font-medium">Source credibility: </span>
                        <span
                          className={`font-bold ${
                            claim.sourceCredibility >= 70
                              ? "text-green-400"
                              : claim.sourceCredibility >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {claim.sourceCredibility}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
                  <p className="text-yellow-400 text-sm font-medium">
                    Not verified yet. Help by submitting evidence!
                  </p>
                </div>
              )}

              {/* Resolution Status */}
              <ResolutionStatus
                entityId={claim.id}
                entityLabel="claim"
                resolutionDate={claim.resolutionDate}
                isCreator={isCreator}
                isResolved={!!claim.resolvedAt}
                resolutionValue={claim.resolutionValue}
                verdict={claim.verdict}
                renderDialog={({ onClose, onResolved }) => (
                  <ResolveClaimDialog
                    claimId={claim.id}
                    title={claim.title}
                    onClose={onClose}
                    onResolved={onResolved}
                  />
                )}
              />

              {/* Chart */}
              <PredictionChart
                predictionId={claim.id}
                type="binary"
                apiUrl={`/api/claims/${claim.id}/timeseries`}
                positiveLabel="TRUE"
                negativeLabel="FALSE"
                positiveColor="#22c55e"
                negativeColor="#ef4444"
              />

              {/* Consensus */}
              <ConsensusDisplay
                consensus={consensus}
                positiveLabel="TRUE"
                negativeLabel="FALSE"
                neutralLabel="UNCERTAIN"
                title="Verification Consensus"
                compact
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
