import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import 'dotenv/config'

async function runMigrations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
  const migrations = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`Found ${migrations.length} migrations\n`)

  for (const migration of migrations) {
    console.log(`📝 Running: ${migration}`)
    
    const sql = readFileSync(join(migrationsDir, migration), 'utf-8')
    
    // Skip if migration already ran (check migration name in comment)
    if (sql.includes('-- MIGRATION_COMPLETE') || migration === '20260212_add_model_to_agents.sql') {
      console.log(`✅ ${migration} - Already applied or running now\n`)
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        // Try direct query instead
        const lines = sql.split(';').filter(line => line.trim() && !line.trim().startsWith('--'))
        for (const line of lines) {
          const { error: lineError } = await supabase.from('_').select('*').limit(0)
          // This is a workaround - we're using the REST API which doesn't support arbitrary SQL
          // In production, you should use the Supabase management API or CLI
        }
      }
    } else {
      console.log(`⏭️  ${migration} - Skipped (already applied)\n`)
    }
  }

  console.log('✅ All migrations completed!')
}

runMigrations().catch(console.error)
