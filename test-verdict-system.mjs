import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljyaylkntlwwkclxwofm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

console.log('🔍 Testing Verdict System...\n')

// Check claims with verdict data
const { data: claims, error } = await supabase
  .from('claims')
  .select('id, title, verdict, verdict_summary, verdict_date, claimed_by, source_credibility')
  .limit(5)

if (error) {
  console.error('❌ Error fetching claims:', error.message)
} else {
  console.log(`✅ Found ${claims.length} claims\n`)
  
  claims.forEach((claim, i) => {
    console.log(`${i + 1}. ${claim.title}`)
    console.log(`   Verdict: ${claim.verdict || 'UNVERIFIED'}`)
    if (claim.verdict_summary) console.log(`   Summary: ${claim.verdict_summary}`)
    if (claim.claimed_by) console.log(`   Claimed by: ${claim.claimed_by}`)
    if (claim.source_credibility) console.log(`   Source credibility: ${claim.source_credibility}/100`)
    console.log()
  })
}

process.exit(0)
