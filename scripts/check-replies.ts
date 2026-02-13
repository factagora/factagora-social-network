import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkReplies() {
  const predictionId = process.argv[2]

  if (!predictionId) {
    console.error('Usage: npx tsx scripts/check-replies.ts <prediction-id>')
    process.exit(1)
  }

  console.log(`\n🔍 Checking replies for prediction: ${predictionId}\n`)

  // Get all arguments for this prediction
  const { data: args, error: argsError } = await supabase
    .from('arguments')
    .select('id, author_id, author_name, position, confidence, round_number')
    .eq('prediction_id', predictionId)
    .order('created_at', { ascending: true })

  if (argsError) {
    console.error('❌ Failed to fetch arguments:', argsError)
    return
  }

  console.log(`📊 Found ${args?.length || 0} arguments\n`)

  if (!args || args.length === 0) {
    return
  }

  // Get all replies
  const argIds = args.map((a) => a.id)
  const { data: replies, error: repliesError } = await supabase
    .from('argument_replies')
    .select('*')
    .in('argument_id', argIds)
    .order('created_at', { ascending: true })

  if (repliesError) {
    console.error('❌ Failed to fetch replies:', repliesError)
    return
  }

  // Get all agents for name lookup
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name')

  const agentMap = new Map()
  if (agents) {
    agents.forEach((a) => agentMap.set(a.id, a.name))
  }

  console.log(`💬 Found ${replies?.length || 0} total replies\n`)

  if (replies && replies.length > 0) {
    console.log('Replies breakdown:\n')
    args.forEach((arg) => {
      const argReplies = replies.filter((r) => r.argument_id === arg.id)
      console.log(`${arg.author_name} (Round ${arg.round_number}):`)
      console.log(`  Position: ${arg.position} (${(arg.confidence * 100).toFixed(0)}% confidence)`)
      console.log(`  Replies received: ${argReplies.length}`)

      if (argReplies.length > 0) {
        argReplies.forEach((reply) => {
          const authorName = agentMap.get(reply.author_id) || 'Unknown'
          console.log(`    - ${authorName} → ${reply.reply_type}`)
          console.log(`      "${reply.content.substring(0, 80)}..."`)
        })
      }
      console.log()
    })

    // Stats
    const supportCount = replies.filter((r) => r.reply_type === 'SUPPORT').length
    const counterCount = replies.filter((r) => r.reply_type === 'COUNTER').length
    const questionCount = replies.filter((r) => r.reply_type === 'QUESTION').length
    const clarifyCount = replies.filter((r) => r.reply_type === 'CLARIFY').length

    console.log('📈 Reply Type Distribution:')
    console.log(`  SUPPORT: ${supportCount}`)
    console.log(`  COUNTER: ${counterCount}`)
    console.log(`  QUESTION: ${questionCount}`)
    console.log(`  CLARIFY: ${clarifyCount}`)
  }
}

checkReplies()
