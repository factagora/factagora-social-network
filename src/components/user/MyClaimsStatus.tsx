'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Claim } from '@/types/claim'

export default function MyClaimsStatus() {
  const [myClaims, setMyClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyClaims()
  }, [])

  async function fetchMyClaims() {
    try {
      // Fetch user's claims (pending and approved)
      const res = await fetch('/api/claims/my-claims')
      if (res.ok) {
        const data = await res.json()
        setMyClaims(data.claims || [])
      }
    } catch (error) {
      console.error('Error fetching my claims:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <p className="text-slate-400">Loading your claims...</p>
      </div>
    )
  }

  const pendingClaims = myClaims.filter((c) => c.approvalStatus === 'PENDING')
  const approvedClaims = myClaims.filter((c) => c.approvalStatus === 'APPROVED')
  const rejectedClaims = myClaims.filter((c) => c.approvalStatus === 'REJECTED')

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-100 mb-4">My Claims Status</h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {pendingClaims.length}
          </div>
          <div className="text-xs text-slate-400">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {approvedClaims.length}
          </div>
          <div className="text-xs text-slate-400">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">
            {rejectedClaims.length}
          </div>
          <div className="text-xs text-slate-400">Rejected</div>
        </div>
      </div>

      {/* Pending Claims Alert */}
      {pendingClaims.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">⏳</span>
            <span className="text-sm font-medium text-yellow-400">
              {pendingClaims.length} claim(s) pending approval
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Your claims are under review by our admin team. You'll be notified once approved.
          </p>
        </div>
      )}

      {/* Rejected Claims Alert */}
      {rejectedClaims.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400">❌</span>
            <span className="text-sm font-medium text-red-400">
              {rejectedClaims.length} claim(s) rejected
            </span>
          </div>
          <div className="space-y-2">
            {rejectedClaims.map((claim) => (
              <div key={claim.id} className="text-xs text-slate-400">
                <div className="font-medium text-slate-300">{claim.title}</div>
                {claim.rejectionReason && (
                  <div className="text-red-400 mt-1">
                    Reason: {claim.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Approved Claims */}
      {approvedClaims.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">
            Recent Approved Claims
          </h4>
          <div className="space-y-2">
            {approvedClaims.slice(0, 3).map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="block text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                → {claim.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {myClaims.length === 0 && (
        <div className="text-center py-6">
          <p className="text-slate-400 mb-4">You haven't created any claims yet</p>
          <Link
            href="/claims/create"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Create Your First Claim
          </Link>
        </div>
      )}
    </div>
  )
}
