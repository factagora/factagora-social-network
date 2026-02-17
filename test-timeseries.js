// Test vote_history snapshots
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTimeseries() {
  const predictionId = '6fe4477f-4408-4869-bd18-c2b0e8a9adad'

  // Check if vote_history table exists
  console.log('=== Checking vote_history table ===')
  const { data: snapshots, error: snapshotsError } = await supabase
    .from('vote_history')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('snapshot_time', { ascending: true })

  if (snapshotsError) {
    console.error('Error:', snapshotsError)
  } else {
    console.log(`Found ${snapshots?.length || 0} snapshots for this prediction`)
    if (snapshots && snapshots.length > 0) {
      console.log('\nLatest snapshot:')
      const latest = snapshots[snapshots.length - 1]
      console.log(`  Time: ${latest.snapshot_time}`)
      console.log(`  YES: ${latest.yes_percentage}%, NO: ${latest.no_percentage}%`)
      console.log(`  Total: ${latest.total_predictions}`)
      console.log(`  AI: ${latest.ai_agent_count}, Human: ${latest.human_count}`)
    }
  }

  // Try to manually create a snapshot
  console.log('\n=== Manually creating snapshot ===')
  const { data: snapshotResult, error: createError } = await supabase
    .rpc('create_vote_history_snapshot', { pred_id: predictionId })

  if (createError) {
    console.error('Error creating snapshot:', createError)
  } else {
    console.log('✅ Snapshot created:', snapshotResult)
  }

  // Check again after creating
  console.log('\n=== Checking snapshots again ===')
  const { data: newSnapshots, error: newError } = await supabase
    .from('vote_history')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('snapshot_time', { ascending: true })

  if (newError) {
    console.error('Error:', newError)
  } else {
    console.log(`Now have ${newSnapshots?.length || 0} snapshots`)
    if (newSnapshots && newSnapshots.length > 0) {
      console.log('\nAll snapshots:')
      newSnapshots.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.snapshot_time}: YES ${s.yes_percentage}%, NO ${s.no_percentage}% (total: ${s.total_predictions})`)
      })
    }
  }

  // Test the API endpoint
  console.log('\n=== Testing API endpoint ===')
  const apiUrl = `http://localhost:3000/api/predictions/${predictionId}/timeseries`
  console.log(`Fetching: ${apiUrl}`)

  try {
    const response = await fetch(apiUrl)
    const data = await response.json()
    console.log('API Response:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('API Error:', err.message)
  }
}

testTimeseries().catch(console.error)
