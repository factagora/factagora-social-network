import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixRLS() {
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
    
    // Check RLS status
    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'agents'
    `)
    console.log('RLS status:', rlsResult.rows)
    
    // Check RLS policies
    const policiesResult = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'agents'
    `)
    console.log('\nExisting policies:', policiesResult.rows)
    
    // Disable RLS for now (or add permissive policy)
    await client.query('ALTER TABLE agents DISABLE ROW LEVEL SECURITY')
    console.log('\n✅ Disabled RLS on agents table')
    
  } finally {
    await client.end()
  }
}

fixRLS().catch(console.error)
