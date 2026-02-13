import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import type { GoogleFactCheckAPIResponse, GoogleFactCheckClaim } from '@/types/credibility'

/**
 * GET /api/factcheck/google?query=<text>
 * Search Google Fact Check API for fact-checks related to a query
 *
 * Query Parameters:
 * - query: Text to search for fact-checks
 * - languageCode: Optional language code (default: 'en')
 * - pageSize: Number of results (default: 10, max: 50)
 *
 * Returns cached results if available (within 7 days)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const languageCode = searchParams.get('languageCode') || 'en'
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 50)

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Check if we have Google Fact Check API key
    const apiKey = process.env.GOOGLE_FACTCHECK_API_KEY
    if (!apiKey) {
      console.warn('⚠️ GOOGLE_FACTCHECK_API_KEY not configured, using mock data')
      return NextResponse.json({
        claims: [],
        cached: false,
        warning: 'Google Fact Check API not configured'
      })
    }

    const supabase = await createClient()

    // Create query hash for caching
    const normalizedQuery = query.trim().toLowerCase()
    const queryHash = createHash('sha256')
      .update(`${normalizedQuery}:${languageCode}`)
      .digest('hex')

    // Check cache first
    const { data: cachedResult } = await supabase
      .from('google_factcheck_cache')
      .select('*')
      .eq('query_hash', queryHash)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (cachedResult) {
      console.log(`✅ Cache hit for query: "${query}"`)

      // Update last accessed time
      await supabase
        .from('google_factcheck_cache')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', cachedResult.id)

      return NextResponse.json({
        claims: cachedResult.fact_check_results?.claims || [],
        cached: true,
        cachedAt: cachedResult.created_at
      })
    }

    console.log(`🔍 Fetching from Google Fact Check API: "${query}"`)

    // Call Google Fact Check API
    const apiUrl = new URL('https://factchecktools.googleapis.com/v1alpha1/claims:search')
    apiUrl.searchParams.set('query', query)
    apiUrl.searchParams.set('languageCode', languageCode)
    apiUrl.searchParams.set('pageSize', pageSize.toString())
    apiUrl.searchParams.set('key', apiKey)

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Fact Check API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch from Google Fact Check API', details: errorText },
        { status: response.status }
      )
    }

    const data: GoogleFactCheckAPIResponse = await response.json()
    const claims: GoogleFactCheckClaim[] = data.claims || []

    console.log(`✅ Found ${claims.length} fact-checks for "${query}"`)

    // Cache the result
    await supabase.from('google_factcheck_cache').insert({
      query_text: query,
      query_hash: queryHash,
      fact_check_results: { claims },
      claims_found: claims.length,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })

    return NextResponse.json({
      claims,
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in Google Fact Check API endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/factcheck/google/batch
 * Batch search multiple queries
 *
 * Body:
 * {
 *   queries: string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queries } = body

    if (!Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: 'queries array is required' },
        { status: 400 }
      )
    }

    if (queries.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 queries per batch request' },
        { status: 400 }
      )
    }

    // Process each query
    const results = await Promise.all(
      queries.map(async (query) => {
        const searchParams = new URLSearchParams({ query })
        const url = new URL(`/api/factcheck/google?${searchParams}`, request.url)

        try {
          const response = await fetch(url.toString())
          const data = await response.json()
          return {
            query,
            success: response.ok,
            data
          }
        } catch (error) {
          return {
            query,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    return NextResponse.json({
      results,
      total: results.length,
      successful: results.filter(r => r.success).length
    })

  } catch (error) {
    console.error('Error in batch fact check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
