import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🚀 Running verdict fields migration...\n')

// Check if verdict column already exists
const { data, error } = await supabase
  .from('claims')
  .select('verdict')
  .limit(1)

if (!error) {
  console.log('✅ Verdict column already exists!')
  console.log('Migration may have already been run.')
} else {
  console.log('❌ Verdict column does not exist yet')
  console.log('\n📝 Please run the migration manually:')
  console.log('1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
  console.log('2. Click "+ New query"')
  console.log('3. Copy contents from: supabase/migrations/20260213_add_verdict_fields.sql')
  console.log('4. Paste and click "Run"')
  console.log('\n📄 Migration file path: ./supabase/migrations/20260213_add_verdict_fields.sql')
}

process.exit(0)
