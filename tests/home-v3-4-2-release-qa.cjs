const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.4.2';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputRoot = path.resolve(__dirname, '../preview/home-v3.4.2-production-release');
const screenshots = path.join(outputRoot, 'screenshots');
const viewports = [
  [1920, 1080], [1440, 900], [1366, 768], [1200, 800], [1024, 768],
  [768, 1024], [430, 932], [390, 844], [360, 800]
];
const problemKeys = ['process', 'information', 'decisions', 'product'];
const integrationKeys = ['ia', 'software', 'data', 'automation', 'integrations'];
const ecosystemKeys = ['m', 'industrial', 'agro', 'conecta'];

fs.mkdirSync(screenshots, { recursive: true });

async function openPage(browser, viewport, reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  const badResponses = [];
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => requestFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(260);
  return { context, page, responseStatus: response?.status(), consoleErrors, requestFailures, badResponses };
}

async function settle(page) {
  const viewport = page.viewportSize();
  await page.mouse.move(viewport.width - 8, viewport.height - 8);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(120);
}

async function sectionShot(page, selector, file) {
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await settle(page);
  await section.screenshot({ path: file });
}

function fail(results, condition, message) {
  if (condition) results.failures.push(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const results = {
    baseUrl,
    branch: 'home-v3.4.1-commercial-interaction-fix',
    approvedSha: 'cbbb413e736e0f9d3b26a90d56d6a8d5bda21254',
    logoAsset: '/vitairos-m/assets/vitairos-m-isotype-transparent.png',
    viewports: [],
    interactions: {},
    reducedMotion: {},
    forms: {},
    failures: []
  };

  for (const [width, height] of viewports) {
    const run = await openPage(browser, { width, height });
    for (const selector of ['#brecha', '#integracion', '#metodo', '#ecosistema', '#actualidad', '#nosotros', '#diagnostico', 'footer']) {
      const section = run.page.locator(selector);
      if (await section.count() && await section.isVisible()) {
        await section.scrollIntoViewIfNeeded();
        await run.page.waitForTimeout(80);
      }
    }
    await run.page.waitForLoadState('networkidle');
    await run.page.evaluate(() => window.scrollTo(0, 0));
    await run.page.waitForTimeout(120);
    const metrics = await run.page.evaluate(() => {
      const requiredSections = ['#inicio', '#brecha', '#integracion', '#metodo', '#ecosistema', '#actualidad', '#nosotros', '#diagnostico', 'footer'];
      const logo = document.querySelector('.ecosystem-signature__project[data-signature-project="m"] img');
      const mark = logo?.closest('.ecosystem-signature__mark');
      const logoBox = logo?.getBoundingClientRect();
      const markBox = mark?.getBoundingClientRect();
      const ids = Array.from(document.querySelectorAll('[id]')).map((element) => element.id);
      const visibleInteractive = Array.from(document.querySelectorAll('a,button,input,select,textarea'))
        .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      return {
        viewport: [window.innerWidth, window.innerHeight],
        status: document.readyState,
        horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        missingSections: requiredSections.filter((selector) => {
          const element = document.querySelector(selector);
          const box = element?.getBoundingClientRect();
          return !box || box.width < 1 || box.height < 1;
        }),
        brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth < 1).map((image) => image.currentSrc || image.src),
        duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
        clippedLabels: Array.from(document.querySelectorAll('.integration-capability b,.integration-application b,.initiative-step small'))
          .filter((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
          .map((element) => element.textContent.trim().replace(/\s+/g, ' ').slice(0, 70)),
        hiddenReveals: Array.from(document.querySelectorAll('.reveal:not(.is-visible)'))
          .map((element) => element.id || element.className).slice(0, 12),
        logo: logo ? {
          src: new URL(logo.currentSrc || logo.src, document.baseURI).pathname,
          naturalWidth: logo.naturalWidth,
          naturalHeight: logo.naturalHeight,
          renderedWidth: logoBox.width,
          renderedHeight: logoBox.height,
          objectFit: getComputedStyle(logo).objectFit,
          filter: getComputedStyle(mark).filter,
          opacity: getComputedStyle(mark).opacity,
          contained: logoBox.left >= markBox.left - 1 && logoBox.top >= markBox.top - 1 && logoBox.right <= markBox.right + 1 && logoBox.bottom <= markBox.bottom + 1
        } : null,
        inventory: {
          problems: document.querySelectorAll('.value-option').length,
          integrations: document.querySelectorAll('[data-integration-key]').length,
          method: document.querySelectorAll('.method-node__button').length,
          initiatives: document.querySelectorAll('[data-ecosystem-item]').length
        },
        h1Count: document.querySelectorAll('h1').length
      };
    });

    const label = `${width}x${height}`;
    results.viewports.push({ label, responseStatus: run.responseStatus, ...metrics, consoleErrors: run.consoleErrors, requestFailures: run.requestFailures, badResponses: run.badResponses });
    fail(results, run.responseStatus !== 200, `${label}: HTTP ${run.responseStatus}`);
    fail(results, metrics.horizontalOverflow > 1, `${label}: horizontal overflow ${metrics.horizontalOverflow}px`);
    fail(results, metrics.missingSections.length, `${label}: missing/collapsed sections ${metrics.missingSections.join(', ')}`);
    fail(results, metrics.brokenImages.length, `${label}: broken images ${metrics.brokenImages.join(', ')}`);
    fail(results, metrics.duplicateIds.length, `${label}: duplicate IDs ${metrics.duplicateIds.join(', ')}`);
    fail(results, metrics.clippedLabels.length, `${label}: clipped labels ${metrics.clippedLabels.join(' | ')}`);
    fail(results, metrics.hiddenReveals.length, `${label}: reveal elements stayed hidden ${metrics.hiddenReveals.join(' | ')}`);
    fail(results, !metrics.logo, `${label}: VITAIROS-M logo missing`);
    if (metrics.logo) {
      fail(results, metrics.logo.src !== results.logoAsset, `${label}: wrong logo asset ${metrics.logo.src}`);
      fail(results, metrics.logo.naturalWidth !== 166 || metrics.logo.naturalHeight !== 166, `${label}: official isotype dimensions changed`);
      fail(results, metrics.logo.renderedWidth < 39 || metrics.logo.renderedHeight < 47, `${label}: logo rendered too small ${metrics.logo.renderedWidth}x${metrics.logo.renderedHeight}`);
      fail(results, metrics.logo.objectFit !== 'contain' || !metrics.logo.contained, `${label}: logo aspect/containment failure`);
      fail(results, metrics.logo.filter !== 'none', `${label}: logo colors altered by CSS filter ${metrics.logo.filter}`);
      fail(results, metrics.logo.opacity !== '1', `${label}: logo opacity altered ${metrics.logo.opacity}`);
    }
    fail(results, Object.values(metrics.inventory).some((count) => count < 4), `${label}: interactive inventory incomplete`);
    fail(results, metrics.h1Count !== 1, `${label}: expected one H1, found ${metrics.h1Count}`);
    fail(results, run.consoleErrors.length || run.requestFailures.length || run.badResponses.length, `${label}: browser console/request error`);

    await sectionShot(run.page, '#ecosystemSignature', path.join(screenshots, `logo-${width}x${height}.png`));
    if ([390, 360].includes(width)) {
      const mobileSections = [
        ['brecha', '#brecha'], ['integracion', '#integracion'], ['metodo', '#metodo'],
        ['ecosistema', '#ecosistema'], ['actualidad', '#actualidad'], ['nosotros', '#nosotros'], ['diagnostico', '#diagnostico']
      ];
      for (const [sectionLabel, selector] of mobileSections) {
        await sectionShot(run.page, selector, path.join(screenshots, `${sectionLabel}-${width}x${height}.png`));
      }
      await run.page.evaluate(() => window.scrollTo(0, 0));
      await settle(run.page);
      await run.page.screenshot({ path: path.join(screenshots, `hero-${width}x${height}.png`) });
    }
    if ([1440, 1024].includes(width)) {
      await run.page.evaluate(() => window.scrollTo(0, 0));
      await run.page.screenshot({ path: path.join(screenshots, `full-${width}x${height}.png`), fullPage: true });
    }
    await run.context.close();
  }

  const interactionRun = await openPage(browser, { width: 1440, height: 900 });
  const page = interactionRun.page;
  results.interactions.problems = [];
  for (const key of problemKeys) {
    const button = page.locator(`[data-value="${key}"]`);
    await button.click();
    const state = await page.locator('#soluciones').getAttribute('data-value-active');
    const selected = await button.getAttribute('aria-selected');
    results.interactions.problems.push({ key, state, selected });
    fail(results, state !== key || selected !== 'true', `Problem interaction failed: ${key}`);
  }
  await page.locator('[data-value="process"]').focus();
  await page.locator('[data-value="process"]').press('ArrowRight');
  results.interactions.problemKeyboard = await page.locator('#soluciones').getAttribute('data-value-active');
  fail(results, results.interactions.problemKeyboard !== 'information', 'Problem arrow-key navigation failed');

  results.interactions.integration = [];
  for (const key of integrationKeys) {
    const button = page.locator(`[data-integration-key="${key}"]`);
    await button.click();
    const state = await page.locator('[data-integration-story]').getAttribute('data-integration-active');
    const selected = await button.getAttribute('aria-selected');
    results.interactions.integration.push({ key, state, selected });
    fail(results, state !== key || selected !== 'true', `Integration interaction failed: ${key}`);
  }
  await page.locator('[data-integration-key="ia"]').focus();
  await page.locator('[data-integration-key="ia"]').press('ArrowRight');
  results.interactions.integrationKeyboard = await page.locator('[data-integration-story]').getAttribute('data-integration-active');
  fail(results, results.interactions.integrationKeyboard !== 'software', 'Integration arrow-key navigation failed');

  results.interactions.method = [];
  for (let index = 0; index < 4; index += 1) {
    const button = page.locator('.method-node__button').nth(index);
    await button.click();
    const state = await page.locator('#methodNetwork').getAttribute('data-current-step');
    results.interactions.method.push({ step: index + 1, state });
    fail(results, state !== String(index + 1), `Method interaction failed: ${index + 1}`);
  }

  results.interactions.ecosystem = [];
  for (const key of ecosystemKeys) {
    const button = page.locator(`[data-ecosystem-item="${key}"] button`);
    await button.click();
    const state = await page.locator('#ecosystemExperience').getAttribute('data-active-project');
    const expanded = await button.getAttribute('aria-expanded');
    results.interactions.ecosystem.push({ key, state, expanded });
    fail(results, state !== key || expanded !== 'true', `Ecosystem interaction failed: ${key}`);
  }
  await page.locator('[data-ecosystem-item="m"] button').focus();
  await page.locator('[data-ecosystem-item="m"] button').press('ArrowDown');
  results.interactions.ecosystemKeyboard = await page.locator('#ecosystemExperience').getAttribute('data-active-project');
  fail(results, results.interactions.ecosystemKeyboard !== 'industrial', 'Ecosystem arrow-key navigation failed');

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const touchPage = await touchContext.newPage();
  await touchPage.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
  await touchPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await touchPage.locator('[data-value="decisions"]').tap();
  await touchPage.locator('[data-integration-key="automation"]').tap();
  await touchPage.locator('[data-ecosystem-item="conecta"] button').tap();
  results.interactions.touch = await touchPage.evaluate(() => ({
    problem: document.querySelector('#soluciones').dataset.valueActive,
    integration: document.querySelector('[data-integration-story]').dataset.integrationActive,
    ecosystem: document.querySelector('#ecosystemExperience').dataset.activeProject
  }));
  fail(results, results.interactions.touch.problem !== 'decisions' || results.interactions.touch.integration !== 'automation' || results.interactions.touch.ecosystem !== 'conecta', 'Touch interaction audit failed');

  const focusAudit = await page.evaluate(() => {
    const first = document.querySelector('[data-value="process"]');
    first.focus();
    const style = getComputedStyle(first);
    return { focused: document.activeElement === first, outline: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  results.interactions.focusVisible = focusAudit;
  fail(results, !focusAudit.focused || focusAudit.outline === 'none' || focusAudit.outlineWidth === '0px', 'Visible focus audit failed');

  const reducedRun = await openPage(browser, { width: 390, height: 844 }, 'reduce');
  results.reducedMotion = await reducedRun.page.evaluate(() => ({
    mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    sphereFallback: document.getElementById('hbSphereWrap').classList.contains('fallback-only'),
    contentVisible: ['#inicio', '#soluciones', '#integracion', '#metodo', '#ecosistema', '#diagnostico'].every((selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return element.getClientRects().length > 0 && style.visibility !== 'hidden' && Number(style.opacity) > 0;
    }),
    layoutWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
  }));
  fail(results, !results.reducedMotion.mediaMatches || !results.reducedMotion.sphereFallback || !results.reducedMotion.contentVisible || results.reducedMotion.layoutWidth > 391, 'Reduced-motion audit failed');

  results.forms.corporate = await page.evaluate(() => {
    const form = document.getElementById('diagnosticForm');
    const fields = Array.from(form.elements).filter((field) => field.name).map((field) => ({ name: field.name, type: field.type, required: field.required, value: field.value }));
    return { action: form.action, method: form.method, fields, consentRequired: form.elements.privacy_consent.required, privacyVersion: form.elements.privacy_version.value };
  });
  const mRun = await openPage(browser, { width: 1440, height: 900 });
  await mRun.page.goto(new URL('/vitairos-m/', baseUrl).href, { waitUntil: 'networkidle' });
  results.forms.vitairosM = await mRun.page.evaluate(() => Array.from(document.querySelectorAll('[data-demand-form]')).map((form) => ({
    leadType: form.dataset.leadType,
    action: form.action,
    method: form.method,
    consentRequired: form.elements.privacy_consent.required,
    privacyVersion: form.elements.privacy_version.value,
    consentPurpose: form.elements.consent_purpose.value,
    requiredFields: Array.from(form.elements).filter((field) => field.required).map((field) => field.name),
    payloadKeys: Array.from(new FormData(form).keys())
  })));
  const acceptedEndpoints = ['https://formsubmit.co/contacto@vitairos.com', 'https://formsubmit.co/ad98029d0911b7910c2e4691f4fdd8f6'];
  fail(results, !acceptedEndpoints.includes(results.forms.corporate.action) || results.forms.corporate.method !== 'post' || !results.forms.corporate.consentRequired || results.forms.corporate.privacyVersion !== '2026-10', 'Corporate form contract changed');
  fail(results, results.forms.vitairosM.length !== 3 || results.forms.vitairosM.some((form) => !acceptedEndpoints.includes(form.action) || form.method !== 'post' || !form.consentRequired || form.privacyVersion !== '2026-10' || !form.consentPurpose), 'VITAIROS-M form contract changed');
  fail(results, results.forms.vitairosM.map((form) => form.leadType).join(',') !== 'person,professional,institution', 'VITAIROS-M lead_type inventory changed');

  for (const run of [interactionRun, reducedRun, mRun]) {
    fail(results, run.consoleErrors.length || run.requestFailures.length || run.badResponses.length, 'Interaction/form run produced browser errors');
  }

  fs.writeFileSync(path.join(outputRoot, 'qa-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  await Promise.all([interactionRun.context.close(), reducedRun.context.close(), mRun.context.close(), touchContext.close()]);
  await browser.close();
  console.log(JSON.stringify({ viewports: results.viewports.map((item) => item.label), logoAsset: results.logoAsset, interactions: results.interactions, forms: results.forms, reducedMotion: results.reducedMotion, failures: results.failures }, null, 2));
  if (results.failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
