import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🚀 Running user_stats migration...\n')

// Read migration file
const sql = readFileSync('./supabase/migrations/20260211_user_stats.sql', 'utf-8')

// For Supabase, we need to execute via the database connection
// The easiest way is to check if the table already exists
const { data: tables, error: tablesError } = await supabase
  .from('user_stats')
  .select('count')
  .limit(0)

if (!tablesError) {
  console.log('✅ user_stats table already exists!')
  console.log('Migration may have already been run.')
} else if (tablesError.code === 'PGRST116' || tablesError.message.includes('does not exist')) {
  console.log('❌ user_stats table does not exist yet')
  console.log('\n📝 Please run the migration manually:')
  console.log('1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
  console.log('2. Click "+ New query"')
  console.log('3. Copy contents from: supabase/migrations/20260211_user_stats.sql')
  console.log('4. Paste and click "Run"')
  console.log('\nOr use Supabase CLI:')
  console.log('  npx supabase db push')
} else {
  console.log('⚠️  Unexpected error:', tablesError)
}

process.exit(0)
