import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SourceReputation } from '@/types/credibility'
import { extractDomain } from '@/types/credibility'

/**
 * GET /api/sources/[domain]
 * Get source reputation for a domain
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params
    const supabase = await createClient()

    // Normalize domain (remove www.)
    const normalizedDomain = domain.replace('www.', '').toLowerCase()

    const { data: source, error } = await supabase
      .from('source_reputation')
      .select('*')
      .eq('domain', normalizedDomain)
      .single()

    if (error || !source) {
      // Return default values if source not found
      return NextResponse.json({
        domain: normalizedDomain,
        credibilityScore: 50,
        sourceType: 'OTHER',
        biasRating: 'UNKNOWN',
        isKnown: false
      })
    }

    // Convert to camelCase
    const sourceReputation: SourceReputation = {
      id: source.id,
      domain: source.domain,
      sourceName: source.source_name,
      sourceType: source.source_type,
      credibilityScore: source.credibility_score,
      verificationCount: source.verification_count,
      accuracyRate: source.accuracy_rate,
      biasRating: source.bias_rating,
      factCheckRating: source.fact_check_rating,
      notes: source.notes,
      createdAt: source.created_at,
      updatedAt: source.updated_at,
      lastVerifiedAt: source.last_verified_at
    }

    return NextResponse.json({
      ...sourceReputation,
      isKnown: true
    })

  } catch (error) {
    console.error('Error fetching source reputation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sources/[domain]
 * Create or update source reputation
 * (Admin only - TODO: Add auth check)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Normalize domain
    const normalizedDomain = domain.replace('www.', '').toLowerCase()

    const {
      sourceName,
      sourceType,
      credibilityScore,
      biasRating,
      factCheckRating,
      notes
    } = body

    // Validate credibilityScore
    if (credibilityScore !== undefined && (credibilityScore < 0 || credibilityScore > 100)) {
      return NextResponse.json(
        { error: 'credibilityScore must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Upsert source reputation
    const { data: source, error } = await supabase
      .from('source_reputation')
      .upsert({
        domain: normalizedDomain,
        source_name: sourceName,
        source_type: sourceType,
        credibility_score: credibilityScore,
        bias_rating: biasRating,
        fact_check_rating: factCheckRating,
        notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'domain'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting source reputation:', error)
      return NextResponse.json(
        { error: 'Failed to update source reputation' },
        { status: 500 }
      )
    }

    console.log(`✅ Updated source reputation for ${normalizedDomain}`)

    return NextResponse.json({
      source,
      message: 'Source reputation updated successfully'
    })

  } catch (error) {
    console.error('Error in source reputation update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sources/lookup?url=<url>
 * Lookup source reputation from full URL
 */
export async function lookup(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'url parameter is required' },
        { status: 400 }
      )
    }

    const domain = extractDomain(url)
    if (!domain) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: source } = await supabase
      .from('source_reputation')
      .select('*')
      .eq('domain', domain)
      .single()

    if (!source) {
      return NextResponse.json({
        domain,
        credibilityScore: 50,
        sourceType: 'OTHER',
        biasRating: 'UNKNOWN',
        isKnown: false
      })
    }

    return NextResponse.json({
      id: source.id,
      domain: source.domain,
      sourceName: source.source_name,
      credibilityScore: source.credibility_score,
      sourceType: source.source_type,
      biasRating: source.bias_rating,
      isKnown: true
    })

  } catch (error) {
    console.error('Error in source lookup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
