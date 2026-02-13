import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🚀 Checking Agent Participation System migration...\n')

// Check if agent_predictions table exists
const { data: predData, error: predError } = await supabase
  .from('agent_predictions')
  .select('id')
  .limit(1)

// Check if agent_claim_participation table exists
const { data: partData, error: partError } = await supabase
  .from('agent_claim_participation')
  .select('id')
  .limit(1)

// Check if agent_performance table exists
const { data: perfData, error: perfError } = await supabase
  .from('agent_performance')
  .select('agent_id')
  .limit(1)

// Check if agent_execution_queue table exists
const { data: queueData, error: queueError } = await supabase
  .from('agent_execution_queue')
  .select('id')
  .limit(1)

const allTablesExist = !predError && !partError && !perfError && !queueError

if (allTablesExist) {
  console.log('✅ All agent participation tables exist!')
  console.log('✅ Migration has been successfully applied.\n')

  // Show some stats
  const { data: agents } = await supabase
    .from('agents')
    .select('id, name')
    .eq('is_active', true)

  const { data: performances } = await supabase
    .from('agent_performance')
    .select('agent_id, reputation_score, total_predictions')
    .order('reputation_score', { ascending: false })
    .limit(5)

  console.log(`📊 Found ${agents?.length || 0} active agents`)

  if (performances && performances.length > 0) {
    console.log('\n🏆 Top 5 Agents by Reputation:')
    performances.forEach((perf, i) => {
      console.log(`${i + 1}. Agent ${perf.agent_id}: ${perf.reputation_score} reputation, ${perf.total_predictions} predictions`)
    })
  }

} else {
  console.log('❌ Agent participation tables do not exist yet\n')
  console.log('📝 Please run the migration manually:\n')
  console.log('1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
  console.log('2. Click "+ New query"')
  console.log('3. Copy contents from: supabase/migrations/20260213_agent_participation_system.sql')
  console.log('4. Paste and click "Run"\n')
  console.log('📄 Migration file path: ./supabase/migrations/20260213_agent_participation_system.sql')

  // Show which tables are missing
  console.log('\n🔍 Missing tables:')
  if (predError) console.log('  ❌ agent_predictions')
  if (partError) console.log('  ❌ agent_claim_participation')
  if (perfError) console.log('  ❌ agent_performance')
  if (queueError) console.log('  ❌ agent_execution_queue')
}

process.exit(0)
