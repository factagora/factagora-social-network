#!/usr/bin/env node

console.log('🔧 Attempting migration via Supabase API...\n')

const migrationSQL = `
-- Add fact-checking specific columns
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
CREATE INDEX IF NOT EXISTS idx_claims_claimed_by ON claims(claimed_by);
CREATE INDEX IF NOT EXISTS idx_claims_source_credibility ON claims(source_credibility DESC);

-- Update existing
UPDATE claims SET verdict = 'UNVERIFIED' WHERE verdict IS NULL;
`

// Try to execute via Management API
const response = await fetch('https://ljyaylkntlwwkclxwofm.supabase.co/rest/v1/rpc/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'
  },
  body: JSON.stringify({ query: migrationSQL })
})

if (!response.ok) {
  const error = await response.text()
  console.log('❌ HTTP API approach not available')
  console.log('Details:', error, '\n')
  console.log('📋 Manual migration required:')
  console.log('🔗 https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
  console.log('\nCopy and paste this SQL:')
  console.log('─'.repeat(50))
  console.log(migrationSQL)
  console.log('─'.repeat(50))
  process.exit(1)
}

const result = await response.json()
console.log('✅ Migration executed:', result)
