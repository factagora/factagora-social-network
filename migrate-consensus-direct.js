// Direct PostgreSQL migration using pg client
require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const fs = require('fs')

// Build Supabase connection string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const dbPassword = process.env.SUPABASE_DB_PASSWORD

if (!supabaseUrl || !dbPassword) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD')
  process.exit(1)
}

// Extract project ref from URL (e.g., https://PROJECT_REF.supabase.co)
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Could not extract project ref from Supabase URL')
  process.exit(1)
}

const connString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`
console.log(`Using connection: postgresql://postgres:***@db.${projectRef}.supabase.co:5432/postgres`)

async function migrateDirect() {
  const client = new Client({ connectionString: connString })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('✅ Connected\n')

    // Read migration file
    const migrationSQL = fs.readFileSync(
      'supabase/migrations/20260217_include_arguments_in_consensus.sql',
      'utf-8'
    )

    // Execute migration
    console.log('Executing migration...\n')
    await client.query(migrationSQL)
    console.log('✅ Migration executed\n')

    // Verify the view
    console.log('=== Verifying view ===')
    const result = await client.query(`
      SELECT *
      FROM prediction_consensus
      WHERE prediction_id = '6fe4477f-4408-4869-bd18-c2b0e8a9adad'
    `)

    if (result.rows.length > 0) {
      const row = result.rows[0]
      console.log('✅ Consensus found!')
      console.log(`  Total votes: ${row.total_votes}`)
      console.log(`  AI votes: ${row.ai_votes}`)
      console.log(`  YES: ${row.yes_votes}, NO: ${row.no_votes}, NEUTRAL: ${row.neutral_votes}`)
      console.log(`  Consensus YES: ${(row.consensus_yes_pct * 100).toFixed(1)}%`)
      console.log(`  AI Consensus YES: ${(row.ai_consensus_yes_pct * 100).toFixed(1)}%`)
    } else {
      console.log('⚠️  No consensus data found for this prediction')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.detail) console.error('Detail:', error.detail)
    if (error.hint) console.error('Hint:', error.hint)
  } finally {
    await client.end()
  }
}

migrateDirect().catch(console.error)
