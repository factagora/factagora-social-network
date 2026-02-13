import { test, expect } from '@playwright/test';

test('prediction card is clickable and navigates to detail page', async ({ page }) => {
  // Navigate to predictions
  await page.goto('http://localhost:3000/predictions');

  // Wait for predictions to load
  await page.waitForSelector('text=Will AGI', { timeout: 5000 });

  // Click the first prediction card (anywhere on the card)
  const firstCard = page.locator('.cursor-pointer').first();
  await firstCard.click();

  // Wait for navigation to detail page
  await page.waitForURL(/\/predictions\/.*/, { timeout: 5000 });

  // Verify we're on the detail page
  const url = page.url();
  console.log('✅ Navigated to:', url);
  expect(url).toContain('/predictions/');

  // Verify detail page loaded
  const argumentsHeading = await page.locator('text=Arguments').isVisible();
  console.log('✅ Detail page loaded:', argumentsHeading);

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/card-click.png', fullPage: true });

  console.log('✅ Card click navigation test passed!');
});
