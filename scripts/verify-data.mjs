import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU'
)

console.log('📊 Fact-Checking Claims Verification\n')

const { data: claims, error } = await supabase
  .from('claims')
  .select('title, verdict, claimed_by, claim_date, source_credibility, verdict_summary')
  .order('created_at', { ascending: false })
  .limit(8)

if (error) {
  console.log('❌ Error:', error.message)
  process.exit(1)
}

const verdictCounts = {
  TRUE: 0,
  FALSE: 0,
  PARTIALLY_TRUE: 0,
  UNVERIFIED: 0,
  MISLEADING: 0
}

claims.forEach(claim => {
  verdictCounts[claim.verdict]++
  console.log(`\n${claim.verdict === 'TRUE' ? '✅' : claim.verdict === 'FALSE' ? '❌' : '⚠️'} ${claim.verdict}`)
  console.log(`   Title: ${claim.title.substring(0, 60)}...`)
  console.log(`   Claimed by: ${claim.claimed_by}`)
  console.log(`   Source credibility: ${claim.source_credibility}/100`)
  console.log(`   Summary: ${claim.verdict_summary?.substring(0, 80)}...`)
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📈 Verdict Distribution:')
console.log(`   ✅ TRUE: ${verdictCounts.TRUE}`)
console.log(`   ❌ FALSE: ${verdictCounts.FALSE}`)
console.log(`   ⚠️ PARTIALLY_TRUE: ${verdictCounts.PARTIALLY_TRUE}`)
console.log(`   🟠 MISLEADING: ${verdictCounts.MISLEADING}`)
console.log(`   ❓ UNVERIFIED: ${verdictCounts.UNVERIFIED}`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
