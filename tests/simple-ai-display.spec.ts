import { test, expect } from '@playwright/test'

test('AI Agent display visual test', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000001'

  console.log(`\n🔍 Testing AGI prediction page...`)

  // Navigate to page
  await page.goto(`http://localhost:3000/predictions/${predictionId}`)
  await page.waitForLoadState('networkidle')

  // Wait a bit for any client-side rendering
  await page.waitForTimeout(2000)

  // Check if AI section exists
  const aiSectionVisible = await page.locator('text=AI Agent Analysis').isVisible()
  console.log(`✓ AI Agent Analysis visible: ${aiSectionVisible}`)

  if (aiSectionVisible) {
    // Check agent count
    const hasAgentCount = await page.locator('text=/\\d+ AI agent/').isVisible()
    console.log(`✓ Has agent count text: ${hasAgentCount}`)

    // Check for agent names
    const hasSkeptic = await page.locator('text=Skeptic Bot').isVisible()
    const hasOptimist = await page.locator('text=Optimist Bot').isVisible()
    const hasAnalyst = await page.locator('text=Data Analyst Bot').isVisible()

    console.log(`✓ Skeptic Bot visible: ${hasSkeptic}`)
    console.log(`✓ Optimist Bot visible: ${hasOptimist}`)
    console.log(`✓ Data Analyst Bot visible: ${hasAnalyst}`)

    // Check for position badges
    const hasPosition = await page.locator('text=/YES|NO|NEUTRAL/').first().isVisible()
    console.log(`✓ Position badge visible: ${hasPosition}`)

    // Check for confidence
    const hasConfidence = await page.locator('text=/\\d+% confidence/').first().isVisible()
    console.log(`✓ Confidence visible: ${hasConfidence}`)
  }

  // Take full page screenshot
  await page.screenshot({
    path: 'test-results/ai-agent-display-full.png',
    fullPage: true
  })
  console.log(`\n📸 Screenshot saved: test-results/ai-agent-display-full.png`)

  expect(aiSectionVisible).toBe(true)
})
