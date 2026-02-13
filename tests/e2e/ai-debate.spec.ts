import { test, expect } from '@playwright/test'

test.describe('AI Debate Feature', () => {
  const predictionId = '00000000-0000-0000-0000-000000000001'
  const predictionUrl = `http://localhost:3000/predictions/${predictionId}`

  test('should display Start AI Debate button and execute debate', async ({ page }) => {
    // Navigate to prediction page
    await page.goto(predictionUrl)

    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 })

    // Check if AI Debate section exists
    const debateSection = page.locator('text=AI Agent Debate').first()
    await expect(debateSection).toBeVisible()

    // Check if Start AI Debate button exists
    const startButton = page.locator('button:has-text("Start AI Debate")')
    await expect(startButton).toBeVisible()

    // Click the button
    await startButton.click()

    // Wait for loading state
    await expect(page.locator('text=Starting Debate...')).toBeVisible()

    // Wait for debate to complete (max 2 minutes)
    await expect(startButton).not.toBeVisible({ timeout: 120000 })

    // Check if agent cards are displayed
    const agentCards = page.locator('[class*="AgentArgumentCard"]')
    await expect(agentCards.first()).toBeVisible({ timeout: 10000 })

    // Check if we have 3 agent cards
    const cardCount = await agentCards.count()
    expect(cardCount).toBe(3)

    // Verify agent names
    await expect(page.locator('text=Skeptic Bot')).toBeVisible()
    await expect(page.locator('text=Optimist Bot')).toBeVisible()
    await expect(page.locator('text=Data Analyst Bot')).toBeVisible()

    // Check if positions are displayed (YES/NO/NEUTRAL)
    const positions = page.locator('text=/^(YES|NO|NEUTRAL)$/')
    await expect(positions.first()).toBeVisible()

    // Check if confidence is displayed
    await expect(page.locator('text=/\\d+%/')).toBeVisible()

    // Test ReAct cycle expansion
    const showThinkingButton = page.locator('button:has-text("Show Thinking Process")').first()
    await expect(showThinkingButton).toBeVisible()

    // Click to show thinking process
    await showThinkingButton.click()

    // Wait for ReAct cycle details to be visible
    await expect(page.locator('text=Stage 1: Initial Reasoning')).toBeVisible()
    await expect(page.locator('text=Stage 2: Actions')).toBeVisible()
    await expect(page.locator('text=Stage 3: Observations')).toBeVisible()
    await expect(page.locator('text=Stage 4: Synthesis')).toBeVisible()

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/ai-debate-complete.png', fullPage: true })
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Navigate to non-existent prediction
    await page.goto('http://localhost:3000/predictions/99999999-9999-9999-9999-999999999999')

    // Should show error message
    await expect(page.locator('text=/error|not found/i')).toBeVisible({ timeout: 10000 })
  })
})
