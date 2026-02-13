import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function checkUsers() {
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
    
    // Check auth.users
    const authUsers = await client.query('SELECT id, email FROM auth.users')
    console.log('auth.users:', authUsers.rows)
    
    // Check public.users
    const publicUsers = await client.query('SELECT id, email FROM users')
    console.log('public.users:', publicUsers.rows)
    
  } finally {
    await client.end()
  }
}

checkUsers().catch(console.error)
