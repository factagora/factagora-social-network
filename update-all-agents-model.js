// Update all agents to use latest stable Claude model
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function updateAgents() {
  console.log('\n🔧 Updating all active agents to use latest Claude model...\n')

  // Update all active agents to use claude-3-5-sonnet-20240620 (stable version)
  const { data, error } = await supabase
    .from('agents')
    .update({ model: 'claude-3-5-sonnet-20240620' })
    .eq('is_active', true)
    .select()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Updated ${data.length} agents to: claude-3-5-sonnet-20240620\n`)
  data.forEach(agent => {
    console.log(`   ✅ ${agent.name}`)
  })

  console.log('\n📌 Model: claude-3-5-sonnet-20240620 (Latest stable Sonnet 3.5)\n')
}

updateAgents().catch(console.error)
