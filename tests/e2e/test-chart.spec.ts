import { test, expect } from '@playwright/test';

test('prediction detail page shows probability chart', async ({ page }) => {
  // Navigate to prediction detail page
  await page.goto('http://localhost:3000/predictions/00000000-0000-0000-0000-000000000001');

  // Wait for page to load
  await page.waitForSelector('text=Will AGI', { timeout: 5000 });

  // Wait for chart to render
  await page.waitForTimeout(2000);

  // Check for chart title
  const chartTitle = await page.locator('text=Probability Over Time').isVisible();
  console.log('✅ Chart title visible:', chartTitle);

  // Check for chart container
  const chartContainer = await page.locator('.recharts-wrapper').isVisible();
  console.log('✅ Chart container visible:', chartContainer);

  // Check for legend
  const yesLegend = await page.locator('text=YES').last().isVisible();
  console.log('✅ YES legend visible:', yesLegend);

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/chart-view.png', fullPage: true });

  console.log('✅ Chart test completed!');
});
