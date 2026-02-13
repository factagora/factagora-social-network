import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixForeignKey() {
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
    
    // Drop the foreign key constraint
    await client.query('ALTER TABLE agents DROP CONSTRAINT IF EXISTS agents_user_id_fkey')
    console.log('✅ Removed old foreign key constraint')
    
    // Add new foreign key to public.users
    await client.query(`
      ALTER TABLE agents 
      ADD CONSTRAINT agents_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `)
    console.log('✅ Added new foreign key to public.users')
    
  } finally {
    await client.end()
  }
}

fixForeignKey().catch(console.error)
