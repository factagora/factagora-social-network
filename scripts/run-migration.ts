import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function runMigration() {
  console.log('🚀 Applying database migration...\n')

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
    console.log('✅ Connected to database\n')

    const migrationPath = resolve(process.cwd(), 'supabase/migrations/20260210_multi_agent_system.sql')
    let migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Remove sample data section (lines 397-487)
    const sampleDataStart = migrationSQL.indexOf('-- SAMPLE DATA FOR TESTING')
    const commentsStart = migrationSQL.indexOf('-- COMMENTS')
    
    if (sampleDataStart !== -1 && commentsStart !== -1) {
      migrationSQL = migrationSQL.substring(0, sampleDataStart) + 
                     migrationSQL.substring(commentsStart)
      console.log('📝 Removed sample data section from migration\n')
    }

    console.log('📝 Executing migration SQL...\n')

    await client.query(migrationSQL)
    console.log('✅ Migration applied successfully!\n')
    return true
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.error('Details:', error.detail)
    return false
  } finally {
    await client.end()
  }
}

runMigration().catch(console.error)
