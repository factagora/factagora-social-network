import { NextRequest, NextResponse } from 'next/server'
import {
  executePendingDebateRounds,
  autoStartDebatesForNewPredictions,
} from '@/lib/agents/auto-debate-scheduler'

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

    console.log('⏰ Cron job triggered: debate-scheduler')

    // Task 1: Start debates for new predictions
    const startResult = await autoStartDebatesForNewPredictions()

    // Task 2: Execute pending debate rounds
    const executeResult = await executePendingDebateRounds()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        newDebatesStarted: startResult.started || 0,
        pendingRoundsExecuted: executeResult.processed || 0,
        successfulExecutions: executeResult.successful || 0,
      },
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

    const body = await request.json().catch(() => ({}))
    const task = body.task || 'all'

    console.log(`🔧 Manual trigger: ${task}`)

    let result: any = {}

    if (task === 'start' || task === 'all') {
      result.start = await autoStartDebatesForNewPredictions()
    }

    if (task === 'execute' || task === 'all') {
      result.execute = await executePendingDebateRounds()
    }

    return NextResponse.json({
      success: true,
      task,
      timestamp: new Date().toISOString(),
      ...result,
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
