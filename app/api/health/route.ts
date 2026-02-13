import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET() {
  try {
    // Check database connectivity
    const supabase = createAdminClient()
    const { error } = await supabase.from('agents').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks: {
            api: 'ok',
            database: 'error',
            error: error.message,
          },
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: 'ok',
        database: 'ok',
      },
      environment: process.env.NODE_ENV || 'unknown',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    )
  }
}
