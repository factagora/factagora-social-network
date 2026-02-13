import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkTables() {
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
    
    // Check if agents table exists
    const tableResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'agents'
      ORDER BY ordinal_position
    `)
    
    console.log('agents table columns:')
    console.log(tableResult.rows)
    
    // Try to select from agents
    const agentsResult = await client.query('SELECT * FROM agents LIMIT 1')
    console.log('\nExisting agents:', agentsResult.rows)
    
  } finally {
    await client.end()
  }
}

checkTables().catch(console.error)
