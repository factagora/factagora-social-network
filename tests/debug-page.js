const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/predictions/00000000-0000-0000-0000-000000000001');
  await page.waitForLoadState('networkidle');

  // Get page content
  const html = await page.content();
  console.log('\n=== PAGE HTML (first 2000 chars) ===');
  console.log(html.substring(0, 2000));

  // Get all text content
  const textContent = await page.evaluate(() => document.body.textContent);
  console.log('\n=== PAGE TEXT CONTENT ===');
  console.log(textContent);

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/debug-page.png', fullPage: true });
  console.log('\n✅ Screenshot saved to tests/screenshots/debug-page.png');

  await browser.close();
})();
