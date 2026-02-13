import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanRound2() {
  const predictionId = process.argv[2]

  if (!predictionId) {
    console.error('Usage: npx tsx scripts/clean-round2.ts <prediction-id>')
    process.exit(1)
  }

  console.log(`\n🧹 Cleaning Round 2 data for prediction: ${predictionId}\n`)

  // Delete debate_rounds for Round 2
  const { error: roundsError } = await supabase
    .from('debate_rounds')
    .delete()
    .eq('prediction_id', predictionId)
    .eq('round_number', 2)

  if (roundsError) {
    console.error('❌ Failed to delete Round 2:', roundsError)
  } else {
    console.log('✅ Deleted Round 2 record')
  }

  // Delete argument_replies for Round 2
  const { error: repliesError } = await supabase
    .from('argument_replies')
    .delete()
    .eq('round_number', 2)

  if (repliesError) {
    console.error('❌ Failed to delete replies:', repliesError)
  } else {
    console.log('✅ Deleted Round 2 replies')
  }

  console.log('\n✅ Round 2 cleanup completed!')
}

cleanRound2()
