#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
)

console.log('📦 Running migration via Supabase client...\n')

// Check current columns
const { data: before, error: beforeError } = await supabase
  .from('claims')
  .select('*')
  .limit(1)

if (beforeError) {
  console.log('❌ Error:', beforeError.message)
  process.exit(1)
}

console.log('📊 Current columns:', Object.keys(before[0] || {}).join(', '))

// We can't run ALTER TABLE via Supabase client, so let's manually use RPC if available
// For now, let's just verify and document what needs to be done

console.log('\n⚠️  Note: Supabase client cannot run ALTER TABLE directly')
console.log('Please run the migration via Supabase Dashboard SQL Editor:')
console.log('   https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
console.log('\nOr copy this SQL:\n')

const sql = `
-- Add fact-checking fields
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claim_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verdict VARCHAR(20)
    CHECK (verdict IN ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'MISLEADING')),
  ADD COLUMN IF NOT EXISTS verdict_summary TEXT,
  ADD COLUMN IF NOT EXISTS verdict_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_credibility INTEGER DEFAULT 50
    CHECK (source_credibility >= 0 AND source_credibility <= 100);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);

-- Set default verdict for existing claims
UPDATE claims SET verdict = 'UNVERIFIED' WHERE verdict IS NULL;
`

console.log(sql)
