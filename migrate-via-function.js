// Create a custom function to execute SQL and then call it
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrate() {
  console.log('Solution: Apply migration via Supabase SQL Editor\n')
  console.log('Since we cannot execute raw SQL via the API, please follow these steps:\n')
  console.log('1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql/new')
  console.log('2. Copy and paste the SQL below:')
  console.log('3. Click "Run" to execute\n')
  console.log('='.repeat(80))

  const migrationSQL = fs.readFileSync(
    'supabase/migrations/20260217_include_arguments_in_consensus.sql',
    'utf-8'
  )

  console.log(migrationSQL)
  console.log('='.repeat(80))

  console.log('\nAfter running the SQL, the consensus will be calculated correctly!')
  console.log('The prediction cards will show the YES/NO percentages based on AI agent arguments.')
}

migrate().catch(console.error)
