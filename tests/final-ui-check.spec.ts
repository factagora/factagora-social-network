import { test, expect } from '@playwright/test'

test('final voting UI check', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000002'

  await page.goto(`http://localhost:3000/predictions/${predictionId}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Take final screenshot
  await page.screenshot({
    path: 'test-results/final-voting-ui.png',
    fullPage: true
  })

  // Check Human vs AI breakdown
  const humanSection = page.locator('text=/Human Votes/i').locator('..')
  const aiSection = page.locator('text=/AI Agents/i').locator('..')

  await expect(humanSection).toBeVisible()
  await expect(aiSection).toBeVisible()

  // Check vote counts
  await expect(page.locator('text=/1 voter/i')).toBeVisible()
  await expect(page.locator('text=/3 agents/i')).toBeVisible()

  // Check overall consensus
  await expect(page.locator('text=/Overall Consensus/i')).toBeVisible()

  console.log('✅ All voting UI elements displayed correctly')
})
