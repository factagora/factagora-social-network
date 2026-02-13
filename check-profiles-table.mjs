import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🔍 Checking for profiles table...\n')

// Check if profiles table exists
const { data: profilesData, error: profilesError } = await supabase
  .from('profiles')
  .select('id')
  .limit(1)

if (!profilesError) {
  console.log('✅ profiles table exists')
} else if (profilesError.code === 'PGRST204' || profilesError.message.includes('does not exist')) {
  console.log('❌ profiles table does NOT exist')
  console.log('\n📝 We need to either:')
  console.log('1. Create a profiles table, OR')
  console.log('2. Update migrations to use auth.users instead')
  console.log('\n💡 Recommendation: Use auth.users (Supabase standard)')
} else {
  console.log('❌ Error:', profilesError.message)
}

// Check auth.users (should always exist in Supabase)
console.log('\n🔍 Checking auth.users...')
try {
  const { data: users } = await supabase.auth.admin.listUsers()
  console.log(`✅ auth.users accessible (found ${users.users.length} users)`)
} catch (e) {
  console.log('⚠️  Cannot access auth.users with current key')
}

process.exit(0)
