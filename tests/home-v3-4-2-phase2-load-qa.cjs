const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.4.2-phase2';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputRoot = path.resolve(__dirname, '../preview/home-v3.4.2-critical-css-phase2/load-qa');
const screenshotRoot = path.join(outputRoot, 'screenshots');
const sampleTimes = [0, 100, 300, 500, 1000, 2000, 3000];
const viewports = [{ width: 390, height: 844 }, { width: 360, height: 800 }];

fs.mkdirSync(screenshotRoot, { recursive: true });

function fail(results, condition, message) {
  if (condition) results.failures.push(message);
}

async function snapshot(page, elapsed) {
  return page.evaluate((sampleElapsed) => {
    const deferred = document.getElementById('homepageDeferredStyles');
    const hero = document.getElementById('inicio');
    const heading = document.querySelector('h1');
    const logo = document.querySelector('.brand-logo img');
    const heroBox = hero.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    const headingStyle = getComputedStyle(heading);
    return {
      elapsed: sampleElapsed,
      readyState: document.readyState,
      deferredMedia: deferred?.media,
      deferredApplied: deferred?.dataset.applied === 'true',
      criticalSheetPresent: Array.from(document.styleSheets).some((sheet) => sheet.href?.includes('homepage-critical.css')),
      hero: { x: heroBox.x, y: heroBox.y, width: heroBox.width, height: heroBox.height },
      heading: {
        x: headingBox.x, y: headingBox.y, width: headingBox.width, height: headingBox.height,
        opacity: headingStyle.opacity, visibility: headingStyle.visibility,
        fontFamily: headingStyle.fontFamily, fontSize: headingStyle.fontSize, lineHeight: headingStyle.lineHeight
      },
      logoReady: Boolean(logo?.complete && logo.naturalWidth > 0),
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      cls: (window.__phase2LayoutShifts || []).filter((entry) => !entry.hadRecentInput).reduce((sum, entry) => sum + entry.value, 0)
    };
  }, elapsed);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const results = { baseUrl, viewports: [], noScript: {}, failures: [] };

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 1.6 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      connectionType: 'cellular3g'
    });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const errors = [];
    await page.addInitScript(() => {
      sessionStorage.setItem('vitairos_intro_seen', '1');
      window.__phase2LayoutShifts = [];
      new PerformanceObserver((list) => window.__phase2LayoutShifts.push(...list.getEntries().map((entry) => ({ value: entry.value, hadRecentInput: entry.hadRecentInput })))).observe({ type: 'layout-shift', buffered: true });
    });
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    const startedAt = Date.now();
    const samples = [];
    for (const target of sampleTimes) {
      const remaining = target - (Date.now() - startedAt);
      if (remaining > 0) await page.waitForTimeout(remaining);
      const elapsed = Date.now() - startedAt;
      samples.push(await snapshot(page, elapsed));
      await page.screenshot({ path: path.join(screenshotRoot, `hero-${viewport.width}x${viewport.height}-${target}ms.png`) });
    }

    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(300);
    const afterIntent = await snapshot(page, Date.now() - startedAt);
    await page.screenshot({ path: path.join(screenshotRoot, `hero-${viewport.width}x${viewport.height}-after-intent.png`) });

    const first = samples[0];
    const initialNavigationCls = first.cls;
    const dimensionsStable = samples.every((sample) =>
      Math.abs(sample.hero.width - first.hero.width) <= 1 &&
      Math.abs(sample.hero.height - first.hero.height) <= 1 &&
      Math.abs(sample.heading.width - first.heading.width) <= 2 &&
      Math.abs(sample.heading.height - first.heading.height) <= 2
    );
    const label = `${viewport.width}x${viewport.height}`;
    results.viewports.push({ label, status: response?.status(), dimensionsStable, initialNavigationCls, samples, afterIntent, errors });
    fail(results, response?.status() !== 200, `${label}: HTTP ${response?.status()}`);
    fail(results, !dimensionsStable, `${label}: hero geometry changed during the 0-3000ms load window`);
    fail(results, samples.some((sample) => !sample.criticalSheetPresent || sample.deferredMedia !== 'print' || sample.deferredApplied), `${label}: stylesheet activation order changed before user intent`);
    fail(results, samples.some((sample) => sample.heading.opacity === '0' || sample.heading.visibility === 'hidden' || !sample.logoReady), `${label}: hidden hero content or logo during load`);
    fail(results, samples.some((sample) => sample.horizontalOverflow > 1 || sample.cls - initialNavigationCls > 0.001), `${label}: overflow or additional layout shift during the measured load window`);
    fail(results, afterIntent.deferredMedia !== 'all' || !afterIntent.deferredApplied, `${label}: deferred stylesheet did not activate on first scroll intent`);
    fail(results, afterIntent.horizontalOverflow > 1 || afterIntent.cls - initialNavigationCls > 0.001, `${label}: deferred activation caused overflow or additional layout shift`);
    fail(results, errors.length, `${label}: browser console error during load`);
    await context.close();
  }

  const noScriptContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javascriptEnabled: false });
  const noScriptPage = await noScriptContext.newPage();
  const noScriptCdp = await noScriptContext.newCDPSession(noScriptPage);
  await noScriptCdp.send('Emulation.setScriptExecutionDisabled', { value: true });
  const noScriptResponse = await noScriptPage.goto(baseUrl, { waitUntil: 'networkidle' });
  results.noScript = await noScriptPage.evaluate(() => {
    const hiddenReveals = Array.from(document.querySelectorAll('.reveal')).filter((element) => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && (style.visibility === 'hidden' || Number(style.opacity) === 0);
    }).map((element) => element.id || element.className);
    return {
      status: document.readyState,
      visible: hiddenReveals.length === 0,
      hiddenReveals,
      stylesheets: Array.from(document.styleSheets).map((sheet) => ({ href: sheet.href, media: sheet.media.mediaText })),
      deferredSheetPresent: Array.from(document.styleSheets).some((sheet) => sheet.href?.includes('homepage-deferred.css') && sheet.media.mediaText !== 'print'),
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
    };
  });
  results.noScript.httpStatus = noScriptResponse?.status();
  fail(results, results.noScript.httpStatus !== 200 || !results.noScript.visible || !results.noScript.deferredSheetPresent || results.noScript.horizontalOverflow > 1, 'No-script stylesheet fallback failed');

  fs.writeFileSync(path.join(outputRoot, 'load-qa-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  await noScriptContext.close();
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  if (results.failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
