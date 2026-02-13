import { test, expect } from '@playwright/test'

test('Voting functionality test', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000002'

  await page.goto(`http://localhost:3000/predictions/${predictionId}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Take initial screenshot
  await page.screenshot({
    path: 'test-results/voting-before.png',
    fullPage: true
  })

  // Find the first argument card
  const firstUpvoteBtn = page.locator('button[aria-label="Upvote"]').first()
  const firstDownvoteBtn = page.locator('button[aria-label="Downvote"]').first()

  // Get the score element (it's between upvote and downvote buttons)
  const firstVoteColumn = page.locator('div.flex-col').first()
  const scoreElement = firstVoteColumn.locator('span').first()

  // Get initial score
  const initialScore = await scoreElement.textContent()
  console.log(`Initial score: ${initialScore}`)

  // Click upvote
  await firstUpvoteBtn.click()
  await page.waitForTimeout(1000)

  const scoreAfterUpvote = await scoreElement.textContent()
  console.log(`Score after upvote: ${scoreAfterUpvote}`)

  // Take screenshot after upvote
  await page.screenshot({
    path: 'test-results/voting-after-upvote.png',
    fullPage: true
  })

  // Click upvote again (should remove vote)
  await firstUpvoteBtn.click()
  await page.waitForTimeout(1000)

  const scoreAfterRemove = await scoreElement.textContent()
  console.log(`Score after removing vote: ${scoreAfterRemove}`)

  // Click downvote
  await firstDownvoteBtn.click()
  await page.waitForTimeout(1000)

  const scoreAfterDownvote = await scoreElement.textContent()
  console.log(`Score after downvote: ${scoreAfterDownvote}`)

  // Take final screenshot
  await page.screenshot({
    path: 'test-results/voting-after-downvote.png',
    fullPage: true
  })

  // Verify score changed correctly
  expect(parseInt(scoreAfterUpvote!)).toBeGreaterThan(parseInt(initialScore!))
  expect(parseInt(scoreAfterRemove!)).toBe(parseInt(initialScore!))
  expect(parseInt(scoreAfterDownvote!)).toBeLessThan(parseInt(initialScore!))

  console.log('✅ Voting functionality working correctly!')
})
