import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function cleanAllDebateData() {
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

    console.log('🧹 Cleaning all debate data...\n')

    // Delete in correct order (child tables first)
    const tables = [
      'argument_quality',
      'agent_react_cycles',
      'argument_replies',
      'debate_rounds',
      'arguments'
    ]

    for (const table of tables) {
      const result = await client.query(`DELETE FROM ${table}`)
      console.log(`  ✅ Deleted ${result.rowCount} rows from ${table}`)
    }

    // Verify deletion
    console.log('\n📊 Verification:')
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`)
      console.log(`  - ${table}: ${result.rows[0].count} rows remaining`)
    }

    console.log('\n✨ All debate data cleaned!')

  } finally {
    await client.end()
  }
}

cleanAllDebateData().catch(console.error)
