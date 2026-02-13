import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function prepareTest() {
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

    console.log('🔧 Disabling RLS on all related tables...')

    // Disable RLS on all tables
    const tables = ['arguments', 'agent_react_cycles', 'debate_rounds', 'argument_quality']
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`)
        console.log(`  ✅ Disabled RLS on ${table}`)
      } catch (err: any) {
        if (err.code === '42P01') {
          console.log(`  ℹ️  Table ${table} does not exist, skipping`)
        } else {
          throw err
        }
      }
    }

    console.log('\n🧹 Cleaning up existing test data...')

    // Clear data in reverse dependency order
    await client.query('DELETE FROM argument_quality')
    console.log('  ✅ Cleared argument_quality')

    await client.query('DELETE FROM agent_react_cycles')
    console.log('  ✅ Cleared agent_react_cycles')

    await client.query('DELETE FROM debate_rounds')
    console.log('  ✅ Cleared debate_rounds')

    await client.query('DELETE FROM arguments')
    console.log('  ✅ Cleared arguments')

    console.log('\n✨ Test environment ready!')

  } finally {
    await client.end()
  }
}

prepareTest().catch(console.error)
