import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface FeaturedAgenda {
  id: string
  type: 'prediction' | 'claim'
  title: string
  description?: string
  category: string | null
  imageUrl?: string
  stats: {
    consensus: number
    trend24h: number
    agentCount: number
    avgConfidence: number
    argumentCount: number
    totalVotes: number
  }
}

// GET /api/featured-agendas - Get 5-7 featured agendas with enhanced stats
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // First, fetch showcase predictions (highest priority)
    const { data: showcasePredictions, error: showcaseError } = await supabase
      .from('predictions')
      .select('*')
      .eq('is_showcase', true)
      .is('resolution_value', null) // Only open predictions
      .order('created_at', { ascending: false })
      .limit(1)

    if (showcaseError) {
      console.error('Error fetching showcase predictions:', showcaseError)
    }

    // Fetch top predictions (most active)
    const { data: predictions, error: predError } = await supabase
      .from('predictions')
      .select('*')
      .is('resolution_value', null) // Only open predictions
      .eq('is_showcase', false) // Exclude showcase to avoid duplicates
      .order('created_at', { ascending: false })
      .limit(4)

    if (predError) {
      console.error('Error fetching predictions:', predError)
    }

    // Fetch top claims (most active)
    const { data: claims, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('approval_status', 'APPROVED')
      .order('created_at', { ascending: false })
      .limit(4)

    if (claimError) {
      console.error('Error fetching claims:', claimError)
    }

    const featuredAgendas: FeaturedAgenda[] = []

    // Process showcase predictions FIRST (highest priority)
    if (showcasePredictions && showcasePredictions.length > 0) {
      for (const pred of showcasePredictions) {
        // Get votes for consensus
        const { data: votes } = await supabase
          .from('prediction_votes')
          .select('vote_value')
          .eq('prediction_id', pred.id)

        const yesVotes = votes?.filter(v => v.vote_value === true).length || 0
        const totalVotes = votes?.length || 0
        const consensus = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 50

        // Get arguments stats
        const { data: args } = await supabase
          .from('arguments')
          .select('author_type, confidence')
          .eq('prediction_id', pred.id)

        const agentArguments = args?.filter(a => a.author_type === 'AI_AGENT') || []
        const avgConfidence = agentArguments.length > 0
          ? agentArguments.reduce((sum, a) => sum + (a.confidence || 0), 0) / agentArguments.length
          : 0

        // Positive trend for showcase
        const trend24h = 8

        featuredAgendas.push({
          id: pred.id,
          type: 'prediction',
          title: pred.title,
          description: pred.description,
          category: pred.category,
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
    }

    // Process predictions
    if (predictions && predictions.length > 0) {
      for (const pred of predictions.slice(0, 3)) {
        // Get votes for consensus
        const { data: votes } = await supabase
          .from('prediction_votes')
          .select('vote_value')
          .eq('prediction_id', pred.id)

        const yesVotes = votes?.filter(v => v.vote_value === true).length || 0
        const totalVotes = votes?.length || 0
        const consensus = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 50

        // Get arguments stats
        const { data: args } = await supabase
          .from('arguments')
          .select('author_type, confidence')
          .eq('prediction_id', pred.id)

        const agentArguments = args?.filter(a => a.author_type === 'AI_AGENT') || []
        const agentCount = new Set(agentArguments.map(a => a.author_type)).size
        const avgConfidence = agentArguments.length > 0
          ? agentArguments.reduce((sum, a) => sum + (a.confidence || 0), 0) / agentArguments.length
          : 0

        // Mock 24h trend for now (-10% to +10%)
        const trend24h = Math.floor(Math.random() * 21) - 10

        featuredAgendas.push({
          id: pred.id,
          type: 'prediction',
          title: pred.title,
          description: pred.description,
          category: pred.category,
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
    }

    // Process claims
    if (claims && claims.length > 0) {
      for (const claim of claims.slice(0, 3)) {
        // Get votes for consensus
        const { data: votes } = await supabase
          .from('claim_votes')
          .select('vote_value')
          .eq('claim_id', claim.id)

        const trueVotes = votes?.filter(v => v.vote_value === true).length || 0
        const totalVotes = votes?.length || 0
        const consensus = totalVotes > 0 ? (trueVotes / totalVotes) * 100 : 50

        // Get arguments stats
        const { data: claimArgs } = await supabase
          .from('claim_arguments')
          .select('author_type, confidence')
          .eq('claim_id', claim.id)

        const agentArguments = claimArgs?.filter(a => a.author_type === 'AI_AGENT') || []
        const agentCount = agentArguments.length
        const avgConfidence = agentArguments.length > 0
          ? agentArguments.reduce((sum, a) => sum + (a.confidence || 0), 0) / agentArguments.length
          : 0

        // Mock 24h trend for now (-10% to +10%)
        const trend24h = Math.floor(Math.random() * 21) - 10

        featuredAgendas.push({
          id: claim.id,
          type: 'claim',
          title: claim.title,
          description: claim.description,
          category: claim.category,
          stats: {
            consensus,
            trend24h,
            agentCount,
            avgConfidence: avgConfidence * 100,
            argumentCount: claimArgs?.length || 0,
            totalVotes,
          },
        })
      }
    }

    // Keep showcase at the top, shuffle the rest
    const hasShowcase = showcasePredictions && showcasePredictions.length > 0

    if (hasShowcase) {
      // Showcase is already first, shuffle the rest
      const showcase = featuredAgendas.slice(0, 1)
      const others = featuredAgendas.slice(1).sort(() => Math.random() - 0.5)
      const selected = [...showcase, ...others].slice(0, Math.min(6, featuredAgendas.length))
      return NextResponse.json(selected)
    } else {
      // No showcase, shuffle everything
      const shuffled = featuredAgendas.sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, Math.min(6, shuffled.length))
      return NextResponse.json(selected)
    }
  } catch (error: any) {
    console.error('Error fetching featured agendas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured agendas' },
      { status: 500 }
    )
  }
}
