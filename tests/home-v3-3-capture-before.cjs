const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/';
const outputDir = path.resolve(__dirname, '../preview/home-v3.3-commercial-clarity-motion/before');

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const captures = [
    ['#hbSphereWrap', 'hero-sphere-before.png'],
    ['.value-stage', 'problem-visual-before.png'],
    ['.capability-note', 'integration-before.png'],
    ['.method-section .container', 'method-before.png'],
    ['.ecosystem-experience', 'ecosystem-before.png']
  ];

  for (const [selector, filename] of captures) {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await locator.screenshot({ path: path.join(outputDir, filename) });
  }

  await browser.close();
  console.log(`Captured ${captures.length} baseline screenshots in ${outputDir}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
