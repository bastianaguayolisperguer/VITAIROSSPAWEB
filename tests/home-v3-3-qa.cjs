const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.3';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputRoot = path.resolve(__dirname, '../preview/home-v3.3-commercial-clarity-motion');
const screenshotsDir = path.join(outputRoot, 'screenshots');
const afterDir = path.join(outputRoot, 'after');
const motionDir = path.join(outputRoot, 'motion-evidence');
const breakpoints = [
  [1920, 1080], [1440, 900], [1366, 768], [1024, 768],
  [768, 1024], [430, 932], [390, 844], [360, 800]
];

for (const directory of [outputRoot, screenshotsDir, afterDir, motionDir]) {
  fs.mkdirSync(directory, { recursive: true });
}

async function readyPage(browser, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport, reducedMotion, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
  const consoleErrors = [];
  const requestFailures = [];
  const badResponses = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => requestFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(450);
  return { context, page, consoleErrors, requestFailures, badResponses };
}

async function movePointerAway(page) {
  const viewport = page.viewportSize() || { width: 1440, height: 900 };
  await page.mouse.move(viewport.width - 8, viewport.height - 8);
}

async function capture(page, selector, filename, hideChrome = false) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  await movePointerAway(page);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  if (hideChrome) {
    await page.evaluate(() => {
      const header = document.querySelector('header');
      const skip = document.querySelector('.skip-link');
      if (header) header.dataset.qaVisibility = header.style.visibility;
      if (skip) skip.dataset.qaVisibility = skip.style.visibility;
      if (header) header.style.visibility = 'hidden';
      if (skip) skip.style.visibility = 'hidden';
    });
  }
  await page.waitForTimeout(180);
  await locator.screenshot({ path: path.join(screenshotsDir, filename) });
  if (hideChrome) {
    await page.evaluate(() => {
      const header = document.querySelector('header');
      const skip = document.querySelector('.skip-link');
      if (header) header.style.visibility = header.dataset.qaVisibility || '';
      if (skip) skip.style.visibility = skip.dataset.qaVisibility || '';
    });
  }
}

async function selectValue(page, key) {
  await page.locator(`[data-value="${key}"]`).click();
  await movePointerAway(page);
  await page.waitForTimeout(580);
}

async function reachMethodStep(page, expected) {
  const metrics = await page.locator('#methodNetwork').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: rect.height, viewportHeight: window.innerHeight };
  });
  const progress = expected === 4 ? .94 : (expected - .5) / 4;
  const targetY = metrics.top - (metrics.viewportHeight * .75 - progress * metrics.height * .72);
  await page.evaluate((target) => window.scrollTo(0, Math.max(0, target)), targetY);
  await page.waitForTimeout(120);
  return Number(await page.locator('#methodNetwork').getAttribute('data-active-step') || 0);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const results = { baseUrl, breakpoints: [], interaction: {}, reducedMotion: {}, failures: [] };

  for (const [width, height] of breakpoints) {
    const run = await readyPage(browser, { width, height });
    const layout = await run.page.evaluate(() => {
      const required = ['#inicio', '#soluciones', '#integracion', '#metodo', '#ecosistema', '#actualidad', '#nosotros', '#diagnostico'];
      const boxes = required.map((selector) => {
        const element = document.querySelector(selector);
        const rect = element?.getBoundingClientRect();
        return { selector, exists: Boolean(element), width: rect?.width || 0, height: rect?.height || 0 };
      });
      return {
        viewport: [window.innerWidth, window.innerHeight],
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        boxes,
        h1Count: document.querySelectorAll('h1').length,
        duplicateIds: Array.from(document.querySelectorAll('[id]')).map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index)
      };
    });
    const item = {
      size: `${width}x${height}`,
      layout,
      consoleErrors: run.consoleErrors,
      requestFailures: run.requestFailures,
      badResponses: run.badResponses
    };
    results.breakpoints.push(item);
    if (layout.horizontalOverflow > 1) results.failures.push(`${width}x${height}: horizontal overflow ${layout.horizontalOverflow}px`);
    if (layout.h1Count !== 1) results.failures.push(`${width}x${height}: expected one h1, found ${layout.h1Count}`);
    if (layout.duplicateIds.length) results.failures.push(`${width}x${height}: duplicate ids ${layout.duplicateIds.join(', ')}`);
    if (layout.boxes.some((box) => !box.exists || box.width < 1 || box.height < 1)) results.failures.push(`${width}x${height}: a required section is missing or collapsed`);
    if (run.consoleErrors.length || run.requestFailures.length || run.badResponses.length) results.failures.push(`${width}x${height}: browser errors or failed requests`);
    await run.context.close();
  }

  const desktop = await readyPage(browser, { width: 1440, height: 900 });
  await desktop.page.screenshot({ path: path.join(screenshotsDir, '01-hero-desktop-1440x900.png') });
  await desktop.page.locator('#hbSphereWrap').screenshot({ path: path.join(screenshotsDir, '02-hero-sphere-close-up.png') });
  await desktop.page.locator('#hbSphereWrap').screenshot({ path: path.join(afterDir, 'hero-sphere-after.png') });
  for (let index = 1; index <= 3; index += 1) {
    await desktop.page.waitForTimeout(320);
    await desktop.page.locator('#hbSphereWrap').screenshot({ path: path.join(motionDir, `sphere-frame-${index}.png`) });
  }

  const mobile = await readyPage(browser, { width: 390, height: 844 });
  await mobile.page.screenshot({ path: path.join(screenshotsDir, '03-hero-mobile-390x844.png') });

  const valueScreens = [
    ['process', '04-process-state.png'],
    ['information', '05-information-state.png'],
    ['decisions', '06-decisions-state.png'],
    ['product', '07-product-state.png']
  ];
  for (const [key, filename] of valueScreens) {
    await selectValue(desktop.page, key);
    const active = await desktop.page.locator('#soluciones').getAttribute('data-value-active');
    const pressed = await desktop.page.locator(`[data-value="${key}"]`).getAttribute('aria-pressed');
    if (active !== key || pressed !== 'true') results.failures.push(`Value state ${key} did not activate correctly`);
    await capture(desktop.page, '.value-stage', filename);
    await desktop.page.locator('.value-stage').screenshot({ path: path.join(motionDir, `problem-${key}.png`) });
  }
  await selectValue(desktop.page, 'process');
  await desktop.page.locator('.value-stage').screenshot({ path: path.join(afterDir, 'problem-visual-after.png') });

  const integration = desktop.page.locator('.integration-story');
  await integration.scrollIntoViewIfNeeded();
  const integrationBox = await integration.boundingBox();
  if (integrationBox) {
    await desktop.page.screenshot({ path: path.join(motionDir, 'integration-frame-1.png'), clip: integrationBox });
    await desktop.page.waitForTimeout(420);
    await desktop.page.screenshot({ path: path.join(motionDir, 'integration-frame-2.png'), clip: integrationBox });
    await desktop.page.waitForTimeout(900);
  }
  await integration.screenshot({ path: path.join(screenshotsDir, '08-integration-system.png') });
  await integration.screenshot({ path: path.join(afterDir, 'integration-after.png') });
  if (integrationBox) await desktop.page.screenshot({ path: path.join(motionDir, 'integration-frame-3.png'), clip: integrationBox });
  results.interaction.integrationConnected = await integration.evaluate((element) => element.classList.contains('is-connected'));
  if (!results.interaction.integrationConnected) results.failures.push('Integration story never reached connected state');

  const methodScreens = [
    [1, '09-method-diagnosis.png'], [2, '10-method-pilot.png'],
    [3, '11-method-implementation.png'], [4, '12-method-scaling.png']
  ];
  for (const [step, filename] of methodScreens) {
    const reached = await reachMethodStep(desktop.page, step);
    results.interaction[`methodStep${step}`] = reached;
    if (reached !== step && !(step === 4 && reached >= 4)) results.failures.push(`Method step ${step} could not be isolated; reached ${reached}`);
    await desktop.page.locator('#methodNetwork').screenshot({ path: path.join(screenshotsDir, filename) });
    fs.copyFileSync(path.join(screenshotsDir, filename), path.join(motionDir, `method-frame-${step}.png`));
  }
  await desktop.page.locator('.method-section .container').screenshot({ path: path.join(afterDir, 'method-after.png') });

  await capture(desktop.page, '.ecosystem-section', '13-initiatives-desktop.png', true);
  await desktop.page.locator('.ecosystem-experience').screenshot({ path: path.join(afterDir, 'ecosystem-after.png') });
  const ecosystemStates = ['m', 'industrial', 'agro', 'conecta'];
  results.interaction.ecosystem = [];
  for (const key of ecosystemStates) {
    await desktop.page.locator(`[data-ecosystem-item="${key}"] button`).click();
    await movePointerAway(desktop.page);
    await desktop.page.waitForTimeout(120);
    results.interaction.ecosystem.push({
      key,
      active: await desktop.page.locator('#ecosystemExperience').getAttribute('data-active-project'),
      copy: await desktop.page.locator('#ecosystemPreviewCopy').innerText()
    });
  }
  if (results.interaction.ecosystem.some((item) => item.active !== item.key || !item.copy.trim())) results.failures.push('One or more ecosystem states failed');

  await capture(desktop.page, '.principles-section', '14-principles.png', true);
  await capture(desktop.page, '.news-section', '15-vitairos-in-motion.png', true);
  await desktop.page.evaluate(() => window.scrollTo(0, 0));
  await desktop.page.waitForTimeout(120);
  await desktop.page.screenshot({ path: path.join(screenshotsDir, '16-full-desktop-1440.png'), fullPage: true });
  await mobile.page.evaluate(() => window.scrollTo(0, 0));
  await mobile.page.screenshot({ path: path.join(screenshotsDir, '17-full-mobile-390.png'), fullPage: true });

  const reduced = await readyPage(browser, { width: 1440, height: 900 }, 'reduce');
  await reduced.page.locator('.integration-story').scrollIntoViewIfNeeded();
  await reduced.page.waitForTimeout(80);
  results.reducedMotion = await reduced.page.evaluate(() => {
    const sphere = document.getElementById('hbSphereWrap');
    const integration = document.querySelector('.integration-story');
    const fragments = Array.from(document.querySelectorAll('.semantic-fragment')).every((element) => {
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    return {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      sphereFallback: sphere?.classList.contains('fallback-only') || false,
      integrationConnected: integration?.classList.contains('is-connected') || false,
      semanticFragmentsVisible: fragments,
      bodyTextVisible: document.body.innerText.includes('IA integrada en un proceso o producto que cumple una función concreta.')
    };
  });
  if (!Object.values(results.reducedMotion).every(Boolean)) results.failures.push('Reduced motion final state is incomplete');

  for (const run of [desktop, mobile, reduced]) {
    if (run.consoleErrors.length || run.requestFailures.length || run.badResponses.length) {
      results.failures.push('Screenshot/reduced-motion run produced browser errors or failed requests');
    }
  }

  fs.writeFileSync(path.join(outputRoot, 'qa-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  await Promise.all([desktop.context.close(), mobile.context.close(), reduced.context.close()]);
  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  if (results.failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
