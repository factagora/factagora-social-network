import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🚀 Checking Evidence Credibility System migration...\\n')

// Check if source_reputation table exists
const { data: sourceRepData, error: sourceRepError } = await supabase
  .from('source_reputation')
  .select('id')
  .limit(1)

// Check if fact_checker_reputation table exists
const { data: factCheckerData, error: factCheckerError } = await supabase
  .from('fact_checker_reputation')
  .select('id')
  .limit(1)

// Check if claim_consensus table exists
const { data: consensusData, error: consensusError } = await supabase
  .from('claim_consensus')
  .select('id')
  .limit(1)

// Check if google_factcheck_cache table exists
const { data: cacheData, error: cacheError } = await supabase
  .from('google_factcheck_cache')
  .select('id')
  .limit(1)

const allTablesExist = !sourceRepError && !factCheckerError && !consensusError && !cacheError

if (allTablesExist) {
  console.log('✅ All credibility system tables exist!')
  console.log('✅ Migration has been successfully applied.\\n')

  // Show some stats
  const { data: sources } = await supabase
    .from('source_reputation')
    .select('domain, credibility_score')
    .order('credibility_score', { ascending: false })
    .limit(5)

  if (sources && sources.length > 0) {
    console.log('📊 Top 5 Source Reputations:')
    sources.forEach((src, i) => {
      console.log(`${i + 1}. ${src.domain}: ${src.credibility_score}/100`)
    })
  } else {
    console.log('ℹ️ No source reputations seeded yet.')
  }

} else {
  console.log('❌ Credibility system tables do not exist yet\\n')
  console.log('📝 Please run the migration manually:\\n')
  console.log('1. Go to: https://supabase.com/dashboard/project/ljyaylkntlwwkclxwofm/sql')
  console.log('2. Click "+ New query"')
  console.log('3. Copy contents from: supabase/migrations/20260213_evidence_credibility_system.sql')
  console.log('4. Paste and click "Run"\\n')
  console.log('📄 Migration file path: ./supabase/migrations/20260213_evidence_credibility_system.sql')

  // Show which tables are missing
  console.log('\\n🔍 Missing tables:')
  if (sourceRepError) console.log('  ❌ source_reputation')
  if (factCheckerError) console.log('  ❌ fact_checker_reputation')
  if (consensusError) console.log('  ❌ claim_consensus')
  if (cacheError) console.log('  ❌ google_factcheck_cache')
}

process.exit(0)
