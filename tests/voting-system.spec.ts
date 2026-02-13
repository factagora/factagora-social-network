import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Voting System E2E Tests', () => {
  let predictionId: string

  test.beforeAll(async ({ request }) => {
    // Get first prediction
    const response = await request.get(`${BASE_URL}/api/predictions`)
    const predictions = await response.json()

    if (Array.isArray(predictions) && predictions.length > 0) {
      predictionId = predictions[0].id
      console.log(`Using prediction: ${predictionId} - ${predictions[0].title}`)
    } else {
      throw new Error('No predictions found')
    }
  })

  test('should display voting panel and consensus', async ({ page }) => {
    // Navigate to prediction detail page
    await page.goto(`${BASE_URL}/predictions/${predictionId}`)
    await page.waitForLoadState('networkidle')

    // Check voting panel exists
    await expect(page.getByText('Cast Your Vote')).toBeVisible()

    // Check vote buttons exist
    await expect(page.getByRole('button', { name: /YES/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /NEUTRAL/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /NO/i })).toBeVisible()

    // Check confidence slider exists
    await expect(page.locator('input[type="range"]')).toBeVisible()

    // Check consensus display exists
    await expect(page.getByText('Consensus')).toBeVisible()
  })

  test('should submit human vote', async ({ page }) => {
    await page.goto(`${BASE_URL}/predictions/${predictionId}`)
    await page.waitForLoadState('networkidle')

    // Set confidence to 80%
    const slider = page.locator('input[type="range"]')
    await slider.fill('80')

    // Click YES button
    const yesButton = page.getByRole('button', { name: /YES/i })
    await yesButton.click()

    // Wait for vote submission
    await page.waitForTimeout(2000)

    // Check success message or vote confirmation
    await expect(
      page.locator('text=/✅ You voted YES with.*confidence/i')
    ).toBeVisible({ timeout: 5000 })

    console.log('✅ Human vote submitted successfully')
  })

  test('should display consensus after voting', async ({ page }) => {
    await page.goto(`${BASE_URL}/predictions/${predictionId}`)
    await page.waitForLoadState('networkidle')

    // Wait for consensus to load
    await page.waitForTimeout(1000)

    // Check consensus display shows results
    const consensusSection = page.locator('text=/Consensus/i').locator('..')

    // Should show human votes
    await expect(consensusSection.locator('text=/Human/i')).toBeVisible()

    // Should show percentage
    await expect(consensusSection.locator('text=/%/i')).toBeVisible()

    console.log('✅ Consensus display working')
  })

  test('should trigger AI auto-voting via debate round', async ({ request }) => {
    console.log(`\n🤖 Testing AI auto-voting for prediction: ${predictionId}`)

    // Start debate round
    const response = await request.post(`${BASE_URL}/api/predictions/${predictionId}/start-debate`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    console.log('Debate response:', JSON.stringify(data, null, 2))

    expect(response.ok()).toBeTruthy()

    // Wait for debate to complete
    await new Promise(resolve => setTimeout(resolve, 30000)) // 30 seconds

    // Check if AI votes were created
    const votesResponse = await request.get(`${BASE_URL}/api/predictions/${predictionId}/votes`)
    const votesData = await votesResponse.json()

    console.log('Votes data:', JSON.stringify(votesData, null, 2))

    // Should have AI votes
    expect(votesData.consensus).toBeDefined()
    expect(votesData.consensus.aiVotes).toBeGreaterThan(0)

    console.log(`✅ AI votes: ${votesData.consensus.aiVotes}`)
    console.log(`✅ AI consensus: ${(votesData.consensus.aiConsensusYesPct * 100).toFixed(1)}% YES`)
  })

  test('should show separate Human vs AI breakdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/predictions/${predictionId}`)
    await page.waitForLoadState('networkidle')

    // Wait for consensus to load
    await page.waitForTimeout(2000)

    // Check Human votes section
    await expect(page.locator('text=/Human Votes/i')).toBeVisible()
    await expect(page.locator('text=/👤/i')).toBeVisible()

    // Check AI votes section
    await expect(page.locator('text=/AI Agents/i')).toBeVisible()
    await expect(page.locator('text=/🤖/i')).toBeVisible()

    // Check weight info
    await expect(
      page.locator('text=/Human votes are weighted more than AI/i')
    ).toBeVisible()

    console.log('✅ Human vs AI breakdown displayed correctly')
  })
})
