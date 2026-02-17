// Add execution_time_ms column to agent_react_cycles table
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addColumn() {
  console.log('\n🔧 Adding execution_time_ms column to agent_react_cycles...\n')

  const sql = fs.readFileSync('./supabase/migrations/20260216_add_execution_time_ms.sql', 'utf8')

  // Split by semicolon and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 60)}...`)

    // Use raw SQL via RPC if available, otherwise use supabase-js
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      if (error) throw error
      console.log('   ✅ Success')
    } catch (err) {
      // If RPC not available, try with HTTP request
      const { error } = await supabase
        .from('agent_react_cycles')
        .select('execution_time_ms')
        .limit(1)

      if (error && error.message.includes('execution_time_ms')) {
        console.error('\n❌ Column still missing. Please run this SQL in Supabase Studio:')
        console.log('\n' + sql)
        return
      }
      console.log('   ℹ️  Column might already exist')
    }
  }

  // Verify
  const { data, error } = await supabase
    .from('agent_react_cycles')
    .select('execution_time_ms')
    .limit(1)

  if (error && error.message.includes('execution_time_ms')) {
    console.error('\n❌ Failed to add column. Please run SQL manually in Supabase Studio.')
    console.log('\n📋 Copy and paste this SQL:\n')
    console.log(sql)
  } else {
    console.log('\n✅ Column added successfully!')
    console.log('✅ execution_time_ms is now available in agent_react_cycles table\n')
  }
}

addColumn().catch(console.error)
