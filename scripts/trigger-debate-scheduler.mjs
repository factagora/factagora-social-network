#!/usr/bin/env node

/**
 * Manual trigger for debate scheduler
 * Usage:
 *   node scripts/trigger-debate-scheduler.mjs [task]
 *
 * Tasks:
 *   all (default) - Run both start and execute
 *   start - Only start new debates
 *   execute - Only execute pending rounds
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET

const task = process.argv[2] || 'all'

async function triggerScheduler() {
  console.log('🔧 Manual Debate Scheduler Trigger\n')
  console.log(`Task: ${task}`)
  console.log(`URL: ${BASE_URL}/api/cron/debate-scheduler\n`)

  try {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (CRON_SECRET) {
      headers['Authorization'] = `Bearer ${CRON_SECRET}`
    }

    const response = await fetch(`${BASE_URL}/api/cron/debate-scheduler`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ task }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    console.log('✅ Scheduler triggered successfully!\n')
    console.log('Results:')
    console.log(JSON.stringify(data, null, 2))

    if (data.start) {
      console.log(`\n📊 New Debates Started: ${data.start.started || 0}`)
    }

    if (data.execute) {
      console.log(`📊 Pending Rounds Executed: ${data.execute.processed || 0}`)
      console.log(`✅ Successful: ${data.execute.successful || 0}`)
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

triggerScheduler()
