import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

// Load test data
const testData = JSON.parse(readFileSync('/tmp/factagora-test-data.json', 'utf8'))

console.log('🤖 Testing Agent Actions\n')
console.log(`Agent: ${testData.agent.name}`)
console.log(`Claim: ${testData.claim.title.substring(0, 60)}...\n`)

// ============================================================================
// TEST 1: Agent submits evidence
// ============================================================================
console.log('=== Test 1: Agent Submits Evidence ===')

const evidenceData = {
  claim_id: testData.claim.id,
  content: 'According to Tesla\'s official Q4 2025 earnings report, the company produced 1.85 million vehicles in 2025, slightly above the 1.8 million figure mentioned in the claim.',
  source_url: 'https://ir.tesla.com/press-release/2025-q4-earnings',
  source_domain: 'ir.tesla.com',
  supports_claim: true,
  created_by: testData.agent.user_id,
  created_at: new Date().toISOString()
}

const { data: evidence, error: evidenceError } = await supabase
  .from('claim_evidence')
  .insert(evidenceData)
  .select()
  .single()

if (evidenceError) {
  console.log('❌ Error submitting evidence:', evidenceError.message)
} else {
  console.log('✅ Evidence submitted!')
  console.log(`   Evidence ID: ${evidence.id}`)
  console.log(`   Credibility score: ${evidence.credibility_score}/100`)
  
  // Record agent participation
  await supabase
    .from('agent_claim_participation')
    .insert({
      agent_id: testAgent.agent.id,
      claim_id: testData.claim.id,
      participation_type: 'EVIDENCE',
      content_id: evidence.id,
      reasoning: 'Official Tesla earnings report is a highly credible primary source',
      confidence_score: 0.9,
      submitted_at: new Date().toISOString()
    })
  
  console.log('✅ Agent participation recorded')
}

// ============================================================================
// TEST 2: Agent submits argument
// ============================================================================
console.log('\n=== Test 2: Agent Submits Argument ===')

const argumentData = {
  claim_id: testData.claim.id,
  author_id: testData.agent.user_id,
  position: true, // Supporting TRUE
  content: 'Tesla\'s official earnings reports are publicly audited and verified by the SEC. The actual production figure of 1.85M is within a reasonable margin of the claimed 1.8M figure. This claim should be considered TRUE or MOSTLY TRUE.',
  created_at: new Date().toISOString()
}

const { data: argument, error: argumentError } = await supabase
  .from('claim_arguments')
  .insert(argumentData)
  .select()
  .single()

if (argumentError) {
  console.log('❌ Error submitting argument:', argumentError.message)
} else {
  console.log('✅ Argument submitted!')
  console.log(`   Argument ID: ${argument.id}`)
  console.log(`   Position: TRUE`)
  
  // Record agent participation
  await supabase
    .from('agent_claim_participation')
    .insert({
      agent_id: testData.agent.id,
      claim_id: testData.claim.id,
      participation_type: 'ARGUMENT',
      content_id: argument.id,
      reasoning: 'Based on analysis of official Tesla documents and SEC filings',
      confidence_score: 0.85,
      submitted_at: new Date().toISOString()
    })
  
  console.log('✅ Agent participation recorded')
}

// ============================================================================
// TEST 3: Update agent performance
// ============================================================================
console.log('\n=== Test 3: Update Agent Performance ===')

const { data: perf, error: perfError } = await supabase
  .from('agent_performance')
  .upsert({
    agent_id: testData.agent.id,
    total_evidence_submitted: 1,
    total_arguments: 1,
    avg_evidence_quality: 0.9,
    avg_argument_quality: 0.85,
    last_claim_participation_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'agent_id'
  })
  .select()
  .single()

if (perfError) {
  console.log('❌ Error updating performance:', perfError.message)
} else {
  console.log('✅ Performance updated!')
  console.log(`   Reputation: ${perf.reputation_score}`)
  console.log(`   Evidence submitted: ${perf.total_evidence_submitted}`)
  console.log(`   Arguments: ${perf.total_arguments}`)
}

// ============================================================================
// TEST 4: Check consensus
// ============================================================================
console.log('\n=== Test 4: Check Consensus ===')

// Trigger consensus update
const { error: consensusError } = await supabase
  .rpc('update_claim_consensus', { p_claim_id: testData.claim.id })

if (consensusError) {
  console.log('⚠️  Consensus update error:', consensusError.message)
} else {
  const { data: consensus } = await supabase
    .from('claim_consensus')
    .select('*')
    .eq('claim_id', testData.claim.id)
    .single()
  
  if (consensus) {
    console.log('✅ Consensus calculated!')
    console.log(`   TRUE: ${Math.round(consensus.true_percentage)}%`)
    console.log(`   Evidence score: ${Math.round(consensus.evidence_weighted_score)}`)
    console.log(`   Confidence: ${consensus.confidence_level}`)
  }
}

// ============================================================================
// TEST 5: Check leaderboard
// ============================================================================
console.log('\n=== Test 5: Check Leaderboard ===')

const { data: leaderboard } = await supabase
  .from('agent_performance')
  .select(`
    agent_id,
    reputation_score,
    total_predictions,
    total_evidence_submitted,
    total_arguments,
    agents (name)
  `)
  .order('reputation_score', { ascending: false })
  .limit(5)

if (leaderboard && leaderboard.length > 0) {
  console.log('🏆 Top Agents:')
  leaderboard.forEach((entry, i) => {
    console.log(`   ${i + 1}. ${entry.agents?.name || 'Unknown'}: ${entry.reputation_score} rep, ${entry.total_evidence_submitted} evidence, ${entry.total_arguments} args`)
  })
} else {
  console.log('📊 No agents on leaderboard yet')
}

console.log('\n🎉 All tests completed!')
process.exit(0)
