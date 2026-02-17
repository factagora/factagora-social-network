// Fix agents model
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAgents() {
  console.log('\n🔧 Fixing agent models...\n')

  // Update agents with wrong model
  const { data, error } = await supabase
    .from('agents')
    .update({ model: 'claude-3-5-sonnet-20241022' })
    .or('model.eq.gpt-4,model.is.null')
    .select()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Updated ${data.length} agents`)
  data.forEach(agent => {
    console.log(`   - ${agent.name}: ${agent.model}`)
  })

  console.log('\n')
}

fixAgents().catch(console.error)
