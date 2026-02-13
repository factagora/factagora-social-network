'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ClaimApprovalCard from '@/components/admin/ClaimApprovalCard'
import type { Claim } from '@/types/claim'

type ClaimWithCreator = Claim & { creator?: { email: string; tier: string } }

export default function AdminClaimsPage() {
  const router = useRouter()
  const [claims, setClaims] = useState<ClaimWithCreator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [filter])

  async function fetchClaims() {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/claims?status=${filter}`)

      if (res.status === 401 || res.status === 403) {
        // Not authenticated or not admin
        router.push('/')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch claims')
      }

      const data = await res.json()
      setClaims(data.claims || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/admin/claims/${id}/approve`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to approve claim')
      }

      // Refresh list
      fetchClaims()
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleReject(id: string, reason: string) {
    try {
      const res = await fetch(`/api/admin/claims/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (!res.ok) {
        throw new Error('Failed to reject claim')
      }

      // Refresh list
      fetchClaims()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            🛡️ Admin: Claim Approval
          </h1>
          <p className="text-slate-400">
            Review and approve claims from FREE users
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-2 px-4 rounded font-medium text-sm transition-colors ${
                filter === status
                  ? status === 'PENDING'
                    ? 'bg-yellow-600 text-white'
                    : status === 'APPROVED'
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {status}
              {filter === status && claims.length > 0 && (
                <span className="ml-2 text-xs opacity-75">({claims.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {filter === 'PENDING' ? claims.length : '—'}
            </div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {filter === 'APPROVED' ? claims.length : '—'}
            </div>
            <div className="text-sm text-slate-400">Approved</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {filter === 'REJECTED' ? claims.length : '—'}
            </div>
            <div className="text-sm text-slate-400">Rejected</div>
          </div>
        </div>

        {/* Claims List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <p className="text-slate-400">
              No {filter.toLowerCase()} claims found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <ClaimApprovalCard
                key={claim.id}
                claim={claim}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-400 mb-2">
            📝 Approval Guidelines
          </h3>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• Check if claim title is specific and verifiable</li>
            <li>• Ensure description provides clear context</li>
            <li>• Resolution date should be reasonable and future-dated</li>
            <li>• Source URL should be credible (if provided)</li>
            <li>• Reject if claim is too vague, offensive, or unverifiable</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
