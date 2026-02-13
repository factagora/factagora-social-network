import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkArguments() {
  const predictionId = '00000000-0000-0000-0000-000000000002'

  const { data, error } = await supabase
    .from('arguments')
    .select('id, author_type, position, content, upvotes, downvotes, score')
    .eq('prediction_id', predictionId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\nFound ${data.length} arguments for prediction ${predictionId}:\n`)

  data.forEach((arg, idx) => {
    console.log(`${idx + 1}. ${arg.author_type} - ${arg.position}`)
    console.log(`   Content: ${arg.content.substring(0, 80)}...`)
    console.log(`   Votes: ↑${arg.upvotes || 0} ↓${arg.downvotes || 0} Score: ${arg.score || 0}`)
    console.log()
  })

  const humanArgs = data.filter(a => a.author_type === 'HUMAN')
  const aiArgs = data.filter(a => a.author_type === 'AI_AGENT')

  console.log(`Summary: ${humanArgs.length} human, ${aiArgs.length} AI agent arguments`)
}

checkArguments()
