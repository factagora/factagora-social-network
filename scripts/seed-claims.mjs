#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleClaims = [
  {
    title: 'AI will achieve human-level reasoning capabilities by 2030',
    description: 'Multiple AI researchers predict that AGI will reach human-level reasoning within 6 years.',
    category: 'technology',
    claim_type: 'FACTUAL',
    resolution_date: '2030-12-31',
    approval_status: 'APPROVED'
  },
  {
    title: 'Universal Basic Income reduces poverty more effectively than traditional welfare',
    description: 'UBI pilot programs show direct cash transfers are more effective than traditional welfare.',
    category: 'politics',
    claim_type: 'STATISTICAL',
    resolution_date: '2026-12-31',
    approval_status: 'APPROVED'
  },
  {
    title: 'Companies with diverse leadership teams outperform their peers by 35%',
    description: 'McKinsey research shows diverse executive teams are 35% more likely to outperform.',
    category: 'business',
    claim_type: 'STATISTICAL',
    resolution_date: '2026-12-31',
    approval_status: 'APPROVED'
  },
  {
    title: 'Intermittent fasting reduces risk of type 2 diabetes by 40%',
    description: 'Clinical trials suggest intermittent fasting reduces diabetes risk by up to 40%.',
    category: 'health',
    claim_type: 'STATISTICAL',
    resolution_date: '2027-12-31',
    approval_status: 'APPROVED'
  },
  {
    title: 'Renewable energy will be cheaper than fossil fuels globally by 2025',
    description: 'Solar and wind energy will achieve lower cost than coal and gas by end of 2025.',
    category: 'climate',
    claim_type: 'STATISTICAL',
    resolution_date: '2025-12-31',
    approval_status: 'APPROVED'
  },
  {
    title: 'Athletes using sleep optimization improve performance by 15%',
    description: 'Structured sleep protocols improve competitive performance by 15% on average.',
    category: 'sports',
    claim_type: 'STATISTICAL',
    resolution_date: '2026-12-31',
    approval_status: 'APPROVED'
  }
]

async function seed() {
  const { data: users } = await supabase.from('users').select('id').limit(1)
  if (!users || users.length === 0) {
    console.error('❌ No users found')
    process.exit(1)
  }

  const userId = users[0].id
  let inserted = 0

  for (const claim of sampleClaims) {
    const { error } = await supabase.from('claims').insert({
      ...claim,
      created_by: userId,
      claim_date: new Date().toISOString()
    })

    if (!error) {
      console.log(`✅ ${claim.category}: ${claim.title.substring(0, 50)}...`)
      inserted++
    } else if (error.code !== '23505') {
      console.error(`❌ Error: ${error.message}`)
    }
  }

  console.log(`\n✨ Inserted ${inserted} claims`)
}

seed()
