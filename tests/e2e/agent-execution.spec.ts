import { test, expect } from '@playwright/test'

test.describe('Agent Execution Test', () => {
  test('should create agent and execute prediction', async ({ page }) => {
    // Step 1: Navigate to home and login if needed
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Check if we need to login
    const isLoginPage = await page.locator('text=Sign in').isVisible().catch(() => false)
    if (isLoginPage) {
      console.log('⚠️ Login required - skipping test')
      test.skip()
      return
    }

    // Step 2: Navigate to agent registration
    console.log('📝 Step 1: Creating agent...')
    await page.goto('http://localhost:3000/agent/register')
    await page.waitForLoadState('networkidle')

    // Step 3: Fill in agent form - Select MANAGED mode
    const managedButton = page.locator('button:has-text("Managed Agent")')
    if (await managedButton.isVisible()) {
      await managedButton.click()
      await page.waitForTimeout(500)
    }

    // Fill in basic info
    await page.fill('input[name="name"]', 'Playwright Test Agent')
    await page.fill('textarea[name="description"]', 'Automated test agent for verification')

    // Click Next
    await page.click('button:has-text("다음")')
    await page.waitForTimeout(500)

    // Select personality (SKEPTIC)
    const skepticButton = page.locator('button:has-text("The Skeptic")')
    if (await skepticButton.isVisible()) {
      await skepticButton.click()
      await page.waitForTimeout(500)
    }

    // Click Next again
    const nextButtons = await page.locator('button:has-text("다음")').all()
    if (nextButtons.length > 0) {
      await nextButtons[nextButtons.length - 1].click()
      await page.waitForTimeout(500)
    }

    // Submit
    const submitButton = page.locator('button:has-text("Agent 등록")')
    if (await submitButton.isVisible()) {
      await submitButton.click()
      console.log('✅ Agent creation submitted')

      // Wait for success or error
      await page.waitForTimeout(2000)
    }

    // Step 4: Navigate to test page
    console.log('🧪 Step 2: Navigating to test page...')
    await page.goto('http://localhost:3000/test/agents')
    await page.waitForLoadState('networkidle')

    // Step 5: Click test button
    console.log('🚀 Step 3: Executing agents...')
    const testButton = page.locator('button:has-text("Run Test")')
    await expect(testButton).toBeVisible()
    await testButton.click()

    // Wait for execution (may take 5-10 seconds)
    console.log('⏳ Waiting for agent execution...')
    await page.waitForTimeout(15000) // Wait up to 15 seconds

    // Step 6: Check results
    console.log('📊 Step 4: Checking results...')

    // Check for error or success
    const hasError = await page.locator('text=Error').isVisible().catch(() => false)
    const hasResults = await page.locator('text=Execution Summary').isVisible().catch(() => false)

    if (hasError) {
      // Capture error details
      const errorText = await page.locator('.text-red-300, .text-red-400').first().textContent()
      console.error('❌ Execution failed with error:', errorText)

      // Take screenshot
      await page.screenshot({ path: 'test-results/agent-execution-error.png', fullPage: true })

      throw new Error(`Agent execution failed: ${errorText}`)
    }

    if (hasResults) {
      console.log('✅ Results found!')

      // Extract summary data
      const totalAgents = await page.locator('text=Total Agents').locator('..').locator('.text-2xl').textContent()
      const successful = await page.locator('text=Successful').locator('..').locator('.text-2xl').textContent()

      console.log(`📊 Summary:`)
      console.log(`  - Total Agents: ${totalAgents}`)
      console.log(`  - Successful: ${successful}`)

      // Check for agent results
      const agentResults = page.locator('text=Agent Results')
      await expect(agentResults).toBeVisible()

      // Take screenshot of success
      await page.screenshot({ path: 'test-results/agent-execution-success.png', fullPage: true })

      // Extract first agent result details
      const firstAgentName = await page.locator('.text-lg.font-bold.text-white').first().textContent()
      const firstAgentPosition = await page.locator('text=Position').locator('..').locator('span').first().textContent()

      console.log(`\n🤖 First Agent Result:`)
      console.log(`  - Name: ${firstAgentName}`)
      console.log(`  - Position: ${firstAgentPosition}`)

      expect(totalAgents).toBeTruthy()
      expect(successful).toBeTruthy()
    } else {
      console.error('❌ No results or error message found')
      await page.screenshot({ path: 'test-results/agent-execution-unknown.png', fullPage: true })
      throw new Error('No execution results found')
    }
  })
})
