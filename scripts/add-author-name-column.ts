import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function addAuthorNameColumn() {
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
      WHERE table_name = 'arguments' AND column_name = 'author_name'
    `)

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column author_name already exists')
      return
    }

    // Add author_name column
    await client.query(`
      ALTER TABLE arguments
      ADD COLUMN author_name VARCHAR(100)
    `)

    console.log('✅ Added author_name column to arguments table')

    // Update existing rows to set author_name from agents table
    const updateResult = await client.query(`
      UPDATE arguments arg
      SET author_name = a.name
      FROM agents a
      WHERE arg.author_type = 'AI_AGENT'
        AND arg.author_id = a.id
        AND arg.author_name IS NULL
    `)

    console.log(`✅ Updated ${updateResult.rowCount} existing arguments with author names`)

    // Clear existing data to allow fresh test
    await client.query('DELETE FROM debate_rounds')
    await client.query('DELETE FROM agent_react_cycles')
    await client.query('DELETE FROM arguments')

    console.log('✅ Cleared existing test data for fresh run')

  } finally {
    await client.end()
  }
}

addAuthorNameColumn().catch(console.error)
