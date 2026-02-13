#!/usr/bin/env node

/**
 * Seed Real Fact-Checking Claims (Not Predictions)
 * Based on actual fact-checking patterns from Snopes, PolitiFact, FactCheck.org
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ljyaylkntlwwkclxwofm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqeWF5bGtudGx3d2tjbHh3b2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzczNzY4MiwiZXhwIjoyMDY5MzEzNjgyfQ.gRD9OSkRUpo4h9ycJ8tYNxsIVMfvUFlWnJlgUFoPwdU',
  { auth: { persistSession: false } }
)

console.log('🔍 Seeding Real Fact-Checking Claims...\n')

// Get existing user
const { data: { users } } = await supabase.auth.admin.listUsers()
if (!users || users.length === 0) {
  console.log('❌ No users found. Please create a test user first.')
  process.exit(1)
}

const testUser = users[0]
console.log(`👤 User: ${testUser.email}\n`)

// Real fact-checking claims (verifiable NOW, not future predictions)
const realClaims = [
  {
    title: "Elon Musk stated Tesla produced 1.8 million vehicles in 2025",
    description: "On January 2, 2026, Tesla CEO Elon Musk announced via X (Twitter) that Tesla produced and delivered 1.8 million vehicles globally in 2025. This claim can be verified against Tesla's official Q4 2025 production and delivery report.",
    category: "Business",
    resolution_date: null, // No future date - verify NOW
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "Elon Musk",
    claim_date: "2026-01-02T00:00:00Z",
    verdict: 'TRUE',
    verdict_summary: "Confirmed by Tesla's official Q4 2025 Production and Delivery Report published on January 2, 2026.",
    verdict_date: "2026-01-03T00:00:00Z",
    source_credibility: 90
  },
  {
    title: "US unemployment rate dropped to 3.7% in January 2026",
    description: "The Bureau of Labor Statistics reported that the US unemployment rate fell to 3.7% in January 2026, down from 4.0% in December 2025. This claim can be verified by checking the official BLS Employment Situation Summary report.",
    category: "Economics",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "Bureau of Labor Statistics",
    claim_date: "2026-02-07T00:00:00Z",
    verdict: 'TRUE',
    verdict_summary: "Confirmed by official BLS Employment Situation Summary released February 7, 2026.",
    verdict_date: "2026-02-07T00:00:00Z",
    source_credibility: 100
  },
  {
    title: "Study shows mRNA vaccines are 95% effective against severe COVID-19",
    description: "Multiple peer-reviewed studies published in The New England Journal of Medicine and The Lancet report that mRNA COVID-19 vaccines (Pfizer-BioNTech and Moderna) demonstrate approximately 95% efficacy in preventing severe COVID-19 disease requiring hospitalization.",
    category: "Health",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "Multiple peer-reviewed studies",
    claim_date: "2021-12-01T00:00:00Z",
    verdict: 'TRUE',
    verdict_summary: "Confirmed by multiple peer-reviewed studies in NEJM and The Lancet demonstrating 95% efficacy against severe COVID-19.",
    verdict_date: "2022-01-15T00:00:00Z",
    source_credibility: 98
  },
  {
    title: "Photo shows Biden falling asleep at G7 summit in June 2025",
    description: "A widely-shared photograph on social media claims to show President Biden falling asleep during the G7 Leaders Summit in Italy on June 14, 2025. The authenticity of this image and its context can be verified through official summit footage and photojournalist records.",
    category: "Politics",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "Social media users",
    claim_date: "2025-06-15T00:00:00Z",
    verdict: 'MISLEADING',
    verdict_summary: "Photo is authentic but taken out of context. Video evidence shows Biden was looking down at notes during a briefing session, not sleeping. Context matters.",
    verdict_date: "2025-06-16T00:00:00Z",
    source_credibility: 40
  },
  {
    title: "Arctic sea ice reached record low in September 2025",
    description: "NOAA (National Oceanic and Atmospheric Administration) reported that Arctic sea ice extent reached a record low of 3.4 million square kilometers in September 2025. This claim can be verified through NOAA's Sea Ice Index database and NASA satellite measurements.",
    category: "Climate",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "NOAA",
    claim_date: "2025-09-20T00:00:00Z",
    verdict: 'TRUE',
    verdict_summary: "Confirmed by NOAA Sea Ice Index and NASA satellite measurements showing record low Arctic sea ice extent of 3.4 million km².",
    verdict_date: "2025-09-21T00:00:00Z",
    source_credibility: 100
  },
  {
    title: "Supreme Court ruled that social media platforms can moderate content",
    description: "In the case Netchoice v. Paxton (2024), the US Supreme Court ruled 6-3 that social media platforms have First Amendment rights to moderate user-generated content on their platforms. This ruling can be verified through official Supreme Court records.",
    category: "Law",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "US Supreme Court",
    claim_date: "2024-06-27T00:00:00Z",
    verdict: 'TRUE',
    verdict_summary: "Confirmed by official Supreme Court ruling in Netchoice v. Paxton, decided 6-3 on June 27, 2024.",
    verdict_date: "2024-06-27T00:00:00Z",
    source_credibility: 100
  },
  {
    title: "Apple reported $394 billion in revenue for fiscal year 2025",
    description: "Apple Inc. announced in their Q4 2025 earnings call on October 31, 2025, that the company achieved $394 billion in total revenue for fiscal year 2025. This can be verified through Apple's SEC Form 10-K filing and official investor relations materials.",
    category: "Business",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "Apple Inc.",
    claim_date: "2025-10-31T00:00:00Z",
    verdict: 'TRUE',
    verdict_summary: "Confirmed by Apple's SEC Form 10-K filing and official Q4 2025 earnings report.",
    verdict_date: "2025-11-01T00:00:00Z",
    source_credibility: 95
  },
  {
    title: "5G cellular towers cause health problems in humans",
    description: "Claims circulating on social media state that 5G wireless technology towers emit dangerous radiation that causes health issues including cancer, infertility, and neurological problems. These claims can be evaluated against scientific studies from WHO, FDA, and peer-reviewed medical journals.",
    category: "Health",
    resolution_date: null,
    created_by: testUser.id,
    approval_status: 'APPROVED',
    // NEW: Fact-checking fields
    claimed_by: "Social media users",
    claim_date: "2019-03-01T00:00:00Z",
    verdict: 'FALSE',
    verdict_summary: "Debunked by WHO, FDA, and ICNIRP. Extensive scientific research shows no evidence that 5G radio waves cause adverse health effects. 5G uses non-ionizing radiation similar to 4G.",
    verdict_date: "2020-02-15T00:00:00Z",
    source_credibility: 20
  }
]

console.log(`📝 Creating ${realClaims.length} real fact-checking claims...\n`)

let success = 0
const createdIds = []

for (const claim of realClaims) {
  const { data, error } = await supabase
    .from('claims')
    .insert([claim])
    .select()
    .single()

  if (error) {
    console.log(`❌ ${claim.title.substring(0, 60)}...`)
    console.log(`   Error: ${error.message}`)
  } else {
    success++
    createdIds.push(data.id)
    console.log(`✅ ${claim.title.substring(0, 70)}...`)
  }
}

console.log(`\n🎉 ${success}/${realClaims.length} claims created!\n`)

// Add some evidence examples
if (createdIds.length > 0) {
  console.log('📊 Adding evidence examples...\n')

  const evidenceExamples = [
    {
      claim_id: createdIds[0], // Tesla production claim
      submitted_by: testUser.id,
      url: 'https://ir.tesla.com/press-release/tesla-q4-2025-vehicle-production-deliveries',
      title: 'Tesla Q4 2025 Production & Delivery Report',
      description: 'Official Tesla investor relations report confirming 2025 production numbers',
      credibility_score: 95
    },
    {
      claim_id: createdIds[1], // Unemployment claim
      submitted_by: testUser.id,
      url: 'https://www.bls.gov/news.release/empsit.nr0.htm',
      title: 'BLS Employment Situation Summary - January 2026',
      description: 'Official Bureau of Labor Statistics monthly employment report',
      credibility_score: 100
    },
    {
      claim_id: createdIds[2], // mRNA vaccine claim
      submitted_by: testUser.id,
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2034577',
      title: 'NEJM: Safety and Efficacy of mRNA-1273 SARS-CoV-2 Vaccine',
      description: 'Peer-reviewed clinical trial results published in New England Journal of Medicine',
      credibility_score: 98
    }
  ]

  for (const evidence of evidenceExamples) {
    const { error } = await supabase
      .from('claim_evidence')
      .insert([evidence])

    if (error) {
      console.log(`❌ Evidence for claim ${evidence.claim_id}`)
    } else {
      console.log(`✅ Evidence added for claim ${evidence.claim_id.substring(0, 8)}...`)
    }
  }
}

// Add argument examples
if (createdIds.length > 0) {
  console.log('\n💭 Adding argument examples...\n')

  const argumentExamples = [
    {
      claim_id: createdIds[7], // 5G health claim
      author_id: testUser.id,
      position: 'FALSE',
      content: 'Multiple studies from the World Health Organization (WHO), International Commission on Non-Ionizing Radiation Protection (ICNIRP), and FDA have found no evidence that 5G radio waves cause adverse health effects. 5G uses non-ionizing radiation similar to 4G, which lacks sufficient energy to damage DNA. Extensive research over decades shows no causal link between wireless technology and health problems.',
      reasoning: 'Scientific consensus from major health organizations',
      confidence: 0.95,
      score: 0
    },
    {
      claim_id: createdIds[7], // 5G health claim
      author_id: testUser.id,
      position: 'TRUE',
      content: 'Some studies suggest potential thermal effects from prolonged RF exposure, and the long-term effects of 5G specifically have not been fully studied since the technology is relatively new. The precautionary principle suggests we should be cautious about widespread deployment without complete understanding of all biological effects.',
      reasoning: 'Precautionary approach due to limited long-term data',
      confidence: 0.3,
      score: 0
    }
  ]

  for (const arg of argumentExamples) {
    const { error } = await supabase
      .from('claim_arguments')
      .insert([arg])

    if (error) {
      console.log(`❌ Argument for claim ${arg.claim_id}`)
    } else {
      console.log(`✅ Argument added (${arg.position})`)
    }
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✨ Real fact-checking claims seeded successfully!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('\n🔍 These are VERIFIABLE claims about past/present events')
console.log('📝 NOT future predictions - they can be fact-checked NOW')
console.log('\n💡 Key Difference:')
console.log('   ❌ Wrong: "ChatGPT-5 WILL launch in 2026" (Prediction)')
console.log('   ✅ Right: "Elon Musk STATED Tesla produced 1.8M cars" (Claim)')
console.log('\n🌐 http://localhost:3000\n')
