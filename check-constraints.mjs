import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🔍 Checking Constraints\n')

// Check actual claim_votes columns
console.log('=== claim_votes columns ===')
const { data: existingVote } = await supabase
  .from('claim_votes')
  .select('*')
  .limit(1)

// Try to get schema info by attempting insert with null values
const { error: voteSchemaError } = await supabase
  .from('claim_votes')
  .insert({})
  .select()

console.log('Schema hint from error:', voteSchemaError?.message || 'No error')

// Check if we can find any existing data
const { data: allVotes } = await supabase
  .from('claim_votes')
  .select('*')

console.log('Total votes in DB:', allVotes?.length || 0)

// Check claim_arguments position values
console.log('\n=== claim_arguments existing data ===')
const { data: existingArgs } = await supabase
  .from('claim_arguments')
  .select('position')
  .limit(5)

if (existingArgs && existingArgs.length > 0) {
  console.log('Existing position values:', [...new Set(existingArgs.map(a => a.position))])
} else {
  console.log('No existing arguments to check')
}

// Try inserting with different position values
const testPositions = [true, false, 'support', 'oppose', 'TRUE', 'FALSE']
console.log('\nTesting position values:')
for (const pos of testPositions) {
  const { error } = await supabase
    .from('claim_arguments')
    .insert({
      claim_id: '00000000-0000-0000-0000-000000000000', // Fake ID to test constraint
      author_id: '00000000-0000-0000-0000-000000000000',
      position: pos,
      content: 'test'
    })
  
  if (error && !error.message.includes('foreign key')) {
    console.log(`  ${pos}: ${error.message.substring(0, 80)}`)
  } else if (!error.message?.includes('foreign key')) {
    console.log(`  ${pos}: ✅ Would work (stopped by FK)`)
  }
}

process.exit(0)
