'use client'

import Link from 'next/link'
import { Claim, ClaimConsensus } from '@/types/claim'
import { useState, useEffect } from 'react'
import {
  getVerificationStatusColor,
  getVerificationStatusLabel,
} from '@/types/claim'
import { VerdictBadge } from '@/components/claim/VerdictBadge'

interface ClaimCardProps {
  claim: Claim
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const [consensus, setConsensus] = useState<ClaimConsensus | null>(null)

  useEffect(() => {
    fetchConsensus()
  }, [claim.id])

  async function fetchConsensus() {
    try {
      const res = await fetch(`/api/claims/${claim.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.consensus) {
          setConsensus(data.consensus)
        }
      }
    } catch (error) {
      console.error('Error fetching consensus:', error)
    }
  }

  const truePercent = consensus?.truePercentage || 0
  const falsePercent = consensus?.falsePercentage || 0
  const totalVotes = consensus?.totalVotes || 0

  return (
    <Link href={`/claims/${claim.id}`} className="block">
      <article className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 md:p-8 min-h-[200px] hover:border-blue-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer group focus-within:ring-2 focus-within:ring-blue-500">
        {/* Verdict Badge (if available) - Prominent display */}
        {claim.verdict && claim.verdict !== 'UNVERIFIED' && (
          <div className="mb-4 flex items-center gap-3">
            <VerdictBadge verdict={claim.verdict} size="md" />
            {claim.verdictDate && (
              <span className="text-xs text-slate-400">
                Verified {new Date(claim.verdictDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg md:text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-relaxed">
          {claim.title}
        </h3>

        {/* Claimed By (if available) */}
        {claim.claimedBy && (
          <div className="mb-4 text-base text-slate-300">
            <span>Claimed by: </span>
            <span className="font-semibold text-white">{claim.claimedBy}</span>
            {claim.claimDate && (
              <span className="text-slate-400">
                {' '}
                · {new Date(claim.claimDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Verification Status Badge & Category */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {!claim.verdict && (
            <span
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getVerificationStatusColor(
                claim.verificationStatus
              )}`}
            >
              {getVerificationStatusLabel(claim.verificationStatus)}
            </span>
          )}

          {claim.category && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700/50 text-slate-300">
              {claim.category}
            </span>
          )}

          {claim.sourceCredibility !== null && claim.sourceCredibility !== undefined && (
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              📊 {claim.sourceCredibility}/100
            </span>
          )}
        </div>

        {/* TRUE/FALSE Bars - Enhanced sizing */}
        <div className="space-y-3 mb-6">
          {/* TRUE Bar */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-xl font-bold text-green-400">
                {Math.round(truePercent)}%
              </span>
            </div>
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500 ease-out"
                style={{ width: `${truePercent}%` }}
                role="progressbar"
                aria-valuenow={truePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`True votes: ${Math.round(truePercent)}%`}
              />
            </div>
            <span className="text-sm text-slate-300 w-12 font-medium">TRUE</span>
          </div>

          {/* FALSE Bar */}
          <div className="flex items-center gap-4">
            <div className="w-20 text-right">
              <span className="text-xl font-bold text-red-400">
                {Math.round(falsePercent)}%
              </span>
            </div>
            <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 ease-out"
                style={{ width: `${falsePercent}%` }}
                role="progressbar"
                aria-valuenow={falsePercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`False votes: ${Math.round(falsePercent)}%`}
              />
            </div>
            <span className="text-sm text-slate-300 w-12 font-medium">FALSE</span>
          </div>
        </div>

        {/* Stats - Improved contrast */}
        <div className="flex items-center gap-6 text-sm text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span>{claim.argumentCount} arguments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span>{claim.evidenceCount} evidence</span>
          </div>
        </div>

        {/* Resolution Date */}
        {claim.resolutionDate && !claim.resolvedAt && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-300 font-medium">
              Resolves: {new Date(claim.resolutionDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Resolved */}
        {claim.resolvedAt && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm font-semibold">
              <span
                className={
                  claim.resolutionValue ? 'text-green-400' : 'text-red-400'
                }
              >
                Resolved as {claim.resolutionValue ? 'TRUE' : 'FALSE'}
              </span>
              <span className="text-slate-400 ml-2">
                · {new Date(claim.resolvedAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}
      </article>
    </Link>
  )
}
