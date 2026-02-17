// Manually apply the consensus migration
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  const migrationSQL = fs.readFileSync(
    'supabase/migrations/20260217_include_arguments_in_consensus.sql',
    'utf-8'
  )

  console.log('Applying migration to include arguments in consensus...\n')
  console.log(migrationSQL)
  console.log('\n\n')

  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: migrationSQL
  })

  if (error) {
    console.error('❌ Migration failed:', error)
    console.log('\nTrying alternative method...')

    // Try without the exec_sql wrapper
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.includes('COMMENT ON')) continue // Skip comments

      console.log(`\nExecuting: ${statement.substring(0, 100)}...`)
      const { error: stmtError } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      })

      if (stmtError) {
        console.error(`Error: ${stmtError.message}`)
      } else {
        console.log('✅ Success')
      }
    }
  } else {
    console.log('✅ Migration applied successfully')
  }

  // Verify the view
  console.log('\n=== Verifying view ===')
  const { data: consensus, error: verifyError } = await supabase
    .from('prediction_consensus')
    .select('*')
    .eq('prediction_id', '6fe4477f-4408-4869-bd18-c2b0e8a9adad')
    .maybeSingle()

  if (verifyError) {
    console.error('Error verifying:', verifyError)
  } else if (consensus) {
    console.log('✅ Consensus found!')
    console.log(`  Total votes: ${consensus.total_votes}`)
    console.log(`  AI votes: ${consensus.ai_votes}`)
    console.log(`  YES: ${consensus.yes_votes}, NO: ${consensus.no_votes}`)
    console.log(`  Consensus YES: ${(consensus.consensus_yes_pct * 100).toFixed(1)}%`)
  } else {
    console.log('⚠️  No consensus data yet')
  }
}

applyMigration().catch(console.error)
