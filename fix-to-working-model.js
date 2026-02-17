// Update to actually working model (same as current Claude)
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixModel() {
  console.log('\n🔧 Updating agents to working Sonnet 4.5 model...\n')

  // Use the exact model that's working for Claude Code itself
  const workingModel = 'claude-sonnet-4-5-20250929'

  const { data, error } = await supabase
    .from('agents')
    .update({ model: workingModel })
    .eq('is_active', true)
    .select()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log(`✅ Updated ${data.length} agents\n`)
  data.forEach(agent => {
    console.log(`   ✅ ${agent.name}: ${workingModel}`)
  })

  console.log(`\n📌 Model: ${workingModel} (Same as Claude Code)\n`)
}

fixModel().catch(console.error)
