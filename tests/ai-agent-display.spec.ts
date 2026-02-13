import { test, expect } from '@playwright/test'

test.describe('AI Agent Display Test', () => {
  test('should display AI agent debates on AGI prediction page', async ({ page }) => {
    const predictionId = '00000000-0000-0000-0000-000000000001'

    // Capture console logs and errors
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`))
    page.on('pageerror', err => console.error(`PAGE ERROR: ${err.message}`))

    console.log(`\n🔍 Testing AGI prediction page...`)
    await page.goto(`http://localhost:3000/predictions/${predictionId}`, { waitUntil: 'domcontentloaded' })

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if AI Agent Analysis section exists
    const aiSectionExists = await page.locator('text=AI Agent Analysis').isVisible()
    console.log(`✓ AI Agent Analysis section visible: ${aiSectionExists}`)

    if (aiSectionExists) {
      // Check for agent count text
      const agentCountText = await page.locator('text=/\\d+ AI agent/').textContent()
      console.log(`✓ Agent count: ${agentCountText}`)

      // Find all agent cards
      const agentCards = await page.locator('.bg-slate-800.border.border-slate-700.rounded-xl.p-6').count()
      console.log(`✓ Found ${agentCards} agent cards`)

      // Check each agent card
      for (let i = 0; i < agentCards; i++) {
        const card = page.locator('.bg-slate-800.border.border-slate-700.rounded-xl.p-6').nth(i)

        // Get agent name
        const agentName = await card.locator('.text-lg.font-bold').first().textContent()
        console.log(`\n  Agent ${i + 1}: ${agentName}`)

        // Check for position badge
        const positionVisible = await card.locator('.px-3.py-1.rounded-lg.text-sm.font-semibold').isVisible()
        if (positionVisible) {
          const position = await card.locator('.px-3.py-1.rounded-lg.text-sm.font-semibold').textContent()
          console.log(`  Position: ${position}`)
        }

        // Check for confidence
        const confidenceVisible = await card.locator('text=/\\d+% confidence/').isVisible()
        if (confidenceVisible) {
          const confidence = await card.locator('text=/\\d+% confidence/').textContent()
          console.log(`  Confidence: ${confidence}`)
        }

        // Check for content
        const hasContent = await card.locator('.text-slate-300.leading-relaxed').isVisible()
        console.log(`  Has content: ${hasContent}`)

        // Check for ReAct cycle button
        const hasReactCycle = await card.locator('text=View ReAct Cycle').isVisible().catch(() => false)
        console.log(`  Has ReAct Cycle: ${hasReactCycle}`)
      }

      // Take screenshot
      await page.screenshot({ path: 'test-results/agi-prediction-page.png', fullPage: true })
      console.log(`\n📸 Screenshot saved: test-results/agi-prediction-page.png`)

    } else {
      console.log('❌ AI Agent Analysis section not found')
      await page.screenshot({ path: 'test-results/agi-prediction-page-error.png', fullPage: true })
    }

    expect(aiSectionExists).toBe(true)
  })

  test('should display AI agent debates on Tesla prediction page', async ({ page }) => {
    const predictionId = '00000000-0000-0000-0000-000000000002'

    console.log(`\n🔍 Testing Tesla prediction page...`)
    await page.goto(`http://localhost:3000/predictions/${predictionId}`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if AI Agent Analysis section exists
    const aiSectionExists = await page.locator('text=AI Agent Analysis').isVisible()
    console.log(`✓ AI Agent Analysis section visible: ${aiSectionExists}`)

    if (aiSectionExists) {
      // Check for agent count text
      const agentCountText = await page.locator('text=/\\d+ AI agent/').textContent()
      console.log(`✓ Agent count: ${agentCountText}`)

      // Find all agent cards
      const agentCards = await page.locator('.bg-slate-800.border.border-slate-700.rounded-xl.p-6').count()
      console.log(`✓ Found ${agentCards} agent cards`)

      // Check first agent card details
      if (agentCards > 0) {
        const firstCard = page.locator('.bg-slate-800.border.border-slate-700.rounded-xl.p-6').first()

        const agentName = await firstCard.locator('.text-lg.font-bold').first().textContent()
        console.log(`\n  First Agent: ${agentName}`)

        const positionVisible = await firstCard.locator('.px-3.py-1.rounded-lg.text-sm.font-semibold').isVisible()
        if (positionVisible) {
          const position = await firstCard.locator('.px-3.py-1.rounded-lg.text-sm.font-semibold').textContent()
          console.log(`  Position: ${position}`)
        }
      }

      // Take screenshot
      await page.screenshot({ path: 'test-results/tesla-prediction-page.png', fullPage: true })
      console.log(`\n📸 Screenshot saved: test-results/tesla-prediction-page.png`)

    } else {
      console.log('❌ AI Agent Analysis section not found')
      await page.screenshot({ path: 'test-results/tesla-prediction-page-error.png', fullPage: true })
    }

    expect(aiSectionExists).toBe(true)
  })

  test('should not display AI section on prediction without debates', async ({ page }) => {
    const predictionId = '00000000-0000-0000-0000-000000000003'

    console.log(`\n🔍 Testing Quantum prediction page (no debates)...`)
    await page.goto(`http://localhost:3000/predictions/${predictionId}`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if AI Agent Analysis section does NOT exist
    const aiSectionVisible = await page.locator('text=AI Agent Analysis').isVisible().catch(() => false)
    console.log(`✓ AI Agent Analysis section hidden: ${!aiSectionVisible}`)

    // Should still see prediction details
    const predictionTitleVisible = await page.locator('h1').isVisible()
    console.log(`✓ Prediction title visible: ${predictionTitleVisible}`)

    // Take screenshot
    await page.screenshot({ path: 'test-results/quantum-prediction-page.png', fullPage: true })
    console.log(`\n📸 Screenshot saved: test-results/quantum-prediction-page.png`)

    expect(aiSectionVisible).toBe(false)
    expect(predictionTitleVisible).toBe(true)
  })
})
