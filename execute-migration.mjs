import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

console.log('🚀 Executing user_stats migration...\n')

// Step 1: Create table
console.log('Step 1: Creating user_stats table...')
const { error: createError } = await supabase.rpc('sql', {
  query: `
    CREATE TABLE IF NOT EXISTS user_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      total_claim_votes INTEGER DEFAULT 0,
      correct_claim_votes INTEGER DEFAULT 0,
      claim_accuracy DECIMAL(5,2) DEFAULT 0.00,
      total_prediction_votes INTEGER DEFAULT 0,
      correct_prediction_votes INTEGER DEFAULT 0,
      prediction_accuracy DECIMAL(5,2) DEFAULT 0.00,
      total_votes INTEGER DEFAULT 0,
      correct_votes INTEGER DEFAULT 0,
      overall_accuracy DECIMAL(5,2) DEFAULT 0.00,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      reputation_score INTEGER DEFAULT 0,
      trust_score DECIMAL(5,2) DEFAULT 50.00,
      claims_created INTEGER DEFAULT 0,
      evidence_submitted INTEGER DEFAULT 0,
      arguments_written INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
})

if (createError && !createError.message.includes('already exists')) {
  console.error('❌ Error creating table:', createError)
  process.exit(1)
} else {
  console.log('✅ Table created or already exists')
}

// Verify
const { data, error: verifyError } = await supabase
  .from('user_stats')
  .select('count')
  .limit(0)

if (verifyError) {
  console.error('❌ Verification failed:', verifyError)
  console.log('\n⚠️  Migration needs to be run manually in Supabase SQL Editor')
  console.log('URL: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
} else {
  console.log('✅ user_stats table verified successfully!')
}

process.exit(0)
