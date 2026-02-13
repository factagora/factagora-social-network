import { test, expect } from '@playwright/test'

test.describe('AI Debate Feature - Simple Test', () => {
  const predictionId = '00000000-0000-0000-0000-000000000001'
  const predictionUrl = `http://localhost:3000/predictions/${predictionId}`

  test('should start AI debate and show results', async ({ page }) => {
    console.log('1. Navigating to prediction page...')
    await page.goto(predictionUrl)

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/01-page-loaded.png', fullPage: true })

    // Check if AI Debate section exists
    console.log('2. Looking for AI Agent Debate section...')
    await expect(page.locator('text=AI Agent Debate')).toBeVisible({ timeout: 10000 })

    // Check if Start AI Debate button exists
    console.log('3. Looking for Start AI Debate button...')
    const startButton = page.locator('button', { hasText: 'Start AI Debate' })
    await expect(startButton).toBeVisible()
    await page.screenshot({ path: 'test-results/02-before-click.png', fullPage: true })

    // Click the button
    console.log('4. Clicking Start AI Debate button...')
    await startButton.click()

    // Wait for loading state
    console.log('5. Waiting for debate to start...')
    await expect(page.locator('text=Starting Debate...')).toBeVisible()
    await page.screenshot({ path: 'test-results/03-debate-starting.png', fullPage: true })

    // Wait for debate to complete (max 2 minutes)
    console.log('6. Waiting for debate to complete (up to 2 minutes)...')
    await page.waitForTimeout(5000) // Initial wait

    // Check for agent names appearing (they should appear when debate completes)
    await expect(
      page.locator('text=Skeptic Bot').or(page.locator('text=Optimist Bot')).or(page.locator('text=Data Analyst Bot'))
    ).toBeVisible({ timeout: 120000 })

    console.log('7. Debate completed! Checking results...')
    await page.screenshot({ path: 'test-results/04-debate-complete.png', fullPage: true })

    // Verify at least one agent card is visible
    const hasSkeptic = await page.locator('text=Skeptic Bot').isVisible()
    const hasOptimist = await page.locator('text=Optimist Bot').isVisible()
    const hasAnalyst = await page.locator('text=Data Analyst Bot').isVisible()

    console.log(`Agents visible: Skeptic=${hasSkeptic}, Optimist=${hasOptimist}, Analyst=${hasAnalyst}`)

    // At least one should be visible
    expect(hasSkeptic || hasOptimist || hasAnalyst).toBeTruthy()

    // Check if positions are displayed
    const hasPositions = await page.locator('text=/^(YES|NO|NEUTRAL)$/').count()
    console.log(`Position badges found: ${hasPositions}`)
    expect(hasPositions).toBeGreaterThan(0)

    // Check if confidence is displayed
    const hasConfidence = await page.locator('text=/\\d+%/').count()
    console.log(`Confidence percentages found: ${hasConfidence}`)
    expect(hasConfidence).toBeGreaterThan(0)

    console.log('✅ Test passed!')
  })
})
