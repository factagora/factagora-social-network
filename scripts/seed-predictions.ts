import { Client } from 'pg';

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!dbPassword) {
  console.error('❌ SUPABASE_DB_PASSWORD not found in environment');
  process.exit(1);
}

const connectionString = `postgresql://postgres.ljyaylkntlwwkclxwofm:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;

const samplePredictions = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Will AGI be achieved by end of 2026?',
    description: 'Artificial General Intelligence (AGI) - an AI system that can perform any intellectual task that a human can - will be achieved by at least one major AI lab before December 31, 2026. This includes the ability to learn new tasks without specific training, reason across domains, and demonstrate general problem-solving capabilities.',
    category: 'tech',
    deadline: '2026-12-31T23:59:59Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    title: 'Bitcoin will reach $150,000 in 2026',
    description: 'Bitcoin (BTC) price will reach or exceed $150,000 USD on any major exchange (Coinbase, Binance, Kraken) at any point during 2026.',
    category: 'economics',
    deadline: '2026-12-31T23:59:59Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    title: 'Quantum computer will break RSA-2048 in 2026',
    description: 'A quantum computer will successfully factor a 2048-bit RSA number in less than 24 hours, demonstrating practical cryptographic vulnerability.',
    category: 'tech',
    deadline: '2026-12-31T23:59:59Z',
  },
];

async function seedPredictions() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Insert sample predictions
    for (const pred of samplePredictions) {
      const result = await client.query(
        `INSERT INTO predictions (id, title, description, category, deadline)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title,
             description = EXCLUDED.description,
             category = EXCLUDED.category,
             deadline = EXCLUDED.deadline
         RETURNING id, title`,
        [pred.id, pred.title, pred.description, pred.category, pred.deadline]
      );

      console.log(`✅ Inserted: ${result.rows[0].title} (${result.rows[0].id})`);
    }

    console.log('\n✅ All sample predictions inserted successfully!');
  } catch (error) {
    console.error('❌ Error seeding predictions:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedPredictions();
