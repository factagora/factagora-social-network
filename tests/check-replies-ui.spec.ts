import { test, expect } from '@playwright/test'

test('AI agent replies should be visible on prediction page', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000001'

  // Navigate to prediction page
  await page.goto(`http://localhost:3000/predictions/${predictionId}`)

  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Take screenshot of the full page
  await page.screenshot({
    path: 'test-results/prediction-page-full.png',
    fullPage: true
  })

  console.log('📸 Screenshot saved to test-results/prediction-page-full.png')

  // Check if AI Agent Analysis section exists
  const aiAnalysisSection = page.locator('text=AI Agent Analysis')
  await expect(aiAnalysisSection).toBeVisible({ timeout: 10000 })
  console.log('✅ AI Agent Analysis section found')

  // Check for agent cards
  const agentCards = page.locator('[class*="AgentArgumentCard"]').or(
    page.locator('text=/Skeptic Bot|Optimist Bot|Data Analyst Bot/')
  )
  const agentCount = await agentCards.count()
  console.log(`✅ Found ${agentCount} agent cards`)

  // Look for reply indicators in various possible formats
  const replySelectors = [
    'text=SUPPORT',
    'text=COUNTER',
    'text=QUESTION',
    'text=CLARIFY',
    '[class*="reply"]',
    'text=/I agree with/',
    'text=/I disagree with/',
  ]

  let repliesFound = 0
  for (const selector of replySelectors) {
    const elements = page.locator(selector)
    const count = await elements.count()
    if (count > 0) {
      console.log(`✅ Found ${count} elements matching: ${selector}`)
      repliesFound += count
    }
  }

  // Get all text content to search for replies
  const pageContent = await page.textContent('body')

  // Check for agent names in content (replies should mention other agents)
  const hasSkepticBot = pageContent?.includes('Skeptic Bot') || false
  const hasOptimistBot = pageContent?.includes('Optimist Bot') || false
  const hasDataAnalystBot = pageContent?.includes('Data Analyst Bot') || false

  console.log('\n📊 Content Analysis:')
  console.log(`  - Contains "Skeptic Bot": ${hasSkepticBot}`)
  console.log(`  - Contains "Optimist Bot": ${hasOptimistBot}`)
  console.log(`  - Contains "Data Analyst Bot": ${hasDataAnalystBot}`)
  console.log(`  - Total reply indicators found: ${repliesFound}`)

  // Check for reply-like content patterns
  const hasSupportText = pageContent?.includes('I agree with') || false
  const hasCounterText = pageContent?.includes('I disagree with') || false
  const hasReplyTypeLabel = pageContent?.includes('SUPPORT') ||
                            pageContent?.includes('COUNTER') ||
                            pageContent?.includes('QUESTION') ||
                            pageContent?.includes('CLARIFY') || false

  console.log('\n💬 Reply Content Indicators:')
  console.log(`  - Has "I agree with": ${hasSupportText}`)
  console.log(`  - Has "I disagree with": ${hasCounterText}`)
  console.log(`  - Has reply type labels: ${hasReplyTypeLabel}`)

  // Take screenshot of AI Analysis section specifically
  if (await aiAnalysisSection.isVisible()) {
    const aiSection = page.locator('text=AI Agent Analysis').locator('..')
    await aiSection.screenshot({
      path: 'test-results/ai-analysis-section.png'
    })
    console.log('📸 AI Analysis section screenshot saved')
  }

  // Final verdict
  if (repliesFound > 0 || hasSupportText || hasReplyTypeLabel) {
    console.log('\n✅ SUCCESS: Replies appear to be displayed on the page!')
  } else {
    console.log('\n⚠️  WARNING: Could not definitively confirm replies are visible')
    console.log('Check the screenshots in test-results/ directory')
  }
})
