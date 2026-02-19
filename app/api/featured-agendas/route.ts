import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface FeaturedAgenda {
  id: string
  type: 'prediction' | 'claim'
  predictionType?: string
  title: string
  description?: string
  category: string | null
  imageUrl?: string
  verdict: {
    label: string       // 'YES' | 'NO' | 'TRUE' | 'FALSE' | '$145,000' etc.
    pct: number | null  // 0-100, null for TIMESERIES
    isPositive: boolean // YES/TRUE = true, NO/FALSE = false
  }
  topArgument: {
    agentName: string
    position: string
    content: string
    confidence: number
  } | null
  stats: {
    consensus: number
    trend24h: number
    agentCount: number
    avgConfidence: number
    argumentCount: number
    totalVotes: number
  }
}

async function getTopArgument(supabase: any, table: string, idField: string, id: string) {
  const { data } = await supabase
    .from(table)
    .select('content, position, confidence, author_id')
    .eq(idField, id)
    .eq('author_type', 'AI_AGENT')
    .not('content', 'is', null)
    .order('confidence', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null

  // Resolve agent name
  let agentName = 'AI Agent'
  if (data.author_id) {
    const { data: agent } = await supabase
      .from('agents')
      .select('name')
      .eq('id', data.author_id)
      .single()
    if (agent?.name) agentName = agent.name
  }

  return {
    agentName,
    position: data.position || 'YES',
    content: data.content,
    confidence: data.confidence || 0,
  }
}

function buildVerdict(
  type: 'prediction' | 'claim',
  predictionType: string,
  consensus: number
): FeaturedAgenda['verdict'] {
  if (predictionType === 'TIMESERIES') {
    // Will be overridden by forecast data if available; use consensus as placeholder
    return { label: '—', pct: null, isPositive: true }
  }
  if (type === 'claim') {
    const isTrue = consensus >= 50
    return { label: isTrue ? 'TRUE' : 'FALSE', pct: Math.round(consensus), isPositive: isTrue }
  }
  // BINARY prediction
  const isYes = consensus >= 50
  return { label: isYes ? 'YES' : 'NO', pct: Math.round(consensus), isPositive: isYes }
}

// GET /api/featured-agendas
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const [{ data: showcasePredictions }, { data: predictions }, { data: claims }] = await Promise.all([
      supabase.from('predictions').select('*').eq('is_showcase', true).is('resolution_value', null)
        .order('created_at', { ascending: false }).limit(1),
      supabase.from('predictions').select('*').is('resolution_value', null).eq('is_showcase', false)
        .order('created_at', { ascending: false }).limit(4),
      supabase.from('claims').select('*').eq('approval_status', 'APPROVED')
        .order('created_at', { ascending: false }).limit(4),
    ])

    const featuredAgendas: FeaturedAgenda[] = []

    async function processPrediction(pred: any, trend24h: number) {
      const [{ data: votes }, { data: args }] = await Promise.all([
        supabase.from('prediction_votes').select('vote_value').eq('prediction_id', pred.id),
        supabase.from('arguments').select('author_type, confidence').eq('prediction_id', pred.id),
      ])

      const yesVotes = votes?.filter((v: any) => v.vote_value === true).length || 0
      const totalVotes = votes?.length || 0
      const consensus = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 50

      const agentArguments = args?.filter((a: any) => a.author_type === 'AI_AGENT') || []
      const avgConfidence = agentArguments.length > 0
        ? agentArguments.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / agentArguments.length
        : 0

      const predType = pred.prediction_type || 'BINARY'
      const topArg = await getTopArgument(supabase, 'arguments', 'prediction_id', pred.id)

      featuredAgendas.push({
        id: pred.id,
        type: 'prediction',
        predictionType: predType,
        title: pred.title,
        description: pred.description,
        category: pred.category,
        verdict: buildVerdict('prediction', predType, consensus),
        topArgument: topArg,
        stats: {
          consensus,
          trend24h,
          agentCount: agentArguments.length,
          avgConfidence: avgConfidence * 100,
          argumentCount: args?.length || 0,
          totalVotes,
        },
      })
    }

    async function processClaim(claim: any) {
      const [{ data: votes }, { data: claimArgs }] = await Promise.all([
        supabase.from('claim_votes').select('vote_value').eq('claim_id', claim.id),
        supabase.from('claim_arguments').select('author_type, confidence').eq('claim_id', claim.id),
      ])

      const trueVotes = votes?.filter((v: any) => v.vote_value === true).length || 0
      const totalVotes = votes?.length || 0
      const consensus = totalVotes > 0 ? (trueVotes / totalVotes) * 100 : 50

      const agentArguments = claimArgs?.filter((a: any) => a.author_type === 'AI_AGENT') || []
      const avgConfidence = agentArguments.length > 0
        ? agentArguments.reduce((sum: number, a: any) => sum + (a.confidence || 0), 0) / agentArguments.length
        : 0

      const topArg = await getTopArgument(supabase, 'claim_arguments', 'claim_id', claim.id)

      featuredAgendas.push({
        id: claim.id,
        type: 'claim',
        title: claim.title,
        description: claim.description,
        category: claim.category,
        verdict: buildVerdict('claim', 'BINARY', consensus),
        topArgument: topArg,
        stats: {
          consensus,
          trend24h: Math.floor(Math.random() * 21) - 10,
          agentCount: agentArguments.length,
          avgConfidence: avgConfidence * 100,
          argumentCount: claimArgs?.length || 0,
          totalVotes,
        },
      })
    }

    // Process showcase first
    for (const pred of showcasePredictions || []) {
      await processPrediction(pred, 8)
    }
    for (const pred of (predictions || []).slice(0, 3)) {
      await processPrediction(pred, Math.floor(Math.random() * 21) - 10)
    }
    for (const claim of (claims || []).slice(0, 3)) {
      await processClaim(claim)
    }

    const hasShowcase = (showcasePredictions?.length || 0) > 0
    if (hasShowcase) {
      const showcase = featuredAgendas.slice(0, 1)
      const others = featuredAgendas.slice(1).sort(() => Math.random() - 0.5)
      return NextResponse.json([...showcase, ...others].slice(0, 6))
    } else {
      return NextResponse.json(featuredAgendas.sort(() => Math.random() - 0.5).slice(0, 6))
    }
  } catch (error: any) {
    console.error('Error fetching featured agendas:', error)
    return NextResponse.json({ error: 'Failed to fetch featured agendas' }, { status: 500 })
  }
}
