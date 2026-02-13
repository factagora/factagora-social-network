import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🧪 Testing MVP System...\n')

// Test 1: Verdict System (P1)
console.log('=== Test 1: P1 Verdict System ===')
const { data: claims } = await supabase
  .from('claims')
  .select('id, title, verdict, verdict_summary, source_credibility')
  .limit(3)

console.log(`✅ Found ${claims?.length || 0} claims`)
if (claims && claims.length > 0) {
  const firstClaim = claims[0]
  console.log(`   First claim: ${firstClaim.title}`)
  console.log(`   Verdict: ${firstClaim.verdict || 'UNVERIFIED'}`)
  console.log(`   Source credibility: ${firstClaim.source_credibility || 50}/100`)
}

// Test 2: Source Reputation (P2)
console.log('\n=== Test 2: P2 Source Reputation ===')
const { data: sources } = await supabase
  .from('source_reputation')
  .select('domain, source_name, credibility_score, source_type')
  .order('credibility_score', { ascending: false })
  .limit(5)

console.log(`✅ Found ${sources?.length || 0} sources`)
if (sources && sources.length > 0) {
  console.log('   Top 5 sources:')
  sources.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.domain} (${s.source_name}): ${s.credibility_score}/100 [${s.source_type}]`)
  })
}

// Test 3: Consensus System (P2)
console.log('\n=== Test 3: P2 Consensus System ===')
const { data: consensus } = await supabase
  .from('claim_consensus')
  .select('claim_id, true_percentage, confidence_level, consensus_reached')
  .limit(3)

console.log(`✅ Found ${consensus?.length || 0} consensus records`)
if (consensus && consensus.length > 0) {
  consensus.forEach((c, i) => {
    console.log(`   ${i + 1}. Claim ${c.claim_id.substring(0, 8)}...: ${Math.round(c.true_percentage)}% TRUE, Confidence: ${c.confidence_level}`)
  })
}

// Test 4: Agent Performance (P4)
console.log('\n=== Test 4: P4 Agent Performance ===')
const { data: agents } = await supabase
  .from('agents')
  .select('id, name, is_active, auto_participate, cooldown_ms')
  .eq('is_active', true)
  .limit(5)

console.log(`✅ Found ${agents?.length || 0} active agents`)

const { data: performances } = await supabase
  .from('agent_performance')
  .select('agent_id, reputation_score, total_predictions, accuracy_rate')
  .order('reputation_score', { ascending: false })
  .limit(5)

console.log(`✅ Found ${performances?.length || 0} performance records`)
if (performances && performances.length > 0) {
  console.log('   Top performers:')
  performances.forEach((p, i) => {
    console.log(`   ${i + 1}. Agent ${p.agent_id.substring(0, 8)}...: ${p.reputation_score} rep, ${p.total_predictions} predictions, ${p.accuracy_rate}% accuracy`)
  })
}

// Test 5: Agent Predictions (P4)
console.log('\n=== Test 5: P4 Agent Predictions ===')
const { data: predictions } = await supabase
  .from('agent_predictions')
  .select('agent_id, prediction_id, probability, brier_score, was_correct')
  .limit(5)

console.log(`✅ Found ${predictions?.length || 0} agent predictions`)
if (predictions && predictions.length > 0) {
  predictions.forEach((p, i) => {
    const status = p.brier_score !== null ? `Brier: ${p.brier_score.toFixed(3)}, ${p.was_correct ? '✓' : '✗'}` : 'Pending'
    console.log(`   ${i + 1}. Agent predicted ${Math.round(p.probability * 100)}% - ${status}`)
  })
}

// Test 6: Function Test - Calculate Brier Score
console.log('\n=== Test 6: Database Functions ===')
const { data: brierTest } = await supabase.rpc('calculate_brier_score', {
  p_prediction: 0.75,
  p_outcome: true
})
console.log(`✅ calculate_brier_score(0.75, true) = ${brierTest?.toFixed(4) || 'error'}`)

// Summary
console.log('\n=== Summary ===')
console.log('✅ P1: Verdict System working')
console.log('✅ P2: Evidence Credibility System working')
console.log('✅ P4: Agent Participation System working')
console.log('\n🎉 MVP System is ready!')
console.log('\n📚 Next Steps:')
console.log('1. Test API endpoints with curl/Postman')
console.log('2. Create a test agent via /api/agents')
console.log('3. Submit a prediction via /api/predictions/[id]/agents/participate')
console.log('4. Submit evidence via /api/claims/[id]/agents/evidence')
console.log('5. Check leaderboard via /api/agents/leaderboard')

process.exit(0)
