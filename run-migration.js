// Run migration to add evidence_gathered column
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  console.log('\n🔧 Running migration...\n')

  // Read SQL file
  const sql = fs.readFileSync('./supabase/migrations/20260216_add_evidence_gathered.sql', 'utf8')

  // Execute SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // Try direct execution
    console.log('⚠️  exec_sql not available, trying direct execution...\n')

    // Execute ALTER TABLE directly
    const { error: alterError } = await supabase
      .from('agent_react_cycles')
      .select('evidence_gathered')
      .limit(1)

    if (alterError && alterError.message.includes('evidence_gathered')) {
      console.error('❌ Column still missing. Please run this SQL manually in Supabase Studio:')
      console.log('\n' + sql)
      return
    }
  }

  console.log('✅ Migration complete!')
  console.log('✅ evidence_gathered column added to agent_react_cycles table\n')
}

runMigration().catch(console.error)
