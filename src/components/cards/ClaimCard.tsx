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
    <Link href={`/claims/${claim.id}`}>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer">
        {/* Verdict Badge (if available) */}
        {claim.verdict && (
          <div className="mb-3">
            <VerdictBadge verdict={claim.verdict} size="sm" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-medium text-slate-100 mb-3 line-clamp-2">
          {claim.title}
        </h3>

        {/* Claimed By (if available) */}
        {claim.claimedBy && (
          <div className="mb-3 text-sm text-slate-400">
            <span>Claimed by: </span>
            <span className="font-medium text-slate-300">{claim.claimedBy}</span>
            {claim.claimDate && (
              <span className="text-slate-500">
                {' '}
                · {new Date(claim.claimDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Verification Status Badge & Category */}
        <div className="flex items-center gap-2 mb-3">
          {!claim.verdict && (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getVerificationStatusColor(
                claim.verificationStatus
              )}`}
            >
              {getVerificationStatusLabel(claim.verificationStatus)}
            </span>
          )}

          {claim.category && (
            <span className="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-300">
              {claim.category}
            </span>
          )}

          {claim.sourceCredibility !== null && claim.sourceCredibility !== undefined && (
            <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30">
              📊 {claim.sourceCredibility}/100
            </span>
          )}
        </div>

        {/* TRUE/FALSE Bars */}
        <div className="space-y-2 mb-3">
          {/* TRUE Bar */}
          <div className="flex items-center gap-3">
            <div className="w-16 text-right">
              <span className="text-lg font-bold text-green-400">
                {Math.round(truePercent)}%
              </span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                style={{ width: `${truePercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-12">TRUE</span>
          </div>

          {/* FALSE Bar */}
          <div className="flex items-center gap-3">
            <div className="w-16 text-right">
              <span className="text-lg font-bold text-red-400">
                {Math.round(falsePercent)}%
              </span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                style={{ width: `${falsePercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 w-12">FALSE</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span>
            <span>{claim.argumentCount} arguments</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span>{claim.evidenceCount} evidence</span>
          </div>
        </div>

        {/* Resolution Date */}
        {claim.resolutionDate && !claim.resolvedAt && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">
              Resolves: {new Date(claim.resolutionDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Resolved */}
        {claim.resolvedAt && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-xs font-medium">
              <span
                className={
                  claim.resolutionValue ? 'text-green-400' : 'text-red-400'
                }
              >
                Resolved as {claim.resolutionValue ? 'TRUE' : 'FALSE'}
              </span>
              <span className="text-slate-500 ml-2">
                · {new Date(claim.resolvedAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
