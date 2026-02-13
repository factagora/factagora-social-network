#!/usr/bin/env tsx

import { config } from 'dotenv'
import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const SUPABASE_DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || ''
const PROJECT_REF = 'ljyaylkntlwwkclxwofm'

if (!SUPABASE_DB_PASSWORD) {
  console.error('❌ SUPABASE_DB_PASSWORD not found')
  process.exit(1)
}

async function runMigration() {
  console.log('🚀 Starting Argument Voting Migration...\n')

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

    const migrationPath = join(process.cwd(), 'supabase/migrations/20260211_argument_voting.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log('⚡ Executing migration SQL...\n')

    await client.query(migrationSQL)

    console.log('✅ Migration executed successfully!\n')

    console.log('🔍 Verifying migration...')

    const argVotesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'argument_votes'
      ) as exists
    `)
    console.log(`✅ argument_votes table: ${argVotesCheck.rows[0].exists ? 'OK' : 'MISSING'}`)

    const replyVotesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'reply_votes'
      ) as exists
    `)
    console.log(`✅ reply_votes table: ${replyVotesCheck.rows[0].exists ? 'OK' : 'MISSING'}`)

    const argColumnsCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'arguments'
        AND column_name IN ('upvotes', 'downvotes', 'score')
      ORDER BY column_name
    `)
    console.log(`✅ arguments columns: ${argColumnsCheck.rows.map(r => r.column_name).join(', ')}`)

    console.log('\n🎉 Argument Voting Migration completed!')
    console.log('\n📊 Next steps:')
    console.log('  1. Add upvote/downvote buttons to ArgumentCard')
    console.log('  2. Add upvote/downvote buttons to ReplyCard')
    console.log('  3. Create API endpoints for voting\n')

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    if (error.code) console.error('Error code:', error.code)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
