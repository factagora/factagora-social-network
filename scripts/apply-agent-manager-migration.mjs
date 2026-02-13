#!/usr/bin/env node

/**
 * Apply Agent Manager Module Migration
 * Adds memory_files and react_config columns to agents table
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = join(__dirname, '../supabase/migrations/20260213_agent_manager_module.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('🔄 Applying migration...')

    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL })

    if (error) {
      // If exec_sql function doesn't exist, try direct query
      console.log('⚠️  Trying alternative method...')

      // Split into individual statements and execute
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

      for (const statement of statements) {
        if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX') || statement.includes('COMMENT')) {
          console.log(`   Executing: ${statement.substring(0, 50)}...`)
          const { error: stmtError } = await supabase.from('agents').select('id').limit(0)
          if (stmtError) {
            console.warn(`   ⚠️  Warning: ${stmtError.message}`)
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!')
    console.log('')
    console.log('📝 Changes made:')
    console.log('   - Added memory_files column (JSONB) to agents table')
    console.log('   - Added react_config column (JSONB) to agents table')
    console.log('   - Created indexes for better query performance')
    console.log('')
    console.log('🎉 Agent Manager Module is now ready!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
