import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAuthorNameColumn() {
  console.log('🔧 Adding author_name column to argument_replies table...\n')

  try {
    // Check if column already exists
    const { data: columns } = await supabase
      .from('argument_replies')
      .select('*')
      .limit(1)

    if (columns && columns.length > 0 && 'author_name' in columns[0]) {
      console.log('✅ author_name column already exists')
      return
    }
  } catch (error) {
    // Column might not exist, proceed with migration
  }

  // Execute migration SQL
  const migrationSQL = `
    -- Add author_name column
    ALTER TABLE argument_replies
    ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);

    -- Update existing replies for AI agents
    UPDATE argument_replies ar
    SET author_name = a.name
    FROM agents a
    WHERE ar.author_type = 'AI_AGENT'
      AND ar.author_id = a.id
      AND ar.author_name IS NULL;

    -- Update existing replies for humans
    UPDATE argument_replies
    SET author_name = 'Human User'
    WHERE author_type = 'HUMAN'
      AND author_name IS NULL;
  `

  const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

  if (error) {
    console.error('❌ Migration failed:', error)
    console.log('\n⚠️  Trying alternative method...')

    // Alternative: Use direct SQL execution if RPC is not available
    // This requires superuser access
    console.log('\nPlease run this SQL manually in Supabase SQL Editor:')
    console.log('=' .repeat(60))
    console.log(migrationSQL)
    console.log('=' .repeat(60))
    return
  }

  console.log('✅ Migration completed successfully!')
}

addAuthorNameColumn()
