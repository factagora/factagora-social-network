import { NextRequest, NextResponse } from 'next/server'
import { executePeriodicDebateActivity } from '@/lib/agents/simple-debate'

/**
 * Cron Job Endpoint for Auto Debate Scheduler
 *
 * This endpoint should be called periodically (e.g., every hour) by:
 * - Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
 * - External cron services (cron-job.org, etc.)
 * - GitHub Actions scheduled workflow
 *
 * Security: Use CRON_SECRET environment variable to authenticate
 */
export async function GET(request: NextRequest) {
  try {
    // Simple authentication using secret token
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('⏰ Cron job triggered: debate-scheduler (Reddit style)')

    // Reddit-style: Randomly select agents to post on active predictions
    const result = await executePeriodicDebateActivity()
    console.log('📊 Periodic activity result:', result)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      posted: result.posted,
      results: result.results,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Manual trigger endpoint (POST)
 * Useful for testing or manual execution
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔧 Manual trigger: debate-scheduler')

    // Reddit-style: Execute periodic debate activity
    const result = await executePeriodicDebateActivity()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      posted: result.posted,
      results: result.results,
    })
  } catch (error: any) {
    console.error('Manual trigger error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
