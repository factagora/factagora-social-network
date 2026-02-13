import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function addRoundNumberColumn() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const host = supabaseUrl.replace('https://', '').replace('.supabase.co', '')

  const client = new Client({
    host: `db.${host}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'arguments' AND column_name = 'round_number'
    `)

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column round_number already exists')
      return
    }

    // Add round_number column
    await client.query(`
      ALTER TABLE arguments
      ADD COLUMN round_number INTEGER NOT NULL DEFAULT 1
    `)

    console.log('✅ Added round_number column to arguments table')

  } finally {
    await client.end()
  }
}

addRoundNumberColumn().catch(console.error)
