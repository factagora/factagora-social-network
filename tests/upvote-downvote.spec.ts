import { test, expect } from '@playwright/test'

test('Reddit-style upvote/downvote buttons', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000002'

  await page.goto(`http://localhost:3000/predictions/${predictionId}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Take screenshot
  await page.screenshot({
    path: 'test-results/upvote-downvote-ui.png',
    fullPage: true
  })

  // Check for upvote/downvote buttons in arguments
  const upvoteButtons = page.locator('button[aria-label="Upvote"]')
  const downvoteButtons = page.locator('button[aria-label="Downvote"]')

  console.log(`Found ${await upvoteButtons.count()} upvote buttons`)
  console.log(`Found ${await downvoteButtons.count()} downvote buttons`)

  // Should have at least one upvote/downvote button
  await expect(upvoteButtons.first()).toBeVisible()
  await expect(downvoteButtons.first()).toBeVisible()

  // Check score display
  const scoreElements = page.locator('text=/^\\d+$/').filter({ hasText: /^\d+$/ })
  console.log(`Found ${await scoreElements.count()} score elements`)

  console.log('✅ Upvote/Downvote buttons displayed!')
})
