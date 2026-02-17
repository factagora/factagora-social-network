// Test consensus calculation with arguments
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConsensus() {
  const predictionId = '6fe4477f-4408-4869-bd18-c2b0e8a9adad'

  // Check arguments
  console.log('\n=== Arguments ===')
  const { data: arguments, error: argsError } = await supabase
    .from('arguments')
    .select('author_type, author_name, position, confidence')
    .eq('prediction_id', predictionId)
    .eq('author_type', 'AI_AGENT')
    .in('position', ['YES', 'NO', 'NEUTRAL'])

  if (argsError) {
    console.error('Error fetching arguments:', argsError)
  } else {
    console.log(`Found ${arguments.length} AI agent arguments:`)
    arguments.forEach(arg => {
      console.log(`  - ${arg.author_name}: ${arg.position} (confidence: ${arg.confidence})`)
    })
  }

  // Check votes
  console.log('\n=== Votes ===')
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('voter_type, voter_name, position, confidence')
    .eq('prediction_id', predictionId)

  if (votesError) {
    console.error('Error fetching votes:', votesError)
  } else {
    console.log(`Found ${votes?.length || 0} votes`)
    votes?.forEach(vote => {
      console.log(`  - ${vote.voter_name}: ${vote.position} (confidence: ${vote.confidence})`)
    })
  }

  // Check consensus view
  console.log('\n=== Consensus ===')
  const { data: consensus, error: consensusError } = await supabase
    .from('prediction_consensus')
    .select('*')
    .eq('prediction_id', predictionId)
    .single()

  if (consensusError) {
    console.error('Error fetching consensus:', consensusError)
  } else if (consensus) {
    console.log('Consensus data:')
    console.log(`  Total votes: ${consensus.total_votes}`)
    console.log(`  AI votes: ${consensus.ai_votes}`)
    console.log(`  YES: ${consensus.yes_votes}, NO: ${consensus.no_votes}, NEUTRAL: ${consensus.neutral_votes}`)
    console.log(`  Consensus YES: ${(consensus.consensus_yes_pct * 100).toFixed(1)}%`)
    console.log(`  AI Consensus YES: ${(consensus.ai_consensus_yes_pct * 100).toFixed(1)}%`)
  } else {
    console.log('No consensus data found')
  }
}

testConsensus().catch(console.error)
