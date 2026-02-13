import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDebateData() {
  console.log('🔍 Checking database for AI agent debate data...\n')

  // Check predictions
  const { data: predictions, error: predError } = await supabase
    .from('predictions')
    .select('id, title, created_at')
    .limit(10)

  if (predError) {
    console.error('❌ Error fetching predictions:', predError)
    return
  }

  console.log(`📊 Found ${predictions?.length || 0} predictions`)
  if (predictions && predictions.length > 0) {
    predictions.forEach(p => {
      console.log(`   - ${p.title} (ID: ${p.id})`)
    })
  }
  console.log()

  // Check arguments
  const { data: aiArguments, error: argError } = await supabase
    .from('arguments')
    .select('id, prediction_id, author_type, author_name, position, confidence, created_at')
    .eq('author_type', 'AI_AGENT')

  if (argError) {
    console.error('❌ Error fetching arguments:', argError)
    return
  }

  console.log(`🤖 Found ${aiArguments?.length || 0} AI agent arguments`)
  if (aiArguments && aiArguments.length > 0) {
    aiArguments.forEach(arg => {
      console.log(`   - ${arg.author_name}: ${arg.position} (${arg.confidence}% confidence)`)
      console.log(`     Prediction ID: ${arg.prediction_id}`)
    })
  }
  console.log()

  // Check debate rounds
  const { data: rounds, error: roundError } = await supabase
    .from('debate_rounds')
    .select('id, prediction_id, round_number, is_final, created_at')

  if (roundError) {
    console.error('❌ Error fetching debate rounds:', roundError)
    return
  }

  console.log(`🔄 Found ${rounds?.length || 0} debate rounds`)
  if (rounds && rounds.length > 0) {
    rounds.forEach(round => {
      console.log(`   - Round ${round.round_number} for prediction ${round.prediction_id} ${round.is_final ? '(FINAL)' : ''}`)
    })
  }
  console.log()

  // Check react cycles
  const { data: cycles, error: cycleError } = await supabase
    .from('agent_react_cycles')
    .select('id, argument_id, stage, created_at')

  if (cycleError) {
    console.error('❌ Error fetching react cycles:', cycleError)
    return
  }

  console.log(`💭 Found ${cycles?.length || 0} ReAct cycle entries`)
  console.log()

  // Summary
  console.log('=' .repeat(60))
  console.log('📋 Summary:')
  console.log(`   Predictions: ${predictions?.length || 0}`)
  console.log(`   AI Arguments: ${aiArguments?.length || 0}`)
  console.log(`   Debate Rounds: ${rounds?.length || 0}`)
  console.log(`   ReAct Cycles: ${cycles?.length || 0}`)

  if (aiArguments && aiArguments.length > 0) {
    const predictionIds = [...new Set(aiArguments.map(a => a.prediction_id))]
    console.log('\n🎯 Predictions with AI debates:')
    predictionIds.forEach(id => {
      const pred = predictions?.find(p => p.id === id)
      if (pred) {
        console.log(`   - ${pred.title}`)
        console.log(`     URL: http://localhost:3000/predictions/${id}`)
      }
    })
  } else {
    console.log('\n⚠️  No AI agent arguments found in database.')
    console.log('   Run the worker to generate debate data:')
    console.log('   cd factagora-agent-worker && npm run worker')
  }
  console.log('=' .repeat(60))
}

checkDebateData()
