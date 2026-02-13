import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const testData = JSON.parse(readFileSync('/tmp/factagora-test-data.json', 'utf8'))

console.log('🤖 Testing Agent Actions (FIXED)\n')
console.log(`Agent: ${testData.agent.name}`)
console.log(`Claim: ${testData.claim.title.substring(0, 60)}...\n`)

// ============================================================================
// TEST 1: Agent submits evidence (FIXED column names)
// ============================================================================
console.log('=== Test 1: Agent Submits Evidence ===')

const evidenceData = {
  claim_id: testData.claim.id,
  submitted_by: testData.agent.user_id,
  url: 'https://ir.tesla.com/press-release/2025-q4-earnings',
  title: 'Tesla Q4 2025 Earnings Report',
  description: 'According to Tesla\'s official Q4 2025 earnings report, the company produced 1.85 million vehicles in 2025, slightly above the 1.8 million figure mentioned in the claim.',
  source_domain: 'ir.tesla.com',
  created_at: new Date().toISOString()
}

const { data: evidence, error: evidenceError } = await supabase
  .from('claim_evidence')
  .insert(evidenceData)
  .select()
  .single()

if (evidenceError) {
  console.log('❌ Error:', evidenceError.message)
} else {
  console.log('✅ Evidence submitted!')
  console.log(`   Evidence ID: ${evidence.id}`)
  console.log(`   Credibility score: ${evidence.credibility_score}/100`)
  
  // Record agent participation
  const { error: partError } = await supabase
    .from('agent_claim_participation')
    .insert({
      agent_id: testData.agent.id,
      claim_id: testData.claim.id,
      participation_type: 'EVIDENCE',
      content_id: evidence.id,
      reasoning: 'Official Tesla earnings report is a highly credible primary source',
      confidence_score: 0.9,
      submitted_at: new Date().toISOString()
    })
  
  if (!partError) {
    console.log('✅ Agent participation recorded')
  }
}

// ============================================================================
// TEST 2: Agent submits argument
// ============================================================================
console.log('\n=== Test 2: Agent Submits Argument ===')

const argumentData = {
  claim_id: testData.claim.id,
  author_id: testData.agent.user_id,
  position: 'support', // Use 'support' or 'oppose' instead of boolean
  content: 'Tesla\'s official earnings reports are publicly audited and verified by the SEC. The actual production figure of 1.85M is within a reasonable margin of the claimed 1.8M figure.',
  reasoning: 'Based on analysis of official Tesla documents and SEC filings',
  confidence: 0.85,
  created_at: new Date().toISOString()
}

const { data: argument, error: argumentError } = await supabase
  .from('claim_arguments')
  .insert(argumentData)
  .select()
  .single()

if (argumentError) {
  console.log('❌ Error:', argumentError.message)
} else {
  console.log('✅ Argument submitted!')
  console.log(`   Argument ID: ${argument.id}`)
  console.log(`   Position: ${argument.position}`)
  
  // Record agent participation
  await supabase
    .from('agent_claim_participation')
    .insert({
      agent_id: testData.agent.id,
      claim_id: testData.claim.id,
      participation_type: 'ARGUMENT',
      content_id: argument.id,
      reasoning: 'Comprehensive analysis of official sources',
      confidence_score: 0.85,
      submitted_at: new Date().toISOString()
    })
  
  console.log('✅ Agent participation recorded')
}

// ============================================================================
// TEST 3: Create a vote to test consensus
// ============================================================================
console.log('\n=== Test 3: Create Test Vote ===')

const { data: vote, error: voteError } = await supabase
  .from('claim_votes')
  .insert({
    claim_id: testData.claim.id,
    user_id: testData.agent.user_id,
    vote: 'true', // Vote TRUE
    created_at: new Date().toISOString()
  })
  .select()
  .single()

if (voteError) {
  console.log('⚠️  Vote error:', voteError.message)
} else {
  console.log('✅ Vote submitted!')
}

// ============================================================================
// TEST 4: Update agent performance
// ============================================================================
console.log('\n=== Test 4: Update Agent Performance ===')

const { data: perf } = await supabase
  .from('agent_performance')
  .upsert({
    agent_id: testData.agent.id,
    total_evidence_submitted: 1,
    total_arguments: 1,
    avg_evidence_quality: 0.9,
    avg_argument_quality: 0.85,
    reputation_score: 1025, // +25 points for good contribution
    last_claim_participation_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'agent_id'
  })
  .select()
  .single()

if (perf) {
  console.log('✅ Performance updated!')
  console.log(`   Reputation: ${perf.reputation_score} (+25)`)
  console.log(`   Evidence: ${perf.total_evidence_submitted}`)
  console.log(`   Arguments: ${perf.total_arguments}`)
}

// ============================================================================
// TEST 5: Check agent participation
// ============================================================================
console.log('\n=== Test 5: Check Agent Participation ===')

const { data: participation } = await supabase
  .from('agent_claim_participation')
  .select('*')
  .eq('agent_id', testData.agent.id)

console.log(`✅ Agent has ${participation?.length || 0} participation records`)

// ============================================================================
// TEST 6: Check leaderboard
// ============================================================================
console.log('\n=== Test 6: Check Leaderboard ===')

const { data: leaderboard } = await supabase
  .from('agent_performance')
  .select(`
    agent_id,
    reputation_score,
    total_evidence_submitted,
    total_arguments,
    agents (name)
  `)
  .order('reputation_score', { ascending: false })
  .limit(5)

if (leaderboard && leaderboard.length > 0) {
  console.log('🏆 Top Agents:')
  leaderboard.forEach((entry, i) => {
    console.log(`   ${i + 1}. ${entry.agents?.name || 'Unknown'}`)
    console.log(`      Reputation: ${entry.reputation_score}`)
    console.log(`      Contributions: ${entry.total_evidence_submitted} evidence, ${entry.total_arguments} args`)
  })
}

console.log('\n🎉 All tests completed successfully!')
process.exit(0)
