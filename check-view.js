// Check if prediction_consensus view exists and has data
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkView() {
  // Try to query the view without filters
  console.log('=== Checking prediction_consensus view ===')
  const { data, error } = await supabase
    .from('prediction_consensus')
    .select('*')
    .limit(5)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${data?.length || 0} rows in prediction_consensus view`)
    if (data && data.length > 0) {
      console.log('Sample row:', JSON.stringify(data[0], null, 2))
    }
  }

  // Check if our prediction_id appears at all
  const predictionId = '6fe4477f-4408-4869-bd18-c2b0e8a9adad'
  console.log(`\n=== Looking for prediction ${predictionId} ===`)
  const { data: specificData, error: specificError } = await supabase
    .from('prediction_consensus')
    .select('*')
    .eq('prediction_id', predictionId)

  if (specificError) {
    console.error('Error:', specificError)
  } else {
    console.log(`Found ${specificData?.length || 0} rows for this prediction`)
    if (specificData && specificData.length > 0) {
      console.log('Data:', JSON.stringify(specificData[0], null, 2))
    }
  }
}

checkView().catch(console.error)
