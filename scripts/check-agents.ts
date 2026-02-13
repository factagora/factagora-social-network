import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '../lib/supabase/client'

async function checkAgents() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
  
  console.log('Active agents:', data)
  console.log('Error:', error)
}

checkAgents().catch(console.error)
