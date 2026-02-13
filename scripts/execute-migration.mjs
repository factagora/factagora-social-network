#!/usr/bin/env node

import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: 'postgresql://postgres.ljyaylkntlwwkclxwofm:Goldenchild0913!@aws-0-us-west-1.pooler.supabase.com:6543/postgres'
})

console.log('🔧 Executing database migration...\n')

try {
  await client.connect()
  console.log('✅ Connected to database\n')

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

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_claims_verdict ON claims(verdict);
CREATE INDEX IF NOT EXISTS idx_claims_claim_date ON claims(claim_date DESC);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_by ON claims(claimed_by);
CREATE INDEX IF NOT EXISTS idx_claims_source_credibility ON claims(source_credibility DESC);

-- Update existing claims to have default verdict if null
UPDATE claims
SET verdict = 'UNVERIFIED'
WHERE verdict IS NULL;
  `

  console.log('📝 Running migration SQL...')
  await client.query(migrationSQL)
  console.log('✅ Migration completed successfully!\n')

} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
