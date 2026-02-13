import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/^"(.*)"$/, '$1')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.replace(/^"(.*)"$/, '$1')

async function executeMigration() {
  const migrationPath = resolve(__dirname, '../supabase/migrations/combined_claims_system.sql')
  const sql = readFileSync(migrationPath, 'utf-8')

  console.log('🚀 Executing combined Claims system migration...\n')

  try {
    // Use the Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql_string: sql })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Migration failed:', response.status, errorText)

      console.log('\n📝 Please run the migration manually:')
      console.log('   1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
      console.log('   2. Open file: supabase/migrations/combined_claims_system.sql')
      console.log('   3. Copy and paste the entire content')
      console.log('   4. Click "Run" button\n')

      process.exit(1)
    }

    console.log('✅ Migration executed successfully!\n')
    console.log('📊 Database schema updated with:')
    console.log('   ✓ User tiers (FREE/PREMIUM/ADMIN)')
    console.log('   ✓ Claims table')
    console.log('   ✓ Claim evidence system')
    console.log('   ✓ Claim voting (TRUE/FALSE)')
    console.log('   ✓ Claim arguments & replies')
    console.log('   ✓ Reddit-style voting')
    console.log('   ✓ Predictions table updates\n')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.log('\n📝 Please run the migration manually:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
    console.log('   2. Open file: supabase/migrations/combined_claims_system.sql')
    console.log('   3. Copy and paste the entire content')
    console.log('   4. Click "Run" button\n')
    process.exit(1)
  }
}

executeMigration()
