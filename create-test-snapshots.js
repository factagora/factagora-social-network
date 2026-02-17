// Create test snapshots with varying percentages over time
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestSnapshots() {
  const predictionId = '6fe4477f-4408-4869-bd18-c2b0e8a9adad'

  // Create snapshots for the last 24 hours, showing gradual increase in YES percentage
  const snapshots = []
  const now = new Date()

  // Simulate Kalshi-style chart: YES gradually increases from 40% to 100%
  const timePoints = [
    { hoursAgo: 24, yes: 40, no: 60, total: 2 },
    { hoursAgo: 20, yes: 45, no: 55, total: 3 },
    { hoursAgo: 16, yes: 55, no: 45, total: 4 },
    { hoursAgo: 12, yes: 65, no: 35, total: 5 },
    { hoursAgo: 8, yes: 75, no: 25, total: 6 },
    { hoursAgo: 4, yes: 85, no: 15, total: 7 },
    { hoursAgo: 0, yes: 100, no: 0, total: 8 },
  ]

  console.log('Creating test snapshots...\n')

  for (const point of timePoints) {
    const snapshotTime = new Date(now.getTime() - point.hoursAgo * 60 * 60 * 1000)
    const snapshotHour = new Date(snapshotTime)
    snapshotHour.setMinutes(0, 0, 0) // Truncate to hour

    const yesCount = Math.round(point.total * point.yes / 100)
    const noCount = point.total - yesCount

    console.log(`${point.hoursAgo}h ago: ${point.yes}% YES, ${point.no}% NO (${yesCount} YES, ${noCount} NO)`)

    const { error } = await supabase
      .from('vote_history')
      .upsert({
        prediction_id: predictionId,
        snapshot_time: snapshotHour.toISOString(),
        snapshot_hour: snapshotHour.toISOString(),
        yes_percentage: point.yes,
        no_percentage: point.no,
        yes_count: yesCount,
        no_count: noCount,
        total_predictions: point.total,
        ai_agent_count: point.total,
        human_count: 0,
      }, {
        onConflict: 'prediction_id,snapshot_hour'
      })

    if (error) {
      console.error(`  ❌ Error:`, error.message)
    } else {
      console.log(`  ✅ Created`)
    }
  }

  // Verify the snapshots
  console.log('\n=== Verifying snapshots ===')
  const { data: snapshots_verify, error: verifyError } = await supabase
    .from('vote_history')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('snapshot_time', { ascending: true })

  if (verifyError) {
    console.error('Error:', verifyError)
  } else {
    console.log(`Found ${snapshots_verify?.length || 0} snapshots:\n`)
    snapshots_verify?.forEach((s) => {
      console.log(`  ${s.snapshot_time}: YES ${s.yes_percentage}%, NO ${s.no_percentage}%`)
    })
  }

  console.log('\n✅ Done! Refresh the prediction page to see the chart.')
}

createTestSnapshots().catch(console.error)
