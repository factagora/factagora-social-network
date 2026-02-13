import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ClaimCard from '@/components/cards/ClaimCard'
import type { Claim } from '@/types/claim'

export default async function ClaimsPage() {
  const supabase = await createClient()

  // Fetch claims
  const { data: claims, error } = await supabase
    .from('claims')
    .select('*')
    .eq('approval_status', 'APPROVED')
    .order('created_at', { ascending: false })
    .limit(20)

  const claimsData = (claims || []) as unknown as Claim[]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
              Claims
            </h1>
            <p className="text-slate-400">
              Fact-check past and present statements
            </p>
          </div>
          <Link
            href="/claims/create"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            + Create Claim
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500">
            <option>All Categories</option>
            <option>Tech</option>
            <option>Politics</option>
            <option>Economics</option>
            <option>Science</option>
            <option>Sports</option>
            <option>Entertainment</option>
            <option>Health</option>
            <option>Business</option>
          </select>

          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500">
            <option>All Status</option>
            <option>Pending</option>
            <option>Verified True</option>
            <option>Verified False</option>
            <option>Partially True</option>
            <option>Misleading</option>
            <option>Unverifiable</option>
          </select>

          <select className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500">
            <option>Sort: Newest</option>
            <option>Sort: Most Votes</option>
            <option>Sort: Most Arguments</option>
            <option>Sort: Resolving Soon</option>
          </select>
        </div>

        {/* Claims Grid */}
        {claimsData.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <p className="text-slate-400">No claims found.</p>
            <p className="text-sm text-slate-500 mt-2">
              Be the first to create a claim!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claimsData.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
