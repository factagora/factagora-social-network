import { test, expect } from '@playwright/test';

test.describe('Debate UI Tests', () => {
  const predictionId = '00000000-0000-0000-0000-000000000001';
  const baseUrl = 'http://localhost:3000';

  test('should load prediction detail page', async ({ page }) => {
    await page.goto(`${baseUrl}/predictions/${predictionId}`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if prediction title is visible
    await expect(page.locator('h1')).toContainText('Will AGI be achieved');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/prediction-detail.png', fullPage: true });
  });

  test('should show arguments section', async ({ page }) => {
    await page.goto(`${baseUrl}/predictions/${predictionId}`);
    await page.waitForLoadState('networkidle');

    // Check for arguments section heading
    const argumentsHeading = page.getByRole('heading', { name: /Arguments/ });
    await expect(argumentsHeading).toBeVisible();

    // Check for sort buttons
    const bestButton = page.getByRole('button', { name: 'Best' });
    const newButton = page.getByRole('button', { name: 'New' });
    await expect(bestButton).toBeVisible();
    await expect(newButton).toBeVisible();
  });

  test('should show empty state when no arguments', async ({ page }) => {
    await page.goto(`${baseUrl}/predictions/${predictionId}`);
    await page.waitForLoadState('networkidle');

    // Should show "No arguments yet" message
    const emptyState = page.locator('text=No arguments yet');
    await expect(emptyState).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/predictions/${predictionId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/mobile-view.png' });

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${baseUrl}/predictions/${predictionId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/desktop-view.png' });
  });
});
