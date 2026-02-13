// Test Anthropic API key directly
import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

async function testKey() {
  console.log('Testing Anthropic API key...\n')

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment')
    return
  }

  console.log('API Key found:', apiKey.substring(0, 20) + '...')

  const client = new Anthropic({ apiKey })

  // Try different models (updated to Claude 4.x models)
  const modelsToTry = [
    'claude-opus-4-6',
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-5', // Alias
    'claude-haiku-4-5-20251001',
    'claude-haiku-4-5', // Alias
  ]

  for (const model of modelsToTry) {
    console.log(`\nTrying model: ${model}`)
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      })

      console.log(`✅ SUCCESS! Model ${model} works!`)
      console.log('Response:', response.content[0].text)
      return // Success, no need to try more
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)
    }
  }

  console.log('\n❌ All models failed!')
}

testKey().catch(console.error)
