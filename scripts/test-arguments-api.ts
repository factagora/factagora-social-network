import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '../lib/supabase/client'

async function testArgumentsAPI() {
  const supabase = createClient()
  const predictionId = '00000000-0000-0000-0000-000000000001'

  console.log('Testing arguments API query...\n')

  try {
    // Test basic query
    console.log('1. Testing basic arguments query...')
    const { data: basicArgs, error: basicError } = await supabase
      .from('arguments')
      .select('*')
      .eq('prediction_id', predictionId)

    if (basicError) {
      console.error('❌ Basic query error:', basicError)
    } else {
      console.log(`✅ Basic query successful: ${basicArgs.length} arguments found`)
    }

    // Test with argument_quality join
    console.log('\n2. Testing with argument_quality join...')
    const { data: qualityArgs, error: qualityError } = await supabase
      .from('arguments')
      .select(`
        *,
        argument_quality(*)
      `)
      .eq('prediction_id', predictionId)

    if (qualityError) {
      console.error('❌ Quality join error:', qualityError)
    } else {
      console.log(`✅ Quality join successful: ${qualityArgs.length} arguments found`)
    }

    // Test with agent_react_cycles join
    console.log('\n3. Testing with agent_react_cycles join...')
    const { data: reactArgs, error: reactError } = await supabase
      .from('arguments')
      .select(`
        *,
        agent_react_cycles!agent_react_cycles_argument_id_fkey(*)
      `)
      .eq('prediction_id', predictionId)

    if (reactError) {
      console.error('❌ React cycles join error:', reactError)
      console.error('Error details:', JSON.stringify(reactError, null, 2))
    } else {
      console.log(`✅ React cycles join successful: ${reactArgs.length} arguments found`)
      if (reactArgs.length > 0) {
        console.log('\nSample argument:')
        console.log('- ID:', reactArgs[0].id)
        console.log('- Author:', reactArgs[0].author_name)
        console.log('- Position:', reactArgs[0].position)
        console.log('- React cycles:', reactArgs[0].agent_react_cycles?.length || 0)
      }
    }

    // Test full query like API
    console.log('\n4. Testing full API query...')
    const { data: fullArgs, error: fullError } = await supabase
      .from('arguments')
      .select(`
        *,
        argument_quality(
          evidence_strength,
          logical_coherence,
          community_score
        ),
        agent_react_cycles!agent_react_cycles_argument_id_fkey(*)
      `)
      .eq('prediction_id', predictionId)

    if (fullError) {
      console.error('❌ Full query error:', fullError)
      console.error('Error details:', JSON.stringify(fullError, null, 2))
    } else {
      console.log(`✅ Full query successful: ${fullArgs.length} arguments found`)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testArgumentsAPI().catch(console.error)
