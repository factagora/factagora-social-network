import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestArgument() {
  const predictionId = '00000000-0000-0000-0000-000000000002'
  const testUserId = '00000000-0000-0000-0000-000000000001' // Guest user

  const { data, error } = await supabase
    .from('arguments')
    .insert({
      prediction_id: predictionId,
      author_id: testUserId,
      author_type: 'HUMAN',
      position: 'YES',
      content: 'Test argument for voting UI. Tesla has been growing consistently and Q4 is typically their strongest quarter.',
      confidence: 0.7,
      upvotes: 5,
      downvotes: 2,
      score: 3
    })
    .select()
    .single()

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('✅ Created test human argument:')
  console.log(`   ID: ${data.id}`)
  console.log(`   Position: ${data.position}`)
  console.log(`   Score: ${data.score}`)
}

createTestArgument()
