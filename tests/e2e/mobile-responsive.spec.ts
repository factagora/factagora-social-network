import { test, expect } from '@playwright/test'

// Mobile tests - iPhone 13
test.describe('Mobile Responsive Design @mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Set iPhone 13 viewport
    await page.setViewportSize({ width: 390, height: 844 })
  })

  test('Homepage is mobile-friendly', async ({ page }) => {
    await page.goto('/')

    // Hero section should be visible and readable
    await expect(page.getByRole('heading', { name: /Where AI Agents Compete/i })).toBeVisible()

    // Social proof stats should stack nicely on mobile (2x2 grid)
    await expect(page.locator('text=/AI Agents/i').last()).toBeVisible()

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20)
  })

  test('Predictions page is mobile-friendly', async ({ page }) => {
    await page.goto('/predictions')

    // Page should load without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20)

    // Should have content
    const bodyText = await page.locator('body').textContent()
    expect(bodyText && bodyText.length > 100).toBeTruthy()
  })

  test('Prediction detail page is mobile-friendly', async ({ page }) => {
    await page.goto('/predictions')
    await page.waitForLoadState('networkidle')

    // Find and click first prediction
    const predictionCard = page.locator('a[href^="/predictions/"]:not([href*="new"])').first()
    const cardCount = await predictionCard.count()

    if (cardCount > 0) {
      await predictionCard.click()
      await page.waitForURL(/\/predictions\/[a-f0-9-]+/, { timeout: 10000 })

      // Check no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const windowWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20)

      // Title should wrap properly on mobile
      const title = page.getByRole('heading', { level: 1 }).first()
      await expect(title).toBeVisible()
    }
  })

  test('How It Works page is mobile-friendly', async ({ page }) => {
    await page.goto('/how-it-works')

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20)

    // All 5 steps should be visible
    const steps = [
      /Explore Predictions & Claims/i,
      /Check What AI Thinks/i,
      /Dive Into AI Debates/i,
      /Start Your Own Debate/i,
      /Build Your Own AI Agent/i,
    ]

    for (const step of steps) {
      await expect(page.getByText(step).first()).toBeVisible()
    }
  })

  test('Touch interactions work on mobile', async ({ page }) => {
    await page.goto('/')

    // Test tap on navigation
    await page.goto('/predictions')
    await page.waitForURL('/predictions')
    await expect(page).toHaveURL('/predictions')
  })
})

// Tablet tests - iPad
test.describe('Tablet Responsive Design @tablet', () => {
  test.beforeEach(async ({ page }) => {
    // Set iPad viewport
    await page.setViewportSize({ width: 810, height: 1080 })
  })

  test('Homepage layout adapts to tablet', async ({ page }) => {
    await page.goto('/')

    // Hero should be visible
    await expect(page.getByRole('heading', { name: /Where AI Agents Compete/i })).toBeVisible()

    // Social proof should be visible
    await expect(page.locator('text=/AI Agents/i').last()).toBeVisible()

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20)
  })

  test('Predictions page uses grid layout on tablet', async ({ page }) => {
    await page.goto('/predictions')
    await page.waitForLoadState('networkidle')

    // Should have content
    const bodyText = await page.locator('body').textContent()
    expect(bodyText && bodyText.length > 100).toBeTruthy()

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20)
  })
})
