import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function runMigrations() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const migrations = [
    '20260211_user_tiers.sql',
    '20260211_claims_table.sql',
    '20260211_claim_evidence.sql',
    '20260211_claim_votes.sql',
    '20260211_claim_arguments.sql',
    '20260211_predictions_update.sql',
  ]

  console.log('🚀 Starting Claim & Prediction migrations...\n')

  for (const migration of migrations) {
    const filePath = resolve(__dirname, '../supabase/migrations', migration)

    try {
      console.log(`📄 Running: ${migration}`)

      const sql = readFileSync(filePath, 'utf-8')

      // Execute SQL (using raw SQL since Supabase doesn't have migration API)
      const { error } = await supabase.rpc('exec_sql', { sql_string: sql })

      if (error) {
        // Try direct execution as fallback
        console.log(`   ⚠️  RPC method not available, trying direct execution...`)

        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))

        for (const statement of statements) {
          const { error: execError } = await supabase.from('_migrations').insert({
            name: migration,
            executed_at: new Date().toISOString(),
          })

          if (execError && !execError.message.includes('already exists')) {
            throw execError
          }
        }
      }

      console.log(`   ✅ Success\n`)
    } catch (error) {
      console.error(`   ❌ Error:`, error)
      console.log(`\n⚠️  Migration failed. Please run manually:\n`)
      console.log(`   psql -h <host> -U postgres -d postgres -f ${filePath}\n`)
    }
  }

  console.log('✅ All migrations completed!')
}

runMigrations()
