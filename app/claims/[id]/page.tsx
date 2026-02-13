import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClaimVoteButton from '@/components/claim/ClaimVoteButton'
import ResolutionButton from '@/components/claim/ResolutionButton'
import ResolutionResults from '@/components/claim/ResolutionResults'
import EvidenceList from '@/components/claim/EvidenceList'
import EvidenceSubmitForm from '@/components/forms/EvidenceSubmitForm'
import ArgumentSubmitForm from '@/components/forms/ArgumentSubmitForm'
import ClaimArgumentCard from '@/components/claim/ClaimArgumentCard'
import { VerdictBadge } from '@/components/claim/VerdictBadge'
import {
  getVerificationStatusColor,
  getVerificationStatusLabel,
} from '@/types/claim'
import type { Claim, ClaimArgument } from '@/types/claim'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClaimDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Fetch claim
  const { data: claim, error } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !claim) {
    notFound()
  }

  // Fetch arguments
  const { data: argumentsList } = await supabase
    .from('claim_arguments')
    .select('*')
    .eq('claim_id', id)
    .order('score', { ascending: false })

  const claimData = claim as unknown as Claim
  const argumentsData = (argumentsList || []) as unknown as ClaimArgument[]
  const isCreator = session?.user?.id === claimData.createdBy

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getVerificationStatusColor(
                claimData.verificationStatus
              )}`}
            >
              {getVerificationStatusLabel(claimData.verificationStatus)}
            </span>
            {claimData.category && (
              <span className="px-3 py-1 rounded text-sm bg-slate-700/50 text-slate-300">
                {claimData.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            {claimData.title}
          </h1>

          {claimData.description && (
            <p className="text-slate-300 text-lg mb-4 whitespace-pre-wrap">
              {claimData.description}
            </p>
          )}

          {claimData.sourceUrl && (
            <a
              href={claimData.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
            >
              View source →
            </a>
          )}

          {/* Resolution Info */}
          <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
            {claimData.resolvedAt ? (
              <div>
                <span className="font-medium">Resolved: </span>
                <span
                  className={
                    claimData.resolutionValue
                      ? 'text-green-400'
                      : 'text-red-400'
                  }
                >
                  {claimData.resolutionValue ? 'TRUE' : 'FALSE'}
                </span>
                <span className="ml-2">
                  on {new Date(claimData.resolvedAt).toLocaleDateString()}
                </span>
              </div>
            ) : claimData.resolutionDate ? (
              <div>
                <span className="font-medium">Resolves: </span>
                <span>
                  {new Date(claimData.resolutionDate).toLocaleDateString()}
                </span>
              </div>
            ) : null}

            <div>
              <span className="font-medium">Created: </span>
              {new Date(claimData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Verdict Section - Prominent Display */}
        {claimData.verdict && claimData.verdict !== 'UNVERIFIED' ? (
          <div className="mb-8 p-8 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-slate-400 font-semibold text-lg">Verdict:</span>
              <VerdictBadge verdict={claimData.verdict} size="lg" />
            </div>

            {claimData.verdictSummary && (
              <p className="text-slate-300 text-base mb-3 leading-relaxed">
                {claimData.verdictSummary}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-slate-400">
              {claimData.verdictDate && (
                <div>
                  <span className="font-medium">Verified: </span>
                  {new Date(claimData.verdictDate).toLocaleDateString()}
                </div>
              )}

              {claimData.claimedBy && (
                <div>
                  <span className="font-medium">Originally claimed by: </span>
                  <span className="text-white">{claimData.claimedBy}</span>
                  {claimData.claimDate && (
                    <span className="ml-1">
                      on {new Date(claimData.claimDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}

              {claimData.sourceCredibility !== null && claimData.sourceCredibility !== undefined && (
                <div>
                  <span className="font-medium">Source credibility: </span>
                  <span className={`font-bold ${
                    claimData.sourceCredibility >= 70 ? 'text-green-400' :
                    claimData.sourceCredibility >= 50 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {claimData.sourceCredibility}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
            <p className="text-yellow-400 font-medium">
              ⚠️ This claim has not been verified yet. Help by submitting evidence and arguments!
            </p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Vote + Resolution + Evidence */}
          <div className="space-y-6">
            {/* Vote Section */}
            {!claimData.resolvedAt && <ClaimVoteButton claimId={id} />}

            {/* Resolution Section */}
            <ResolutionButton
              claimId={id}
              resolutionDate={claimData.resolutionDate}
              isCreator={isCreator}
              isResolved={!!claimData.resolvedAt}
              resolutionValue={claimData.resolutionValue}
            />

            {/* Resolution Results */}
            {claimData.resolvedAt && claimData.resolutionValue !== null && (
              <ResolutionResults
                claimId={id}
                resolutionValue={claimData.resolutionValue}
              />
            )}

            {/* Evidence Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-4">
                Evidence
              </h2>
              <div className="space-y-4">
                {!claimData.resolvedAt && <EvidenceSubmitForm claimId={id} />}
                <EvidenceList claimId={id} />
              </div>
            </div>
          </div>

          {/* Right Column: Arguments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-100">
                Arguments ({argumentsData.length})
              </h2>
              {!claimData.resolvedAt && <ArgumentSubmitForm claimId={id} />}
            </div>

            {claimData.resolvedAt && (
              <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  This claim has been resolved. No new arguments can be added.
                </p>
              </div>
            )}

            {argumentsData.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <p className="text-slate-400">No arguments yet.</p>
                <p className="text-sm text-slate-500 mt-2">
                  Be the first to make an argument!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {argumentsData.map((arg) => (
                  <ClaimArgumentCard
                    key={arg.id}
                    argument={arg}
                    claimId={id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
