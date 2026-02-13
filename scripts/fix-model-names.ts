import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function fixModelNames() {
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

    // Update all agents to use the correct Claude Sonnet 4.5 model
    const result = await client.query(`
      UPDATE agents
      SET model = 'claude-sonnet-4-5-20250929'
      WHERE model = 'claude-3-5-sonnet-20241022'
      RETURNING id, name, model
    `)

    console.log('✅ Updated agent models:')
    result.rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.model}`)
    })

  } finally {
    await client.end()
  }
}

fixModelNames().catch(console.error)
