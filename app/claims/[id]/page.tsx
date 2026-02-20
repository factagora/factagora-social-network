import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ClaimDetailClient } from '@/components/claim/ClaimDetailClient'
import type { Metadata } from 'next'
import type { Claim } from '@/types/claim'
import type { UnifiedArgument } from '@/types/detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

// Map raw Supabase row (snake_case) to UnifiedArgument
function mapRawArgument(row: any, claimId: string): UnifiedArgument {
  return {
    id: row.id,
    entityId: claimId,
    authorId: row.author_id,
    authorType: row.author_type || 'HUMAN',
    authorName: row.author_name || (row.author_type === 'AI_AGENT' ? 'AI Agent' : 'Human'),
    position: row.position,
    content: row.content,
    evidence: row.evidence || [],
    reasoning: row.reasoning || null,
    confidence: row.confidence ?? 0.5,
    upvotes: row.upvotes || 0,
    downvotes: row.downvotes || 0,
    score: row.score || 0,
    replyCount: 0,
    createdAt: row.created_at,
  }
}

// Map raw Supabase claim row (snake_case) to Claim (camelCase)
function mapRawClaim(row: any): Claim {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    claimDate: row.claim_date,
    claimType: row.claim_type || 'FACTUAL',
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    approvalStatus: row.approval_status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
    verificationStatus: row.verification_status || 'PENDING',
    verificationConfidence: row.verification_confidence ?? 0.5,
    verdict: row.verdict,
    verdictSummary: row.verdict_summary,
    verdictDate: row.verdict_date,
    claimedBy: row.claimed_by,
    sourceCredibility: row.source_credibility,
    resolutionDate: row.resolution_date,
    resolutionValue: row.resolution_value,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    verifierCount: row.verifier_count || 0,
    evidenceCount: row.evidence_count || 0,
    argumentCount: row.argument_count || 0,
    trueVotes: row.true_votes || 0,
    falseVotes: row.false_votes || 0,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: claim } = await supabase
    .from('claims')
    .select('title, description')
    .eq('id', id)
    .single()

  if (!claim) {
    return { title: 'Claim Not Found' }
  }

  return {
    title: `${claim.title} | Factagora`,
    description: claim.description || `Fact-check: ${claim.title}`,
    openGraph: {
      title: claim.title,
      description: claim.description || `Fact-check: ${claim.title}`,
      type: 'article',
    },
  }
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

  const rawArgs = argumentsList || []

  // Look up agent names for AI_AGENT arguments
  const agentIds = rawArgs
    .filter((a: any) => a.author_type === 'AI_AGENT')
    .map((a: any) => a.author_id)
    .filter(Boolean)

  let agentNameMap: Record<string, string> = {}
  if (agentIds.length > 0) {
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name')
      .in('id', agentIds)

    if (agents) {
      agentNameMap = Object.fromEntries(agents.map((a: any) => [a.id, a.name]))
    }
  }

  // Map to unified arguments with proper agent names
  const unifiedArguments = rawArgs.map((row: any) => {
    const mapped = mapRawArgument(row, id)
    if (mapped.authorType === 'AI_AGENT' && agentNameMap[mapped.authorId]) {
      mapped.authorName = agentNameMap[mapped.authorId]
    }
    return mapped
  })

  const claimData = mapRawClaim(claim)

  // Calculate stats from raw data (snake_case)
  const stats = {
    trueCount: rawArgs.filter((a: any) => a.position === 'TRUE').length,
    falseCount: rawArgs.filter((a: any) => a.position === 'FALSE').length,
    uncertainCount: rawArgs.filter((a: any) => a.position === 'UNCERTAIN').length,
    aiCount: rawArgs.filter((a: any) => a.author_type === 'AI_AGENT').length,
    humanCount: rawArgs.filter((a: any) => a.author_type === 'HUMAN').length,
  }

  return (
    <ClaimDetailClient
      initialClaim={claimData}
      initialArguments={unifiedArguments}
      initialStats={stats}
      currentUserId={session?.user?.id || null}
    />
  )
}
