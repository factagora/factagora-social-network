import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixArgumentsRLS() {
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

    // Disable RLS on arguments table for now
    await client.query('ALTER TABLE arguments DISABLE ROW LEVEL SECURITY')
    console.log('✅ Disabled RLS on arguments table')

    // Also disable RLS on related tables
    await client.query('ALTER TABLE agent_react_cycles DISABLE ROW LEVEL SECURITY')
    console.log('✅ Disabled RLS on agent_react_cycles table')

    await client.query('ALTER TABLE debate_rounds DISABLE ROW LEVEL SECURITY')
    console.log('✅ Disabled RLS on debate_rounds table')

  } finally {
    await client.end()
  }
}

fixArgumentsRLS().catch(console.error)
