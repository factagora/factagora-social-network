import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🚀 Checking All Migrations Status...\n')

// P1: Verdict System
console.log('=== P1: Verdict System ===')
const { data: p1Data, error: p1Error } = await supabase
  .from('claims')
  .select('verdict')
  .limit(1)

if (!p1Error) {
  console.log('✅ P1: Verdict fields exist')
} else {
  console.log('❌ P1: Verdict fields missing')
}

// P2: Evidence Credibility System
console.log('\n=== P2: Evidence Credibility System ===')
const tables = ['source_reputation', 'fact_checker_reputation', 'claim_consensus', 'google_factcheck_cache']
let p2Complete = true

for (const table of tables) {
  const { error } = await supabase.from(table).select('id').limit(1)
  if (error) {
    console.log(`❌ ${table}`)
    p2Complete = false
  } else {
    console.log(`✅ ${table}`)
  }
}

if (p2Complete) {
  const { data: sources } = await supabase
    .from('source_reputation')
    .select('domain, credibility_score')
    .order('credibility_score', { ascending: false })
    .limit(3)
  
  if (sources && sources.length > 0) {
    console.log('\n📊 Top 3 Seeded Sources:')
    sources.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.domain}: ${s.credibility_score}/100`)
    })
  }
}

// P4: Agent Participation System
console.log('\n=== P4: Agent Participation System ===')
const agentTables = [
  { name: 'agent_predictions', pk: 'id' },
  { name: 'agent_claim_participation', pk: 'id' },
  { name: 'agent_performance', pk: 'agent_id' },  // FIXED: Uses agent_id, not id
  { name: 'agent_execution_queue', pk: 'id' }
]
let p4Complete = true

for (const table of agentTables) {
  const { error } = await supabase.from(table.name).select(table.pk).limit(1)
  if (error) {
    console.log(`❌ ${table.name}`)
    p4Complete = false
  } else {
    console.log(`✅ ${table.name}`)
  }
}

if (p4Complete) {
  const { data: perfRecords } = await supabase
    .from('agent_performance')
    .select('agent_id, reputation_score')
    .limit(5)
  
  console.log(`\n📊 Found ${perfRecords?.length || 0} agent performance records`)
  
  // Check if agents exist
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, is_active')
    .eq('is_active', true)
    .limit(5)
  
  console.log(`📊 Found ${agents?.length || 0} active agents`)
}

// Summary
console.log('\n=== Summary ===')
console.log(`P1: ${!p1Error ? '✅' : '❌'} Verdict System`)
console.log(`P2: ${p2Complete ? '✅' : '❌'} Evidence Credibility System`)
console.log(`P4: ${p4Complete ? '✅' : '❌'} Agent Participation System`)

if (!p1Error && p2Complete && p4Complete) {
  console.log('\n🎉 All migrations applied successfully!')
  console.log('Ready for testing! 🚀')
} else {
  console.log('\n⚠️  Some migrations still need to be applied')
  console.log('Follow the instructions above to apply missing migrations')
}

process.exit(0)
