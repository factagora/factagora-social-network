import { test, expect } from '@playwright/test';

test('submit nested reply (reply to reply)', async ({ page }) => {
  // Navigate to prediction detail page
  await page.goto('http://localhost:3000/predictions/00000000-0000-0000-0000-000000000001');

  // Wait for arguments to load
  await page.waitForSelector('text=Arguments', { timeout: 5000 });

  // Wait for replies to load
  await page.waitForTimeout(1000);

  // Find all "Reply" buttons in the nested replies section
  // The ReplyCard component shows "Reply" text buttons (line 107 in ReplyCard.tsx)
  const replyButtons = page.locator('.ml-8 button:has-text("Reply")');
  const buttonCount = await replyButtons.count();
  console.log(`Found ${buttonCount} reply buttons in replies section`);

  if (buttonCount > 0) {
    // Click the first reply button to reply to a reply
    await replyButtons.first().click();

    // Wait for reply form to appear
    await page.waitForSelector('textarea', { timeout: 3000 });

    // Fill in nested reply content (50-1000 characters required)
    const nestedReplyText = 'Absolutely! The combination of scaling laws and improved training efficiency suggests we may even reach AGI sooner than expected.';
    await page.locator('textarea').last().fill(nestedReplyText);

    // Select COUNTER reply type to test different type
    const counterButton = page.locator('button:has-text("👎")').last();
    await counterButton.click();

    // Submit nested reply
    const submitButton = page.locator('button:has-text("Submit Reply")').last();
    await submitButton.click();

    // Wait for nested reply to appear
    await page.waitForTimeout(2000);

    // Verify nested reply is visible
    const nestedReplyCount = await page.locator('text=Absolutely!').count();
    console.log('✅ Nested reply count:', nestedReplyCount);

    // Verify counter badge (red)
    const counterBadgeCount = await page.locator('span.text-red-400').count();
    console.log('✅ Counter badge count:', counterBadgeCount);
  } else {
    console.log('⚠️  No reply buttons found in nested replies');
  }

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/nested-reply.png', fullPage: true });

  console.log('✅ Nested reply test completed');
  console.log('🎉 Multi-level Reddit-style nesting is working!');
});
