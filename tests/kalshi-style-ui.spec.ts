import { test } from '@playwright/test'

test('Kalshi-style prediction cards', async ({ page }) => {
  // Home page
  await page.goto('http://localhost:3000/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  await page.screenshot({
    path: 'test-results/kalshi-home.png',
    fullPage: true
  })

  console.log('✅ Home page screenshot captured')

  // Predictions page
  await page.goto('http://localhost:3000/predictions')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  await page.screenshot({
    path: 'test-results/kalshi-predictions.png',
    fullPage: true
  })

  console.log('✅ Predictions page screenshot captured')
})
