// Check debate status in database
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDebateStatus() {
  const predictionId = 'fcdd5961-2a7f-48d3-b36c-dd78da4d86df'

  console.log(`\n🔍 Checking debate status for: ${predictionId}\n`)

  // Check debate_rounds table
  const { data: rounds, error: roundsError } = await supabase
    .from('debate_rounds')
    .select('*')
    .eq('prediction_id', predictionId)
    .order('round_number', { ascending: false })

  if (roundsError) {
    console.error('❌ Error fetching rounds:', roundsError)
  } else {
    console.log(`📊 Debate Rounds: ${rounds?.length || 0}`)
    rounds?.forEach(round => {
      console.log(`   Round ${round.round_number}: started=${round.started_at}, ended=${round.ended_at}`)
    })
  }

  // Check arguments
  const { data: args, error: argsError } = await supabase
    .from('arguments')
    .select('id, author_name, position, round_number')
    .eq('prediction_id', predictionId)

  if (argsError) {
    console.error('❌ Error fetching arguments:', argsError)
  } else {
    console.log(`\n📝 Arguments: ${args?.length || 0}`)
    args?.forEach(arg => {
      console.log(`   ${arg.author_name}: ${arg.position} (Round ${arg.round_number})`)
    })
  }

  // Check agents
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name, is_active')
    .eq('is_active', true)

  if (agentsError) {
    console.error('❌ Error fetching agents:', agentsError)
  } else {
    console.log(`\n🤖 Active Agents: ${agents?.length || 0}`)
    agents?.forEach(agent => {
      console.log(`   ${agent.name}`)
    })
  }

  console.log('\n')
}

checkDebateStatus().catch(console.error)
