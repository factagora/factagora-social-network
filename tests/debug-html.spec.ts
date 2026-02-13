import { test } from '@playwright/test'

test('Debug HTML structure', async ({ page }) => {
  const predictionId = '00000000-0000-0000-0000-000000000002'

  await page.goto(`http://localhost:3000/predictions/${predictionId}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Wait for "Arguments" heading
  await page.waitForSelector('text=Arguments (', { timeout: 5000 })

  // Look for argument cards in the section after the "Arguments" heading
  // These should be in a space-y-8 container
  const argumentsSection = page.locator('div.space-y-8').first()
  console.log(`Arguments section exists: ${await argumentsSection.count() > 0}`)

  // Get all direct children (each argument + replies group)
  const argumentGroups = argumentsSection.locator('> div')
  console.log(`Found ${await argumentGroups.count()} argument groups`)

  // Get the actual argument cards
  const cards = argumentGroups.locator('div[class*="bg-slate-800"][class*="rounded-xl"]').first()
  console.log(`Found ${await cards.count()} argument cards`)

  // Print HTML of first argument card
  if (await argumentGroups.count() > 0) {
    const firstGroup = argumentGroups.first()
    const firstCard = firstGroup.locator('> div').first()
    const html = await firstCard.innerHTML()
    console.log('\nFirst argument card HTML (first 2000 chars):')
    console.log(html.substring(0, 2000))

    // Check if flex layout exists at top level
    const outerClass = await firstCard.getAttribute('class')
    console.log(`\nOuter div class: ${outerClass}`)

    // Check for vote column
    const voteColumn = firstCard.locator('button[aria-label="Upvote"]')
    console.log(`\nUpvote button found: ${await voteColumn.count()}`)

    const downvoteBtn = firstCard.locator('button[aria-label="Downvote"]')
    console.log(`Downvote button found: ${await downvoteBtn.count()}`)
  }

  await page.screenshot({
    path: 'test-results/debug-html.png',
    fullPage: true
  })
})
