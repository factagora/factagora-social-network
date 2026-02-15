import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateBitcoinPrediction() {
  const predictionId = 'f4db8cc1-e430-4cb9-968c-8adc79e12f00'
  const bitcoinAssetId = 'dcc9d1db-5a06-4717-b29c-404ca21eec90'

  console.log(`Updating prediction ${predictionId} to link Bitcoin asset ${bitcoinAssetId}...`)

  const { data, error } = await supabase
    .from('predictions')
    .update({ timeseries_asset_id: bitcoinAssetId })
    .eq('id', predictionId)
    .select()

  if (error) {
    console.error('Error updating prediction:', error)
    process.exit(1)
  }

  console.log('✅ Prediction updated successfully!')
  console.log('Updated data:', data)
}

updateBitcoinPrediction()
