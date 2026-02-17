// Backfill vote_history with REAL data based on actual argument timestamps
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function backfillRealSnapshots() {
  const predictionId = '6fe4477f-4408-4869-bd18-c2b0e8a9adad'

  console.log('=== Step 1: Delete test data ===')
  const { error: deleteError } = await supabase
    .from('vote_history')
    .delete()
    .eq('prediction_id', predictionId)

  if (deleteError) {
    console.error('Error deleting test data:', deleteError)
  } else {
    console.log('✅ Test data deleted\n')
  }

  console.log('=== Step 2: Get all arguments with timestamps ===')
  const { data: arguments, error: argsError } = await supabase
    .from('arguments')
    .select('id, prediction_id, position, confidence, author_type, created_at')
    .eq('prediction_id', predictionId)
    .eq('author_type', 'AI_AGENT')
    .in('position', ['YES', 'NO', 'NEUTRAL'])
    .order('created_at', { ascending: true })

  if (argsError) {
    console.error('Error fetching arguments:', argsError)
    return
  }

  console.log(`Found ${arguments.length} arguments:\n`)
  arguments.forEach((arg, i) => {
    console.log(`  ${i + 1}. ${arg.created_at}: ${arg.position}`)
  })

  console.log('\n=== Step 3: Create snapshots based on cumulative state ===')

  // Group arguments by hour and create cumulative snapshots
  const snapshotsByHour = new Map()

  for (const arg of arguments) {
    const argTime = new Date(arg.created_at)
    const hourKey = new Date(argTime)
    hourKey.setMinutes(0, 0, 0)
    const hourStr = hourKey.toISOString()

    // Get all arguments up to this hour
    const argsUpToThisHour = arguments.filter(a =>
      new Date(a.created_at) <= argTime
    )

    // Calculate statistics
    const yesCount = argsUpToThisHour.filter(a => a.position === 'YES').length
    const noCount = argsUpToThisHour.filter(a => a.position === 'NO').length
    const neutralCount = argsUpToThisHour.filter(a => a.position === 'NEUTRAL').length
    const total = argsUpToThisHour.length

    const yesPercentage = total > 0 ? Math.round((yesCount / total) * 100 * 100) / 100 : 0
    const noPercentage = total > 0 ? Math.round((noCount / total) * 100 * 100) / 100 : 0

    // Store the latest state for this hour
    snapshotsByHour.set(hourStr, {
      snapshot_time: hourStr,
      snapshot_hour: hourStr,
      yes_percentage: yesPercentage,
      no_percentage: noPercentage,
      yes_count: yesCount,
      no_count: noCount,
      total_predictions: total,
      ai_agent_count: total,
      human_count: 0,
    })
  }

  console.log(`Creating ${snapshotsByHour.size} snapshots...\n`)

  // Insert snapshots
  const snapshots = Array.from(snapshotsByHour.values()).sort((a, b) =>
    new Date(a.snapshot_time).getTime() - new Date(b.snapshot_time).getTime()
  )

  for (const snapshot of snapshots) {
    console.log(`${snapshot.snapshot_time}: YES ${snapshot.yes_percentage}%, NO ${snapshot.no_percentage}% (total: ${snapshot.total_predictions})`)

    const { error: insertError } = await supabase
      .from('vote_history')
      .insert({
        prediction_id: predictionId,
        ...snapshot
      })

    if (insertError) {
      console.error(`  ❌ Error:`, insertError.message)
    } else {
      console.log(`  ✅ Created`)
    }
  }

  console.log('\n=== Step 4: Verify snapshots ===')
  const { data: verify, error: verifyError } = await supabase
    .from('vote_history')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('snapshot_time', { ascending: true })

  if (verifyError) {
    console.error('Error:', verifyError)
  } else {
    console.log(`\nFinal result: ${verify.length} snapshots`)
    verify.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.snapshot_time}: YES ${s.yes_percentage}%, NO ${s.no_percentage}%`)
    })
  }

  console.log('\n✅ Real data backfilled! Refresh the page to see actual data.')
}

backfillRealSnapshots().catch(console.error)
