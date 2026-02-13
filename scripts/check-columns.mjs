import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'
)

console.log('🔍 Checking claims table structure...\n')

// Try to get schema information
const { data, error } = await supabase
  .from('claims')
  .select('*')
  .limit(1)

if (error) {
  console.log('❌ Error:', error.message)
} else if (data && data.length > 0) {
  console.log('✅ Claims table columns:')
  console.log(Object.keys(data[0]).sort())
  
  const hasNewColumns = 'verdict' in data[0] && 'claimed_by' in data[0]
  console.log('\n📊 Status:', hasNewColumns ? '✅ New columns exist!' : '❌ New columns missing')
} else {
  console.log('ℹ️  No data in claims table')
}
