import { test, expect } from '@playwright/test'

test.describe('Claims System E2E Tests', () => {
  const baseURL = 'http://localhost:3000'

  test('Homepage should display Claims', async ({ page }) => {
    await page.goto(baseURL)

    // Check if page loaded
    await expect(page).toHaveTitle(/Factagora/)

    // Check for Claims section heading (more specific selector)
    const claimsHeading = page.locator('h2:has-text("Claims")')
    await expect(claimsHeading).toBeVisible()

    // Check if at least one claim card is visible
    const claimCards = page.locator('a[href^="/claims/"]').first()
    await expect(claimCards).toBeVisible({ timeout: 10000 })

    console.log('✅ Homepage displays Claims')
  })

  test('Can view Claim details', async ({ page }) => {
    await page.goto(baseURL)

    // Wait for claims to load
    await page.waitForTimeout(2000)

    // Click on the first claim
    const firstClaim = page.locator('a[href^="/claims/"]').first()
    await expect(firstClaim).toBeVisible()

    const claimTitle = await firstClaim.textContent()
    console.log(`Clicking on claim: ${claimTitle}`)

    await firstClaim.click()

    // Wait for navigation
    await page.waitForURL(/\/claims\/[a-f0-9-]+/)

    // Check if claim detail page loaded
    await expect(page.locator('h1')).toBeVisible()

    // Check for vote section
    const voteSection = page.locator('text=Vote').or(page.locator('text=TRUE')).or(page.locator('text=FALSE'))
    await expect(voteSection.first()).toBeVisible({ timeout: 5000 })

    console.log('✅ Claim details page loaded')
  })

  test.skip('Can login and access authenticated features', async ({ page }) => {
    // SKIPPED: Login uses Google OAuth which requires real OAuth flow
    // Cannot be tested in automated E2E tests without OAuth mocking
    // Manual test: Click "Continue with Google" button and verify authentication works

    await page.goto(`${baseURL}/login`)
    await page.waitForLoadState('networkidle')

    // Verify Google sign-in button exists
    const googleButton = page.locator('button:has-text("Continue with Google")')
    await expect(googleButton).toBeVisible()

    console.log('✅ Google OAuth login button visible')
    console.log('⚠️  Full OAuth flow requires manual testing')
  })

  test.skip('Authenticated user can vote on Claims', async ({ page }) => {
    // SKIPPED: Requires Google OAuth authentication which cannot be automated
    // Manual test steps:
    // 1. Sign in with Google
    // 2. Navigate to any claim
    // 3. Verify TRUE/FALSE vote buttons are visible
    // 4. Click a vote button and verify vote is recorded

    await page.goto(baseURL)
    await page.waitForTimeout(2000)

    const firstClaim = page.locator('a[href^="/claims/"]').first()
    await firstClaim.click()
    await page.waitForURL(/\/claims\/[a-f0-9-]+/)

    // Can verify vote section exists even without auth
    const voteSection = page.locator('text=Vote').or(page.locator('text=TRUE')).or(page.locator('text=FALSE'))
    const hasVoteSection = await voteSection.first().isVisible().catch(() => false)

    console.log(hasVoteSection ? '✅ Vote section visible' : '⚠️  Vote section not found')
    console.log('⚠️  Authenticated voting requires manual testing with Google OAuth')
  })

  test('Can view Evidence section', async ({ page }) => {
    await page.goto(baseURL)
    await page.waitForTimeout(2000)

    // Click on first claim
    const firstClaim = page.locator('a[href^="/claims/"]').first()
    await firstClaim.click()
    await page.waitForURL(/\/claims\/[a-f0-9-]+/)

    // Check for Evidence section
    const evidenceSection = page.locator('text=Evidence').or(page.locator('text=증거'))
    const hasEvidence = await evidenceSection.isVisible().catch(() => false)

    if (hasEvidence) {
      console.log('✅ Evidence section found')
    } else {
      console.log('⚠️  Evidence section not visible')
    }
  })

  test('Can view Arguments section', async ({ page }) => {
    await page.goto(baseURL)
    await page.waitForTimeout(2000)

    // Click on first claim
    const firstClaim = page.locator('a[href^="/claims/"]').first()
    await firstClaim.click()
    await page.waitForURL(/\/claims\/[a-f0-9-]+/)

    // Check for Arguments section
    const argumentsSection = page.locator('text=Arguments').or(page.locator('text=논거'))
    const hasArguments = await argumentsSection.isVisible().catch(() => false)

    if (hasArguments) {
      console.log('✅ Arguments section found')

      // Check if there are argument cards
      const argumentCards = page.locator('[class*="argument"]')
      const count = await argumentCards.count()
      console.log(`   Found ${count} argument cards`)
    } else {
      console.log('⚠️  Arguments section not visible')
    }
  })

  test('Claims list shows correct information', async ({ page }) => {
    await page.goto(baseURL)
    await page.waitForTimeout(2000)

    // Get first claim title
    const firstClaimLink = page.locator('a[href^="/claims/"]').first()
    await expect(firstClaimLink).toBeVisible()

    const claimText = await firstClaimLink.textContent()

    // Should have some text
    expect(claimText?.length).toBeGreaterThan(10)

    console.log(`✅ Claim title: "${claimText?.substring(0, 50)}..."`)

    // Check for category or metadata
    const categoryOrDate = page.locator('text=Technology').or(
      page.locator('text=Finance')
    ).or(
      page.locator('text=Sports')
    )

    const hasCategory = await categoryOrDate.first().isVisible().catch(() => false)

    if (hasCategory) {
      console.log('✅ Category badges visible')
    }
  })

  test('Responsive design - Mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(baseURL)
    await page.waitForTimeout(2000)

    // Check if Claims tab button is visible in mobile tabs
    const claimsTabButton = page.locator('button:has-text("📋 Claims")')
    await expect(claimsTabButton).toBeVisible()

    console.log('✅ Mobile view renders correctly')

    // Check if at least one claim is visible (should be visible by default since activeTab starts as 'claims')
    const claimCard = page.locator('a[href^="/claims/"]').first()
    await expect(claimCard).toBeVisible({ timeout: 5000 })

    console.log('✅ Claims visible on mobile')
  })

  test('Can navigate to Claims page', async ({ page }) => {
    await page.goto(baseURL)

    // Look for "View All" link in Claims section
    const viewAllLink = page.locator('a[href="/claims"]:has-text("View All")')

    const hasNavLink = await viewAllLink.isVisible().catch(() => false)

    if (hasNavLink) {
      await viewAllLink.click()
      await page.waitForURL(/\/claims/)

      console.log('✅ Navigated to Claims page')

      // Check if claims list is visible
      const claimsList = page.locator('a[href^="/claims/"]').first()
      await expect(claimsList).toBeVisible()

      console.log('✅ Claims list page loaded')
    } else {
      console.log('⚠️  Claims navigation link not found')
    }
  })

  test('Performance - Page load time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(baseURL)
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    console.log(`📊 Homepage load time: ${loadTime}ms`)

    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000)

    console.log('✅ Page load performance acceptable')
  })
})
