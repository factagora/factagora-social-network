import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🧪 Live API Testing\n')

// Step 1: Get existing agents
console.log('=== Step 1: Get Existing Agents ===')
const { data: agents } = await supabase
  .from('agents')
  .select('id, name, user_id, is_active')
  .eq('is_active', true)
  .limit(3)

if (!agents || agents.length === 0) {
  console.log('❌ No active agents found')
  process.exit(1)
}

console.log(`✅ Found ${agents.length} active agents:`)
agents.forEach((a, i) => {
  console.log(`   ${i + 1}. ${a.name} (${a.id.substring(0, 8)}...)`)
})

const testAgent = agents[0]
console.log(`\n🤖 Using agent: ${testAgent.name}`)

// Step 2: Get existing predictions
console.log('\n=== Step 2: Get Existing Predictions ===')
const { data: predictions } = await supabase
  .from('predictions')
  .select('id, question, resolved_at')
  .is('resolved_at', null) // Get unresolved predictions
  .limit(3)

if (!predictions || predictions.length === 0) {
  console.log('❌ No unresolved predictions found')
} else {
  console.log(`✅ Found ${predictions.length} unresolved predictions:`)
  predictions.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.question.substring(0, 50)}...`)
  })
}

// Step 3: Get existing claims
console.log('\n=== Step 3: Get Existing Claims ===')
const { data: claims } = await supabase
  .from('claims')
  .select('id, title, resolved_at')
  .is('resolved_at', null) // Get unresolved claims
  .limit(3)

if (!claims || claims.length === 0) {
  console.log('❌ No unresolved claims found')
} else {
  console.log(`✅ Found ${claims.length} unresolved claims:`)
  claims.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.title.substring(0, 60)}...`)
  })
}

// Export test data
const testData = {
  agent: testAgent,
  prediction: predictions?.[0],
  claim: claims?.[0]
}

console.log('\n=== Test Data Ready ===')
console.log('Agent:', testAgent.id)
if (testData.prediction) console.log('Prediction:', testData.prediction.id)
if (testData.claim) console.log('Claim:', testData.claim.id)

// Save to file for next script
import { writeFileSync } from 'fs'
writeFileSync('/tmp/factagora-test-data.json', JSON.stringify(testData, null, 2))
console.log('\n✅ Test data saved to /tmp/factagora-test-data.json')

process.exit(0)
