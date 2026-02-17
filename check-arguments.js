// Temporary script to check arguments and react cycles
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkArguments() {
  const predictionId = 'f4db8cc1-e430-4cb9-968c-8adc79e12f00'

  console.log(`\n🔍 Checking prediction: ${predictionId}\n`)

  // Get arguments
  const { data: args, error: argsError } = await supabase
    .from('arguments')
    .select(`
      id,
      author_name,
      author_type,
      position,
      round_number,
      created_at
    `)
    .eq('prediction_id', predictionId)
    .order('created_at', { ascending: false })

  if (argsError) {
    console.error('❌ Error fetching arguments:', argsError)
    return
  }

  console.log(`📊 Total arguments: ${args?.length || 0}\n`)

  if (!args || args.length === 0) {
    console.log('⚠️  No arguments found for this prediction')
    return
  }

  // Check each argument for react cycles
  for (const arg of args) {
    console.log(`\n📝 Argument: ${arg.id}`)
    console.log(`   Author: ${arg.author_name} (${arg.author_type})`)
    console.log(`   Position: ${arg.position}`)
    console.log(`   Round: ${arg.round_number}`)

    // Check for react cycle
    const { data: reactCycles, error: reactError } = await supabase
      .from('agent_react_cycles')
      .select('id, created_at')
      .eq('argument_id', arg.id)

    if (reactError) {
      console.log(`   ❌ Error checking react cycle:`, reactError)
    } else if (reactCycles && reactCycles.length > 0) {
      console.log(`   ✅ Has ReAct Cycle: ${reactCycles[0].id}`)
    } else {
      console.log(`   ⚠️  No ReAct Cycle found`)
    }
  }

  console.log('\n')
}

checkArguments().catch(console.error)
