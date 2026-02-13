import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '../.env.local') })

async function testRepliesAPI() {
  const predictionId = '00000000-0000-0000-0000-000000000001'

  console.log(`\n🧪 Testing Replies API for prediction: ${predictionId}\n`)

  // 1. Get arguments first
  const argsRes = await fetch(`http://localhost:3000/api/predictions/${predictionId}/arguments`)
  if (!argsRes.ok) {
    console.error('❌ Failed to fetch arguments:', argsRes.status, argsRes.statusText)
    return
  }

  const argsData = await argsRes.json()
  const aiArgs = argsData.arguments.filter((arg: any) => arg.authorType === 'AI_AGENT')

  console.log(`✅ Found ${aiArgs.length} AI arguments\n`)

  // 2. Test replies API for each argument
  for (const arg of aiArgs) {
    console.log(`\n📊 Testing replies for: ${arg.authorName}`)
    console.log(`   Argument ID: ${arg.id}`)

    const repliesRes = await fetch(`http://localhost:3000/api/arguments/${arg.id}/replies`)

    if (!repliesRes.ok) {
      console.error(`   ❌ Failed to fetch replies:`, repliesRes.status, repliesRes.statusText)
      const errorText = await repliesRes.text()
      console.error(`   Error body:`, errorText)
      continue
    }

    const repliesData = await repliesRes.json()

    console.log(`   ✅ API Response:`)
    console.log(`      - Total replies: ${repliesData.replies?.length || 0}`)
    console.log(`      - Stats:`, JSON.stringify(repliesData.stats, null, 2))

    if (repliesData.replies && repliesData.replies.length > 0) {
      console.log(`\n   💬 Replies:`)
      repliesData.replies.forEach((reply: any, idx: number) => {
        console.log(`      ${idx + 1}. ${reply.authorName || 'Unknown'} → ${reply.replyType}`)
        console.log(`         Content: "${reply.content?.substring(0, 60)}..."`)
        console.log(`         Created: ${reply.createdAt}`)
      })
    } else {
      console.log(`   ⚠️  No replies found for this argument`)
    }
  }

  console.log('\n✅ API Test Complete')
}

testRepliesAPI().catch(console.error)
