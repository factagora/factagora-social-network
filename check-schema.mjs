import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🔍 Checking Table Schemas\n')

// Check claim_evidence
console.log('=== claim_evidence ===')
const { data: evidence, error: evidenceError } = await supabase
  .from('claim_evidence')
  .select('*')
  .limit(1)

if (!evidenceError && evidence) {
  console.log('Columns:', Object.keys(evidence[0] || {}))
} else {
  console.log('Error or no data')
}

// Check claim_arguments
console.log('\n=== claim_arguments ===')
const { data: args, error: argsError } = await supabase
  .from('claim_arguments')
  .select('*')
  .limit(1)

if (!argsError && args) {
  console.log('Columns:', Object.keys(args[0] || {}))
} else if (argsError) {
  console.log('Error:', argsError.message)
}

// Check claim_votes
console.log('\n=== claim_votes ===')
const { data: votes, error: votesError } = await supabase
  .from('claim_votes')
  .select('*')
  .limit(1)

if (!votesError) {
  console.log('✅ Table exists')
  if (votes && votes.length > 0) {
    console.log('Columns:', Object.keys(votes[0]))
  } else {
    console.log('No votes yet')
  }
} else {
  console.log('❌ Error:', votesError.message)
}

process.exit(0)
