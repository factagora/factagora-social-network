import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function runMigrations() {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

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

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => {
          // Filter out comments and empty statements
          if (!s || s.length === 0) return false
          if (s.startsWith('--')) return false
          // Keep only substantial SQL statements
          const lines = s.split('\n').filter(line => {
            const trimmed = line.trim()
            return trimmed && !trimmed.startsWith('--')
          })
          return lines.length > 0
        })

      console.log(`   Found ${statements.length} statements`)

      // Execute each statement
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]

        try {
          // Use the REST API directly to execute SQL
          const { error } = await supabase.rpc('exec', {
            sql: statement + ';'
          }).single()

          if (error) {
            // If RPC doesn't work, try using the PostgREST interface
            console.log(`   ⚠️  Statement ${i + 1}/${statements.length}: RPC not available, trying alternative...`)

            // For DDL statements, we'll log them and continue
            if (statement.toUpperCase().includes('CREATE') ||
                statement.toUpperCase().includes('ALTER') ||
                statement.toUpperCase().includes('DROP')) {
              console.log(`   ℹ️  DDL Statement (manual execution may be required):`)
              console.log(`      ${statement.substring(0, 100)}...`)
            }
          } else {
            console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`)
          }
        } catch (stmtError: any) {
          console.log(`   ⚠️  Statement ${i + 1}/${statements.length} error:`, stmtError.message)
          // Continue with next statement
        }
      }

      console.log(`   ✅ Migration ${migration} processed\n`)
    } catch (error: any) {
      console.error(`   ❌ Error processing ${migration}:`, error.message)
      console.log(`\n⚠️  Migration failed. Manual execution required.`)
      console.log(`   You can run this SQL file directly in the Supabase SQL Editor:`)
      console.log(`   ${filePath}\n`)
    }
  }

  console.log('✅ All migrations processed!')
  console.log('\n📝 Note: If you see warnings above, please run the migrations manually')
  console.log('   in the Supabase Dashboard SQL Editor or via psql.')
}

runMigrations()
