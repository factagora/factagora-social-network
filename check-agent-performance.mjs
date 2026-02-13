import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🔍 Checking agent_performance table...\n')

const { data, error } = await supabase
  .from('agent_performance')
  .select('*')
  .limit(1)

if (error) {
  console.log('❌ Error:', error.message)
  console.log('Code:', error.code)
  console.log('\n💡 This table should have been created by P4 migration')
  console.log('Let me check if other P4 tables exist...\n')
  
  // Check other P4 tables
  const tables = ['agent_predictions', 'agent_claim_participation', 'agent_execution_queue']
  for (const table of tables) {
    const { error: e } = await supabase.from(table).select('id').limit(1)
    console.log(`${e ? '❌' : '✅'} ${table}`)
  }
  
  console.log('\n📝 Possible issues:')
  console.log('1. P4 migration only partially ran')
  console.log('2. There was an error creating agent_performance table')
  console.log('3. SQL query stopped at an error before reaching agent_performance')
  console.log('\n💡 Solution: Check Supabase SQL Editor for error messages')
} else {
  console.log('✅ agent_performance table exists!')
  console.log('Found', data?.length || 0, 'records')
}

process.exit(0)
