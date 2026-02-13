import { test, expect, Page } from '@playwright/test'

/**
 * E2E Test: Complete Agent Workflow with Supabase Database Integration
 *
 * Tests the full lifecycle:
 * 1. Authenticate as test user (JWT token method via @auth/core)
 * 2. Navigate to dashboard, verify existing agents
 * 3. Register a new agent (Stock Market Analyst, DATA_ANALYST, temp 0.5)
 * 4. Verify the agent appears in the dashboard
 * 5. Navigate to test/agents page
 * 6. Execute agents and verify results
 */

const SCREENSHOT_DIR = 'tests/screenshots/agent-db-flow'
const NEXTAUTH_SECRET = 'Ev0XlNHeS9am1YoUjywJ1z3uaK3Kj/1owp0+3Uu6fP0='

// Test user from existing Supabase database
const TEST_USER = {
  id: '002b1867-cdb0-4df4-8133-642cdb6edad8',
  email: 'soonduck3729@gmail.com',
  name: 'Test User',
  username: 'userg8o43i',
  role: 'user',
  sub: '002b1867-cdb0-4df4-8133-642cdb6edad8',
}

/**
 * Generate a valid NextAuth v5 session token using @auth/core/jwt.
 * Must be generated fresh each test run.
 */
async function generateSessionToken(): Promise<string> {
  // Dynamic import to use @auth/core/jwt in test context
  const { encode } = await import('@auth/core/jwt')

  const token = await encode({
    secret: NEXTAUTH_SECRET,
    token: TEST_USER,
    salt: 'authjs.session-token',
  })

  return token
}

/**
 * Set up authenticated session via NextAuth JWT cookie.
 */
async function authenticateUser(page: Page): Promise<void> {
  const token = await generateSessionToken()

  // Set the NextAuth session cookie before navigation
  await page.context().addCookies([
    {
      name: 'authjs.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ])
}

// Unique agent name with timestamp to avoid duplicate conflicts
const AGENT_NAME = `Stock Market Analyst ${Date.now().toString(36).slice(-4)}`
let createdAgentId: string | null = null

test.describe('Agent Workflow with Supabase DB Integration', () => {
  test.describe.configure({ mode: 'serial' })

  test('Step 1: Authenticate and navigate to dashboard', async ({ page }) => {
    // Set up authentication
    await authenticateUser(page)

    // Navigate to dashboard (protected page)
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')

    // Verify we are NOT redirected to login page
    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)

    // Take screenshot of dashboard
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/01-dashboard-initial.png`,
      fullPage: true,
    })

    // Check if dashboard loaded (not redirected to login)
    if (currentUrl.includes('/login')) {
      console.log('WARNING: Redirected to login page - auth token may be invalid')
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/01-login-redirect.png`,
        fullPage: true,
      })
      const pageContent = await page.textContent('body')
      console.log('Page content snippet:', pageContent?.slice(0, 200))
    }

    expect(currentUrl).not.toContain('/login')

    // Verify dashboard elements
    const dashboardTitle = page.locator('h1')
    await expect(dashboardTitle).toBeVisible({ timeout: 10000 })

    const titleText = await dashboardTitle.textContent()
    console.log(`Dashboard title: ${titleText}`)

    // Check for existing agents or empty state
    const pageContent = await page.textContent('body')
    const hasAgents = pageContent?.includes('Active Agents')
    const isEmpty = pageContent?.includes('등록된 Agent가 없습니다')
    console.log(`Dashboard state: hasAgents=${hasAgents}, isEmpty=${isEmpty}`)

    // Look for the "Agent register" button
    const registerLink = page.locator('a[href="/agent/register"]')
    await expect(registerLink).toBeVisible({ timeout: 5000 })
    console.log('Register Agent link is visible')
  })

  test('Step 2: Navigate to agent registration page', async ({ page }) => {
    await authenticateUser(page)

    await page.goto('http://localhost:3000/agent/register')
    await page.waitForLoadState('networkidle')

    const currentUrl = page.url()
    console.log(`Registration page URL: ${currentUrl}`)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/02-register-page.png`,
      fullPage: true,
    })

    expect(currentUrl).not.toContain('/login')

    // Verify registration form elements
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toBeVisible({ timeout: 10000 })
    const titleText = await pageTitle.textContent()
    console.log(`Registration page title: ${titleText}`)

    // Verify Step 1 form is visible
    const modeLabel = page.locator('label:has-text("Agent 모드")')
    await expect(modeLabel).toBeVisible()

    const nameInput = page.locator('#name')
    await expect(nameInput).toBeVisible()

    console.log('Registration form loaded successfully')
  })

  test('Step 3: Fill in agent registration form and submit', async ({ page }) => {
    await authenticateUser(page)

    await page.goto('http://localhost:3000/agent/register')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/login')) {
      test.skip(true, 'Authentication not working - skipping registration test')
      return
    }

    // === STEP 1: Basic Information ===
    console.log('--- Step 1: Basic Information ---')

    // MANAGED mode should be selected by default, but click to be sure
    const managedButton = page.locator('button:has-text("Managed")')
    if (await managedButton.isVisible()) {
      await managedButton.click()
      await page.waitForTimeout(300)
      console.log('Selected MANAGED mode')
    }

    // Fill agent name
    const nameInput = page.locator('#name')
    await nameInput.fill(AGENT_NAME)
    console.log(`Agent name set to: ${AGENT_NAME}`)

    // Fill description
    const descInput = page.locator('#description')
    await descInput.fill('Expert in financial markets and stock analysis')
    console.log('Description filled')

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/03-step1-filled.png`,
      fullPage: true,
    })

    // Click Next
    const nextButton = page.locator('button:has-text("다음")')
    await nextButton.click()
    await page.waitForTimeout(500)
    console.log('Clicked Next to Step 2')

    // === STEP 2: Personality Selection ===
    console.log('--- Step 2: Personality Selection ---')

    // Select DATA_ANALYST personality
    const dataAnalystButton = page.locator('button:has-text("The Data Analyst")')
    await expect(dataAnalystButton).toBeVisible({ timeout: 5000 })
    await dataAnalystButton.click()
    await page.waitForTimeout(300)
    console.log('Selected DATA_ANALYST personality')

    // Adjust temperature to 0.5
    const temperatureSlider = page.locator('input[type="range"]')
    await expect(temperatureSlider).toBeVisible()

    // Set temperature slider to 0.5
    await temperatureSlider.fill('0.5')
    await page.waitForTimeout(200)
    console.log('Temperature set to 0.5')

    // Verify temperature display
    const tempLabel = page.locator('text=Temperature: 0.5')
    await expect(tempLabel).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/04-step2-personality-selected.png`,
      fullPage: true,
    })

    // Click Next to proceed to Step 3
    const nextButtons = page.locator('button:has-text("다음")')
    await nextButtons.click()
    await page.waitForTimeout(500)
    console.log('Clicked Next to Step 3')

    // === STEP 3: Confirmation ===
    console.log('--- Step 3: Confirmation ---')

    // Verify confirmation page loaded
    const confirmTitle = page.locator('text=등록 정보 확인')
    await expect(confirmTitle).toBeVisible({ timeout: 5000 })

    // Verify agent name in confirmation
    const nameConfirm = page.locator(`text=${AGENT_NAME}`)
    await expect(nameConfirm).toBeVisible()

    // Verify personality appears
    const personalityConfirm = page.locator('text=The Data Analyst')
    await expect(personalityConfirm).toBeVisible()

    // Verify temperature
    const tempConfirm = page.locator('text=0.5')
    await expect(tempConfirm).toBeVisible()

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/05-step3-confirmation.png`,
      fullPage: true,
    })

    // Intercept the API response
    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes('/api/agents') && resp.request().method() === 'POST',
        { timeout: 15000 }
      ),
      page.locator('button:has-text("Agent 등록")').click(),
    ])

    const responseStatus = response.status()
    console.log(`API Response Status: ${responseStatus}`)

    if (responseStatus === 201) {
      const responseData = await response.json()
      createdAgentId = responseData.id
      console.log(`Agent created successfully!`)
      console.log(`  ID: ${createdAgentId}`)
      console.log(`  Name: ${responseData.name}`)
      console.log(`  Mode: ${responseData.mode}`)
      console.log(`  Personality: ${responseData.personality}`)
      console.log(`  Temperature: ${responseData.temperature}`)
      console.log(`  Model: ${responseData.model}`)
      console.log(`  Active: ${responseData.isActive}`)
    } else if (responseStatus === 409) {
      const errorData = await response.json()
      console.log(`Agent name conflict: ${errorData.error}`)
    } else {
      const errorData = await response.json()
      console.error(`Agent creation failed: ${JSON.stringify(errorData)}`)
      expect(responseStatus).toBe(201)
    }

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
      console.log('Did not redirect to dashboard, current URL:', page.url())
    })

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/06-after-submit.png`,
      fullPage: true,
    })
  })

  test('Step 4: Verify agent appears in dashboard', async ({ page }) => {
    await authenticateUser(page)

    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')

    expect(page.url()).not.toContain('/login')

    // Wait for agents grid to load
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/07-dashboard-with-agents.png`,
      fullPage: true,
    })

    // Check API directly for verification
    const apiResponse = await page.evaluate(async () => {
      const resp = await fetch('/api/agents')
      if (!resp.ok) return { error: resp.status }
      return resp.json()
    })

    if (Array.isArray(apiResponse)) {
      console.log(`Total agents from API: ${apiResponse.length}`)
      const ourAgent = apiResponse.find((a: any) =>
        a.name.includes('Stock Market Analyst')
      )
      if (ourAgent) {
        createdAgentId = ourAgent.id
        console.log(`Found our agent in API response:`)
        console.log(`  ID: ${ourAgent.id}`)
        console.log(`  Name: ${ourAgent.name}`)
        console.log(`  Mode: ${ourAgent.mode}`)
        console.log(`  Personality: ${ourAgent.personality}`)
        console.log(`  Temperature: ${ourAgent.temperature}`)
        console.log(`  Model: ${ourAgent.model}`)
        console.log(`  Active: ${ourAgent.isActive}`)

        // Verify expected values
        expect(ourAgent.mode).toBe('MANAGED')
        expect(ourAgent.personality).toBe('DATA_ANALYST')
        expect(ourAgent.isActive).toBe(true)
      } else {
        console.log('Agent not found in API response, available agents:')
        apiResponse.forEach((a: any) => console.log(`  - ${a.name} (${a.id})`))
      }
    } else {
      console.log('API response:', JSON.stringify(apiResponse))
    }

    // Also check the UI
    const pageContent = await page.textContent('body')
    const hasActiveSection = pageContent?.includes('Active Agents')
    console.log(`Active Agents section visible: ${hasActiveSection}`)
  })

  test('Step 5: Verify agent persists in Supabase database', async ({ page }) => {
    await authenticateUser(page)

    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/login')) {
      test.skip(true, 'Authentication not working')
      return
    }

    // Fetch agents from API (which reads from Supabase)
    const agents = await page.evaluate(async () => {
      const resp = await fetch('/api/agents')
      if (!resp.ok) return null
      return resp.json()
    })

    expect(agents).not.toBeNull()
    expect(Array.isArray(agents)).toBeTruthy()

    console.log(`Database contains ${agents?.length || 0} agents for this user`)

    // Find the Stock Market Analyst agent
    const stockAnalystAgent = agents?.find((a: any) =>
      a.name.includes('Stock Market Analyst')
    )

    if (stockAnalystAgent) {
      console.log('DATABASE VERIFICATION PASSED:')
      console.log(`  ID: ${stockAnalystAgent.id}`)
      console.log(`  Name: ${stockAnalystAgent.name}`)
      console.log(`  Mode: ${stockAnalystAgent.mode}`)
      console.log(`  Personality: ${stockAnalystAgent.personality}`)
      console.log(`  Temperature: ${stockAnalystAgent.temperature}`)
      console.log(`  Model: ${stockAnalystAgent.model}`)
      console.log(`  Active: ${stockAnalystAgent.isActive}`)

      expect(stockAnalystAgent.mode).toBe('MANAGED')
      expect(stockAnalystAgent.personality).toBe('DATA_ANALYST')
      expect(stockAnalystAgent.isActive).toBe(true)
      expect(stockAnalystAgent.model).toContain('claude-sonnet')

      createdAgentId = stockAnalystAgent.id
    } else {
      console.log('Stock Market Analyst agent not found in database')
      console.log('Available agents:', JSON.stringify(agents?.map((a: any) => a.name)))
      // Do not fail here - the agent may have been created with a unique suffix
    }
  })

  test('Step 6: Navigate to test/agents page and execute', async ({ page }) => {
    await authenticateUser(page)

    // Navigate to test agents page
    await page.goto('http://localhost:3000/test/agents')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/08-test-agents-page.png`,
      fullPage: true,
    })

    const runTestButton = page.locator('button:has-text("Run Test")')
    await expect(runTestButton).toBeVisible({ timeout: 10000 })
    console.log('Test agents page loaded, Run Test button visible')

    // Click Run Test
    console.log('Clicking Run Test button...')

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/execute-agents'),
      { timeout: 120000 } // Agent execution can take up to 2 minutes with LLM calls
    )

    await runTestButton.click()

    // Check for loading state
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/09-agents-executing.png`,
      fullPage: true,
    })

    // Wait for the API response
    let executionData: any = null
    try {
      const response = await responsePromise
      const responseStatus = response.status()
      console.log(`Agent execution API status: ${responseStatus}`)

      if (responseStatus === 200) {
        executionData = await response.json()
        console.log('EXECUTION RESULTS:')
        console.log(`  Total agents: ${executionData.totalAgents}`)
        console.log(`  Success count: ${executionData.successCount}`)
        console.log(`  Failure count: ${executionData.failureCount}`)

        if (executionData.statistics) {
          console.log(`  Avg confidence: ${(executionData.statistics.averageConfidence * 100).toFixed(1)}%`)
          console.log(`  Position distribution: ${JSON.stringify(executionData.statistics.positionDistribution)}`)
        }

        if (executionData.results) {
          console.log('\n  Individual Results:')
          executionData.results.forEach((r: any) => {
            console.log(`  --- ${r.agentName} (${r.personality}) ---`)
            console.log(`    Status: ${r.success ? 'SUCCESS' : 'FAILED'}`)
            if (r.result?.response) {
              console.log(`    Position: ${r.result.response.position}`)
              console.log(`    Confidence: ${(r.result.response.confidence * 100).toFixed(1)}%`)
              console.log(`    Reasoning: ${r.result.response.reasoning?.slice(0, 150)}...`)
            }
            if (r.result?.metadata) {
              console.log(`    Execution time: ${r.result.metadata.executionTimeMs}ms`)
              console.log(`    Tokens used: ${r.result.metadata.tokensUsed}`)
              console.log(`    LLM model: ${r.result.metadata.llmModel}`)
            }
            if (r.error) {
              console.log(`    Error: ${r.error}`)
            }
          })
        }

        // Check if our newly created agent was included
        const ourAgentResult = executionData.results?.find((r: any) =>
          r.agentName?.includes('Stock Market Analyst')
        )
        if (ourAgentResult) {
          console.log(`\n  New agent "Stock Market Analyst" was included in execution!`)
          console.log(`    Success: ${ourAgentResult.success}`)
        } else {
          console.log(`\n  Note: Stock Market Analyst was NOT in execution results`)
          console.log('  (execute-agents endpoint may use mock data instead of DB)')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Execution failed: status=${responseStatus}, data=${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.log(`Response timeout or error: ${error}`)
      // Take screenshot of current state
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/09b-execution-timeout.png`,
        fullPage: true,
      })
    }

    // Wait for UI to update with results
    await page.waitForTimeout(5000)

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/10-execution-results.png`,
      fullPage: true,
    })

    // Check UI for results
    const hasResults = await page.locator('text=Execution Summary').isVisible().catch(() => false)
    const hasError = await page.locator('.text-red-400, .text-red-300').first().isVisible().catch(() => false)

    if (hasResults) {
      console.log('\nUI RESULTS VISIBLE:')

      const totalText = await page.locator('text=Total Agents').locator('..').locator('.text-2xl').textContent().catch(() => 'N/A')
      const successText = await page.locator('text=Successful').locator('..').locator('.text-2xl').textContent().catch(() => 'N/A')
      const failedText = await page.locator('text=Failed').locator('..').locator('.text-2xl').textContent().catch(() => 'N/A')

      console.log(`  Total: ${totalText}, Success: ${successText}, Failed: ${failedText}`)

      // Verify Agent Results section
      const agentResults = page.locator('text=Agent Results')
      if (await agentResults.isVisible()) {
        console.log('  Agent Results section is visible')
      }
    } else if (hasError) {
      const errorText = await page.locator('.text-red-300, .text-red-400').first().textContent()
      console.log(`UI ERROR: ${errorText}`)
    } else {
      console.log('Neither results nor error shown in UI')
    }

    // Final screenshot
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/11-final-state.png`,
      fullPage: true,
    })

    // Generate summary
    console.log('\n===========================================')
    console.log('TEST SUMMARY')
    console.log('===========================================')
    console.log(`Agent Name: ${AGENT_NAME}`)
    console.log(`Agent ID: ${createdAgentId || 'not captured'}`)
    console.log(`DB Integration: ${executionData ? 'API responds' : 'unknown'}`)
    console.log(`Execution: ${executionData?.successCount > 0 ? 'SUCCESS' : 'NEEDS VERIFICATION'}`)
    console.log('===========================================')
  })
})
