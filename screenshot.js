const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/calculator.png', fullPage: true });
  console.log('Screenshot saved to /tmp/calculator.png');
  await browser.close();
})();
