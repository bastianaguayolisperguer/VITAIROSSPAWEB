const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.4';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const root = path.resolve(__dirname, '../preview/home-v3.4-responsive-motion-rebuild');
const screenshots = path.join(root, 'screenshots');
const motion = path.join(root, 'motion-evidence');
const comparisons = path.join(root, 'before-after');
const breakpoints = [
  [1920, 1080], [1440, 900], [1366, 768], [1200, 800], [1024, 768],
  [768, 1024], [430, 932], [390, 844], [360, 800]
];

for (const directory of [root, screenshots, motion, comparisons]) {
  fs.mkdirSync(directory, { recursive: true });
}

function mkdir(name) {
  const directory = path.join(motion, name);
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

async function openPage(browser, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport, reducedMotion, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const failures = [];
  const badResponses = [];
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(420);
  return { context, page, errors, failures, badResponses };
}

async function settle(page) {
  const viewport = page.viewportSize() || { width: 1440, height: 900 };
  await page.mouse.move(viewport.width - 8, viewport.height - 8);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(160);
}

async function elementShot(page, selector, filename) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  await settle(page);
  await page.evaluate(() => {
    for (const element of [document.querySelector('header'), document.querySelector('.skip-link')]) {
      if (!element) continue;
      element.dataset.qaVisibility = element.style.visibility;
      element.style.visibility = 'hidden';
    }
  });
  await locator.screenshot({ path: path.join(screenshots, filename) });
  await page.evaluate(() => {
    for (const element of [document.querySelector('header'), document.querySelector('.skip-link')]) {
      if (!element) continue;
      element.style.visibility = element.dataset.qaVisibility || '';
      delete element.dataset.qaVisibility;
    }
  });
}

async function viewportShot(browser, viewport, filename, section) {
  const run = await openPage(browser, viewport);
  if (section) await run.page.locator(section).scrollIntoViewIfNeeded();
  await settle(run.page);
  if (section) await run.page.locator(section).screenshot({ path: path.join(screenshots, filename) });
  else await run.page.screenshot({ path: path.join(screenshots, filename) });
  await run.context.close();
}

async function frameSequence(page, selector, directory, count, delay) {
  const target = page.locator(selector);
  await target.scrollIntoViewIfNeeded();
  for (let index = 1; index <= count; index += 1) {
    await target.screenshot({ path: path.join(directory, `frame-${String(index).padStart(2, '0')}.png`) });
    await page.waitForTimeout(delay);
  }
}

function copyIfPresent(source, destination) {
  if (fs.existsSync(source)) fs.copyFileSync(source, destination);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const results = {
    baseUrl,
    branch: 'home-v3.4-responsive-motion-rebuild',
    breakpoints: [],
    interactions: {},
    responsive: {},
    accessibility: {},
    reducedMotion: {},
    browserErrors: [],
    failures: []
  };

  for (const [width, height] of breakpoints) {
    const run = await openPage(browser, { width, height });
    const audit = await run.page.evaluate(() => {
      const required = ['#inicio', '#soluciones', '#integracion', '#metodo', '#ecosistema', '#actualidad', '#nosotros', '#diagnostico'];
      const sections = required.map((selector) => {
        const element = document.querySelector(selector);
        const rect = element?.getBoundingClientRect();
        return { selector, exists: Boolean(element), width: rect?.width || 0, height: rect?.height || 0 };
      });
      const visibleTargets = Array.from(document.querySelectorAll('.value-option,.integration-component,.method-node__button'))
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return { label: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 48), width: rect.width, height: rect.height };
        });
      return {
        viewport: [window.innerWidth, window.innerHeight],
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        sections,
        h1Count: document.querySelectorAll('h1').length,
        duplicateIds: Array.from(document.querySelectorAll('[id]')).map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index),
        visibleTargets,
        problemTabs: document.querySelectorAll('.value-option').length,
        problemElements: document.querySelectorAll('.semantic-fragment,.semantic-core,.semantic-output').length,
        integrationComponents: document.querySelectorAll('.integration-component').length,
        methodStages: document.querySelectorAll('.method-node').length,
        methodMiniUniverses: document.querySelectorAll('.method-motion').length,
        sphere: (() => {
          const canvas = document.getElementById('vitairos-geo');
          const rect = canvas?.getBoundingClientRect();
          return { visible: Boolean(rect && rect.width > 0 && rect.height > 0), width: rect?.width || 0, height: rect?.height || 0 };
        })()
      };
    });
    results.breakpoints.push({ size: `${width}x${height}`, ...audit });
    if (audit.horizontalOverflow > 1) results.failures.push(`${width}x${height}: horizontal overflow ${audit.horizontalOverflow}px`);
    if (audit.h1Count !== 1) results.failures.push(`${width}x${height}: expected one h1, found ${audit.h1Count}`);
    if (audit.duplicateIds.length) results.failures.push(`${width}x${height}: duplicate ids ${audit.duplicateIds.join(', ')}`);
    if (audit.sections.some((section) => !section.exists || section.width < 1 || section.height < 1)) results.failures.push(`${width}x${height}: required section missing or collapsed`);
    if (!audit.sphere.visible) results.failures.push(`${width}x${height}: sphere canvas not visible`);
    if (audit.problemTabs !== 4 || audit.problemElements !== 6 || audit.integrationComponents !== 5 || audit.methodStages !== 4 || audit.methodMiniUniverses !== 0) {
      results.failures.push(`${width}x${height}: rebuilt visual inventory differs from specification`);
    }
    if (width <= 767 && audit.visibleTargets.some((target) => target.height < 43.5)) {
      results.failures.push(`${width}x${height}: interactive target below 44px`);
    }
    if (run.errors.length || run.failures.length || run.badResponses.length) {
      results.browserErrors.push({ size: `${width}x${height}`, errors: run.errors, requests: run.failures, responses: run.badResponses });
      results.failures.push(`${width}x${height}: browser console, request, or response error`);
    }
    await run.context.close();
  }

  const desktop = await openPage(browser, { width: 1440, height: 900 });
  const tablet = await openPage(browser, { width: 1024, height: 768 });
  const mobile = await openPage(browser, { width: 390, height: 844 });

  await viewportShot(browser, { width: 1920, height: 1080 }, '01-hero-desktop-1920x1080.png');
  await desktop.page.screenshot({ path: path.join(screenshots, '02-hero-desktop-1440x900.png') });
  await tablet.page.screenshot({ path: path.join(screenshots, '03-hero-tablet-1024x768.png') });
  await viewportShot(browser, { width: 768, height: 1024 }, '04-hero-tablet-768x1024.png');
  await viewportShot(browser, { width: 430, height: 932 }, '05-hero-mobile-430x932.png');
  await mobile.page.screenshot({ path: path.join(screenshots, '06-hero-mobile-390x844.png') });
  await viewportShot(browser, { width: 360, height: 800 }, '07-hero-mobile-360x800.png');

  await elementShot(desktop.page, '#soluciones', '08-problems-desktop.png');
  await elementShot(tablet.page, '#soluciones', '09-problems-tablet.png');
  await elementShot(mobile.page, '#soluciones', '10-problems-mobile.png');
  await elementShot(desktop.page, '#integracion', '11-integration-desktop.png');
  await elementShot(tablet.page, '#integracion', '12-integration-tablet.png');
  await elementShot(mobile.page, '#integracion', '13-integration-mobile.png');
  await elementShot(desktop.page, '#metodo', '14-method-desktop.png');
  await elementShot(tablet.page, '#metodo', '15-method-tablet.png');
  await elementShot(mobile.page, '#metodo', '16-method-mobile.png');
  await elementShot(desktop.page, '#ecosistema', '17-initiatives-desktop.png');
  await elementShot(mobile.page, '#ecosistema', '18-initiatives-mobile.png');
  await desktop.page.evaluate(() => window.scrollTo(0, 0));
  await desktop.page.screenshot({ path: path.join(screenshots, '19-full-desktop-1440.png'), fullPage: true });
  await tablet.page.evaluate(() => window.scrollTo(0, 0));
  await tablet.page.screenshot({ path: path.join(screenshots, '20-full-tablet-1024.png'), fullPage: true });
  await mobile.page.evaluate(() => window.scrollTo(0, 0));
  await mobile.page.screenshot({ path: path.join(screenshots, '21-full-mobile-390.png'), fullPage: true });

  const problemKeys = ['process', 'information', 'decisions', 'product'];
  results.interactions.problems = [];
  for (const [index, key] of problemKeys.entries()) {
    const button = desktop.page.locator(`[data-value="${key}"]`);
    await button.click();
    const state = await desktop.page.locator('#soluciones').getAttribute('data-value-active');
    const selected = await button.getAttribute('aria-selected');
    const title = await desktop.page.locator('#valueTitle').innerText();
    results.interactions.problems.push({ key, state, selected, title });
    if (state !== key || selected !== 'true' || !title.trim()) results.failures.push(`Problem state ${key} failed`);
    const directory = mkdir(`problems-desktop-${String(index + 1).padStart(2, '0')}-${key}`);
    await frameSequence(desktop.page, '.value-stage', directory, 4, 120);
  }
  const firstProblem = desktop.page.locator('[data-value="process"]');
  await firstProblem.focus();
  await firstProblem.press('ArrowRight');
  results.accessibility.problemArrowKey = await desktop.page.locator('#soluciones').getAttribute('data-value-active');
  if (results.accessibility.problemArrowKey !== 'information') results.failures.push('Problem tablist arrow-key navigation failed');

  const integrationKeys = ['ia', 'software', 'data', 'automation', 'integrations'];
  results.interactions.integration = [];
  for (const key of integrationKeys) {
    const button = desktop.page.locator(`[data-integration-key="${key}"]`);
    await button.click();
    const active = await desktop.page.locator('[data-integration-story]').getAttribute('data-integration-active');
    const pressed = await button.getAttribute('aria-pressed');
    const copy = await desktop.page.locator('#integrationDetailCopy').innerText();
    results.interactions.integration.push({ key, active, pressed, copy });
    if (active !== key || pressed !== 'true' || !copy.trim()) results.failures.push(`Integration state ${key} failed`);
    const directory = mkdir(`integration-desktop-${key}`);
    await frameSequence(desktop.page, '.integration-system', directory, 2, 220);
  }

  const methodButtons = desktop.page.locator('.method-node__button');
  results.interactions.method = [];
  for (let index = 0; index < 4; index += 1) {
    const button = methodButtons.nth(index);
    await button.click();
    const current = await desktop.page.locator('#methodNetwork').getAttribute('data-current-step');
    const pressed = await button.getAttribute('aria-pressed');
    results.interactions.method.push({ step: index + 1, current, pressed });
    if (current !== String(index + 1) || pressed !== 'true') results.failures.push(`Method state ${index + 1} failed`);
    await desktop.page.locator('#methodNetwork').screenshot({ path: path.join(mkdir('method-desktop'), `step-${index + 1}.png`) });
  }
  await methodButtons.nth(0).focus();
  await methodButtons.nth(0).press('ArrowRight');
  results.accessibility.methodArrowKey = await desktop.page.locator('#methodNetwork').getAttribute('data-current-step');
  if (results.accessibility.methodArrowKey !== '2') results.failures.push('Method arrow-key navigation failed');

  const ecosystemKeys = ['m', 'industrial', 'agro', 'conecta'];
  results.interactions.ecosystem = [];
  for (const key of ecosystemKeys) {
    await desktop.page.locator(`[data-ecosystem-item="${key}"] button`).click();
    const active = await desktop.page.locator('#ecosystemExperience').getAttribute('data-active-project');
    const copy = await desktop.page.locator('#ecosystemPreviewCopy').innerText();
    results.interactions.ecosystem.push({ key, active, copy });
    if (active !== key || !copy.trim()) results.failures.push(`Ecosystem state ${key} failed`);
  }

  await frameSequence(desktop.page, '#hbSphereWrap', mkdir('sphere-desktop-5s'), 12, 450);
  await frameSequence(mobile.page, '#hbSphereWrap', mkdir('sphere-mobile-5s'), 12, 450);
  for (const key of ['process', 'decisions', 'product']) {
    await mobile.page.locator(`[data-value="${key}"]`).click();
    await frameSequence(mobile.page, '.value-stage', mkdir(`problems-mobile-${key}`), 3, 140);
  }
  for (const key of ['ia', 'data', 'automation']) {
    await mobile.page.locator(`[data-integration-key="${key}"]`).click();
    await frameSequence(mobile.page, '.integration-system', mkdir(`integration-mobile-${key}`), 2, 180);
  }
  for (let index = 0; index < 4; index += 1) {
    await mobile.page.locator('.method-node__button').nth(index).click();
    await mobile.page.locator('#methodNetwork').screenshot({ path: path.join(mkdir('method-mobile'), `step-${index + 1}.png`) });
  }

  results.responsive = await Promise.all([desktop, tablet, mobile].map(async (run) => run.page.evaluate(() => {
    const problems = document.querySelector('.value-experience').getBoundingClientRect();
    const integration = document.querySelector('.integration-story').getBoundingClientRect();
    const method = document.querySelector('#methodNetwork').getBoundingClientRect();
    const ecosystem = document.querySelector('.ecosystem-experience').getBoundingClientRect();
    return {
      width: window.innerWidth,
      problems: { width: problems.width, height: problems.height },
      integration: { width: integration.width, height: integration.height },
      method: { width: method.width, height: method.height },
      ecosystem: { width: ecosystem.width, height: ecosystem.height },
      mobileContentFirst: window.innerWidth > 767 || document.querySelector('.value-stage__copy').getBoundingClientRect().bottom <= document.querySelector('.value-stage__diagram').getBoundingClientRect().top
    };
  })));
  if (results.responsive.some((item) => !item.mobileContentFirst)) results.failures.push('Mobile problems composition is not content-first');

  const reduced = await openPage(browser, { width: 1440, height: 900 }, 'reduce');
  results.reducedMotion = await reduced.page.evaluate(() => {
    const animationNames = ['.hb-sphere-wrap::before', '.semantic-signal', '.integration-pulse', '.method-traveller']
      .map((selector) => selector.includes('::') ? 'none' : getComputedStyle(document.querySelector(selector)).animationName);
    return {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      sphereFallback: document.getElementById('hbSphereWrap').classList.contains('fallback-only'),
      allProblemElementsVisible: Array.from(document.querySelectorAll('.semantic-fragment,.semantic-core,.semantic-output')).every((element) => {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
      }),
      integrationConnected: document.querySelector('.integration-story').classList.contains('is-connected'),
      methodStagesVisible: Array.from(document.querySelectorAll('.method-node')).every((element) => element.getClientRects().length > 0),
      animationNames
    };
  });
  if (!results.reducedMotion.mediaMatches || !results.reducedMotion.sphereFallback || !results.reducedMotion.allProblemElementsVisible || !results.reducedMotion.integrationConnected || !results.reducedMotion.methodStagesVisible) {
    results.failures.push('Reduced-motion state is incomplete');
  }

  for (const run of [desktop, tablet, mobile, reduced]) {
    if (run.errors.length || run.failures.length || run.badResponses.length) {
      results.browserErrors.push({ errors: run.errors, requests: run.failures, responses: run.badResponses });
      results.failures.push('Evidence run produced browser console, request, or response errors');
    }
  }

  const v33 = path.resolve(__dirname, '../preview/home-v3.3-commercial-clarity-motion');
  const comparisonSources = [
    ['sphere', path.join(v33, 'before/hero-sphere-before.png'), path.join(v33, 'after/hero-sphere-after.png'), path.join(screenshots, '02-hero-desktop-1440x900.png')],
    ['problems', path.join(v33, 'before/problem-visual-before.png'), path.join(v33, 'after/problem-visual-after.png'), path.join(screenshots, '08-problems-desktop.png')],
    ['integration', path.join(v33, 'before/integration-before.png'), path.join(v33, 'after/integration-after.png'), path.join(screenshots, '11-integration-desktop.png')],
    ['method', path.join(v33, 'before/method-before.png'), path.join(v33, 'after/method-after.png'), path.join(screenshots, '14-method-desktop.png')],
    ['mobile', path.resolve(__dirname, '../preview/homepage-v3-2-1-11-mobile-full.png'), path.join(v33, 'screenshots/17-full-mobile-390.png'), path.join(screenshots, '21-full-mobile-390.png')]
  ];
  for (const [name, v321, v33Image, v34] of comparisonSources) {
    const directory = path.join(comparisons, name);
    fs.mkdirSync(directory, { recursive: true });
    copyIfPresent(v321, path.join(directory, 'v3.2.1.png'));
    copyIfPresent(v33Image, path.join(directory, 'v3.3.png'));
    copyIfPresent(v34, path.join(directory, 'v3.4.png'));
  }

  fs.writeFileSync(path.join(root, 'qa-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  await Promise.all([desktop.context.close(), tablet.context.close(), mobile.context.close(), reduced.context.close()]);
  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  if (results.failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
