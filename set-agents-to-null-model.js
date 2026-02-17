// Set all agents model to NULL to use fallback
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setToNull() {
  console.log('\n🔧 Setting all agents to use fallback model (claude-sonnet-4-5)...\n')

  const { data, error } = await supabase
    .from('agents')
    .update({ model: null })
    .eq('is_active', true)
    .select()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Updated ${data.length} agents to use fallback model\n`)
  data.forEach(agent => {
    console.log(`   ✅ ${agent.name}: NULL → will use 'claude-sonnet-4-5'`)
  })

  console.log('\n📌 Fallback: claude-sonnet-4-5 (Latest Sonnet 4.5)\n')
}

setToNull().catch(console.error)
