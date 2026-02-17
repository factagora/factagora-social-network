// Check current agent models
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAgents() {
  console.log('\n🔍 Checking agent models...\n')

  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, model, is_active')
    .eq('is_active', true)

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`📊 Active Agents: ${agents.length}\n`)
  agents.forEach(agent => {
    const modelStatus = agent.model === 'gpt-4' ? '❌' :
                       agent.model?.includes('claude') ? '✅' :
                       agent.model ? '⚠️' : '❓'
    console.log(`${modelStatus} ${agent.name}: ${agent.model || 'NULL'}`)
  })

  console.log('\n')
}

checkAgents().catch(console.error)
