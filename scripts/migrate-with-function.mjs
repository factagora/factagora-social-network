#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
)

console.log('📦 Running migration via stored function...\n')

// Step 1: Create migration function
console.log('1️⃣ Creating migration function...')

const createFunctionSQL = `
CREATE OR REPLACE FUNCTION migrate_claims_factchecking()
RETURNS TEXT AS $$
BEGIN
  -- Add columns
  ALTER TABLE claims ADD COLUMN IF NOT EXISTS claimed_by TEXT;
  ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_date TIMESTAMPTZ;
  ALTER TABLE claims ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
    CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING'));
  ALTER TABLE claims ADD COLUMN IF NOT EXISTS verdict_summary TEXT;
  ALTER TABLE claims ADD COLUMN IF NOT EXISTS verdict_date TIMESTAMPTZ;
  ALTER TABLE claims ADD COLUMN IF NOT EXISTS source_credibility INTEGER DEFAULT 50
    CHECK (source_credibility >= 0 AND source_credibility <= 100);

  -- Add indexes
  CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
  CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);

  -- Update existing claims
  UPDATE claims SET verdict = 'UNVERIFIED' WHERE verdict IS NULL;

  RETURN 'Migration completed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

// Try to create the function via RPC
try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL })

  if (error) {
    console.log('⚠️  Cannot create function via RPC (expected)')
    console.log('   Error:', error.message)
  }
} catch (e) {
  console.log('⚠️  RPC not available')
}

// Step 2: Since we can't run migrations directly, let's work around it
// by manually checking and documenting the state

console.log('\n2️⃣ Checking if columns already exist...')

const { data: testClaim } = await supabase
  .from('claims')
  .select('*')
  .limit(1)
  .single()

const hasNewFields = testClaim && 'verdict' in testClaim

if (hasNewFields) {
  console.log('✅ New columns already exist!')
  console.log('   verdict:', testClaim.verdict)
  console.log('   claimed_by:', testClaim.claimed_by)
} else {
  console.log('❌ New columns do not exist yet')
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  Manual Migration Required')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nPlease run this SQL in Supabase Dashboard:')
  console.log('URL: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql/new')
  console.log('\n--- Copy from here ---')
  console.log(`
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claim_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
    CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING')),
  ADD COLUMN IF NOT EXISTS verdict_summary TEXT,
  ADD COLUMN IF NOT EXISTS verdict_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_credibility INTEGER DEFAULT 50
    CHECK (source_credibility >= 0 AND source_credibility <= 100);

CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);

UPDATE claims SET verdict = 'UNVERIFIED' WHERE verdict IS NULL;
  `)
  console.log('--- Copy until here ---\n')
  console.log('Then run this script again to verify.\n')
  process.exit(1)
}
