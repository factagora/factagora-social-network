#!/usr/bin/env node

import pg from 'pg'
import fs from 'fs'

const { Client } = pg

const client = new Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ljyaylkntlwwkclxwofm',
  password: '75yxhXBqXhsgCFRl',
  ssl: { rejectUnauthorized: false }
})

console.log('📦 Running migration...\n')

try {
  await client.connect()
  console.log('✅ Connected to database\n')

  const sql = fs.readFileSync('supabase/migrations/20260211_claims_factchecking_fields.sql', 'utf8')
  await client.query(sql)

  console.log('✅ Migration completed successfully\n')

  // Verify new columns exist
  const result = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'claims'
    AND column_name IN ('claimed_by', 'claim_date', 'verdict', 'verdict_summary', 'source_credibility')
    ORDER BY column_name
  `)

  console.log('📊 New columns added:')
  result.rows.forEach(row => {
    console.log(`   - ${row.column_name} (${row.data_type})`)
  })

} catch (err) {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
