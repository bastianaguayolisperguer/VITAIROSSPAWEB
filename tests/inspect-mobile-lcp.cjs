const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const context = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75 });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__lcpEntries = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const element = entry.element;
        window.__lcpEntries.push({
          startTime: entry.startTime,
          renderTime: entry.renderTime,
          loadTime: entry.loadTime,
          size: entry.size,
          url: entry.url,
          tag: element && element.tagName,
          id: element && element.id,
          className: element && element.className && String(element.className),
          text: element && element.textContent && element.textContent.trim().slice(0, 140),
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto('http://127.0.0.1:4173/?preview=v3.4.2', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  console.log(JSON.stringify(await page.evaluate(() => window.__lcpEntries), null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
