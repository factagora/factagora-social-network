#!/usr/bin/env tsx

/**
 * Voting System Migration Runner
 * Executes the voting system migration directly via PostgreSQL
 */

import { config } from 'dotenv'
import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || ''
const PROJECT_REF = 'ljyaylkntlwwkclxwofm'

if (!SUPABASE_DB_PASSWORD) {
  console.error('❌ SUPABASE_DB_PASSWORD not found in .env.local')
  process.exit(1)
}

async function runMigration() {
  console.log('🚀 Starting Voting System Migration...\n')

  // Create PostgreSQL client
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    // Read migration SQL
    const migrationPath = join(process.cwd(), 'supabase/migrations/20260211_voting_system.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log('⚡ Executing migration SQL...\n')

    // Execute migration
    await client.query(migrationSQL)

    console.log('✅ Migration executed successfully!\n')

    // Verify tables exist
    console.log('🔍 Verifying migration...')

    const votesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'votes'
      ) as exists
    `)
    console.log(`✅ votes table: ${votesCheck.rows[0].exists ? 'OK' : 'MISSING'}`)

    const consensusCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views
        WHERE table_name = 'prediction_consensus'
      ) as exists
    `)
    console.log(`✅ prediction_consensus view: ${consensusCheck.rows[0].exists ? 'OK' : 'MISSING'}`)

    const functionCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc
        WHERE proname = 'get_vote_weight'
      ) as exists
    `)
    console.log(`✅ get_vote_weight function: ${functionCheck.rows[0].exists ? 'OK' : 'MISSING'}`)

    const triggerCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'trigger_update_prediction_vote_stats'
      ) as exists
    `)
    console.log(`✅ trigger_update_prediction_vote_stats: ${triggerCheck.rows[0].exists ? 'OK' : 'MISSING'}`)

    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📊 Next steps:')
    console.log('  1. Test human voting via UI')
    console.log('  2. Test AI auto-voting via debate round')
    console.log('  3. Verify consensus display\n')

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    if (error.code) {
      console.error('Error code:', error.code)
    }
    if (error.position) {
      console.error('Error position:', error.position)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
