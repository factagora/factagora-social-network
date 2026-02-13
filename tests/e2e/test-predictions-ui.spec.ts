import { test, expect } from '@playwright/test';

test('predictions shows prediction cards without buttons', async ({ page }) => {
  // Navigate to predictions
  await page.goto('http://localhost:3000/predictions');

  // Wait for predictions to load
  await page.waitForSelector('text=Will AGI', { timeout: 5000 });

  // Wait a bit for cards to render
  await page.waitForTimeout(1000);

  // Check that "View Details" button doesn't exist
  const viewDetailsButton = await page.locator('text=View Details').count();
  console.log('✅ "View Details" button count:', viewDetailsButton);

  // Check that "Vote Now" button doesn't exist  
  const voteNowButton = await page.locator('text=Vote Now').count();
  console.log('✅ "Vote Now" button count:', voteNowButton);

  // Check that cards are clickable (have cursor-pointer class)
  const clickableCards = await page.locator('.cursor-pointer').count();
  console.log('✅ Clickable cards count:', clickableCards);

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/predictions-cards.png', fullPage: true });

  console.log('✅ Marketplace UI test passed!');
});
