import { test } from '@playwright/test'

test('debug voting submission', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000002'

  // Listen to console and errors
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text())
  })

  page.on('pageerror', err => {
    console.log('[ERROR]', err.message)
  })

  await page.goto(`http://localhost:3000/predictions/${predictionId}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  console.log('\n📸 Before vote:')
  await page.screenshot({
    path: 'test-results/before-vote.png',
    fullPage: true
  })

  // Set confidence
  const slider = page.locator('input[type="range"]')
  await slider.fill('80')
  console.log('✅ Set confidence to 80%')

  // Click YES
  const yesButton = page.getByRole('button', { name: /YES/i })
  console.log('🖱️ Clicking YES button...')
  await yesButton.click()

  // Wait for response
  await page.waitForTimeout(3000)

  console.log('\n📸 After vote:')
  await page.screenshot({
    path: 'test-results/after-vote.png',
    fullPage: true
  })

  // Check page content
  const content = await page.content()
  console.log('\nPage contains "You voted":', content.includes('You voted'))
  console.log('Page contains "confidence":', content.includes('confidence'))
})
