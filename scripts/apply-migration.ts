import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

async function createSampleData() {
  console.log('📦 Creating sample data...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const host = supabaseUrl.replace('https://', '').replace('.supabase.co', '')
  
  const client = new Client({
    host: `db.${host}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()

    // Get first user from public.users
    const userResult = await client.query('SELECT id FROM users LIMIT 1')
    
    if (userResult.rows.length === 0) {
      console.error('❌ No users found')
      return false
    }

    const userId = userResult.rows[0].id
    console.log(`👤 Using user: ${userId}\n`)

    // Create agents
    console.log('🤖 Creating 3 sample agents...')
    
    const agents = [
      ['10000000-0000-0000-0000-000000000001', 'Skeptic Bot', 'Critical thinker', 'SKEPTIC', 0.2, 'You are a skeptical AI agent.'],
      ['10000000-0000-0000-0000-000000000002', 'Optimist Bot', 'Enthusiastic thinker', 'OPTIMIST', 0.7, 'You are an optimistic AI agent.'],
      ['10000000-0000-0000-0000-000000000003', 'Data Analyst Bot', 'Statistical thinker', 'DATA_ANALYST', 0.3, 'You are a data-driven AI agent.']
    ]

    for (const [id, name, desc, personality, temp, prompt] of agents) {
      await client.query(
        `INSERT INTO agents (id, user_id, name, description, model, personality, temperature, mode, system_prompt, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET user_id = $2, is_active = $10`,
        [id, userId, name, desc, 'claude-3-5-sonnet-20241022', personality, temp, 'MANAGED', prompt, true]
      )
      console.log(`   ✅ ${name}`)
    }

    // Create predictions
    console.log('\n📋 Creating 2 sample predictions...')
    
    await client.query(
      `INSERT INTO predictions (id, title, description, category, deadline)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET title = $2, description = $3`,
      [
        '00000000-0000-0000-0000-000000000001',
        'Will AGI be achieved by end of 2026?',
        'Artificial General Intelligence (AGI) is defined as an AI system that can perform any intellectual task that a human can do. For this prediction to resolve as YES, a credible AI research organization must announce and demonstrate an AI system with human-level performance across multiple domains.',
        'tech',
        '2026-12-31T23:59:59Z'
      ]
    )
    console.log('   ✅ AGI prediction')

    await client.query(
      `INSERT INTO predictions (id, title, description, category, deadline)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET title = $2, description = $3`,
      [
        '00000000-0000-0000-0000-000000000002',
        'Did Tesla achieve $30B+ revenue in Q4 2025?',
        'Tesla Inc. Q4 2025 earnings report verification. The claim is that Tesla achieved over $30 billion in revenue during Q4 2025. This needs to be verified against official SEC filings.',
        'economics',
        '2026-03-31T23:59:59Z'
      ]
    )
    console.log('   ✅ Tesla revenue claim')

    console.log('\n✅ Sample data created!\n')
    return true
  } finally {
    await client.end()
  }
}

createSampleData().then((success) => {
  if (success) {
    console.log('Ready to test! Run: npx tsx scripts/test-both-predictions.ts\n')
  }
}).catch(console.error)
