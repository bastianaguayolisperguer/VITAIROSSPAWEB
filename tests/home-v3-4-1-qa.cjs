const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.4.1';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const root = path.resolve(__dirname, '../preview/home-v3.4.1-commercial-interaction-fix');
const screenshots = path.join(root, 'screenshots');
const motion = path.join(root, 'motion-evidence');
const comparisons = path.join(root, 'before-after');
const desktopSizes = [[1920, 1080], [1440, 900], [1366, 768]];
const integrationKeys = ['ia', 'software', 'data', 'automation', 'integrations'];
const ecosystemKeys = ['m', 'industrial', 'agro', 'conecta'];

for (const directory of [root, screenshots, motion, comparisons]) fs.mkdirSync(directory, { recursive: true });

async function openPage(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  const failedRequests = [];
  const badResponses = [];
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(220);
  return { context, page, errors, failedRequests, badResponses };
}

async function settle(page) {
  const viewport = page.viewportSize() || { width: 1440, height: 900 };
  await page.mouse.move(viewport.width - 8, viewport.height - 8);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.waitForTimeout(100);
}

async function sectionShot(page, selector, filename) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  await settle(page);
  await page.evaluate(() => {
    const header = document.querySelector('header');
    if (header) header.style.visibility = 'hidden';
  });
  await locator.screenshot({ path: path.join(screenshots, filename) });
  await page.evaluate(() => {
    const header = document.querySelector('header');
    if (header) header.style.visibility = '';
  });
}

async function frameSequence(page, selector, directoryName, count = 5, delay = 95) {
  const directory = path.join(motion, directoryName);
  fs.mkdirSync(directory, { recursive: true });
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
    branch: 'home-v3.4.1-commercial-interaction-fix',
    baseSha: '5eb135c27181f3e6d8f092541975590816629a97',
    breakpoints: [],
    integration: [],
    ecosystem: [],
    accessibility: {},
    browserErrors: [],
    failures: []
  };

  for (const [width, height] of desktopSizes) {
    const run = await openPage(browser, { width, height });
    const audit = await run.page.evaluate(async ({ integrationKeys, ecosystemKeys }) => {
      const rect = (element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      const inside = (child, parent, tolerance = 1) => child.left >= parent.left - tolerance && child.top >= parent.top - tolerance && child.right <= parent.right + tolerance && child.bottom <= parent.bottom + tolerance;
      const intersects = (a, b, tolerance = 1) => a.left < b.right - tolerance && a.right > b.left + tolerance && a.top < b.bottom - tolerance && a.bottom > b.top + tolerance;
      const pairs = (elements) => {
        const boxes = elements.map((element) => ({ label: element.textContent.trim().replace(/\s+/g, ' '), box: rect(element) }));
        const overlaps = [];
        for (let a = 0; a < boxes.length; a += 1) for (let b = a + 1; b < boxes.length; b += 1) if (intersects(boxes[a].box, boxes[b].box)) overlaps.push(`${boxes[a].label} <> ${boxes[b].label}`);
        return overlaps;
      };
      const integrationModel = document.querySelector('.integration-model');
      const integrationBox = rect(integrationModel);
      const integrationElements = Array.from(document.querySelectorAll('.integration-capability,.integration-application,.integration-hub,.integration-detail'));
      const integrationOutOfBounds = integrationElements.filter((element) => !inside(rect(element), integrationBox)).map((element) => element.textContent.trim().replace(/\s+/g, ' ').slice(0, 70));
      const clippedIntegrationText = Array.from(document.querySelectorAll('.integration-capability b,.integration-application b,.integration-detail p')).filter((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1).map((element) => element.textContent.trim());
      const ecosystemStates = [];
      for (const key of ecosystemKeys) {
        document.querySelector(`[data-ecosystem-item="${key}"] button`).click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const canvas = document.querySelector('.initiative-canvas');
        const canvasBox = rect(canvas);
        const steps = Array.from(document.querySelectorAll('.initiative-step'));
        ecosystemStates.push({
          key,
          stepOverlaps: pairs(steps),
          outOfBounds: steps.filter((step) => !inside(rect(step), canvasBox)).map((step) => step.textContent.trim().replace(/\s+/g, ' ')),
          clippedLabels: steps.map((step) => step.querySelector('small')).filter((label) => label.scrollWidth > label.clientWidth + 1 || label.scrollHeight > label.clientHeight + 1).map((label) => label.textContent.trim()),
          labels: steps.map((step) => step.querySelector('small').textContent.trim()),
          headline: document.getElementById('ecosystemPreviewHeadline').textContent.trim(),
          copy: document.getElementById('ecosystemPreviewCopy').textContent.trim()
        });
      }
      document.querySelector('[data-ecosystem-item="m"] button').click();
      const sizes = Array.from(document.querySelectorAll('.integration-capability b,.integration-application b,.initiative-step small')).map((element) => ({ text: element.textContent.trim(), px: Number.parseFloat(getComputedStyle(element).fontSize) }));
      return {
        viewport: [window.innerWidth, window.innerHeight],
        documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
        horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        integration: {
          componentCount: document.querySelectorAll('.integration-capability').length,
          applicationCount: document.querySelectorAll('.integration-application').length,
          capabilityOverlaps: pairs(Array.from(document.querySelectorAll('.integration-capability'))),
          applicationOverlaps: pairs(Array.from(document.querySelectorAll('.integration-application'))),
          outOfBounds: integrationOutOfBounds,
          clippedText: clippedIntegrationText,
          modelHeight: integrationBox.height
        },
        ecosystem: {
          stateCount: ecosystemStates.length,
          states: ecosystemStates,
          panelHeight: document.querySelector('#ecosystemExperience').getBoundingClientRect().height
        },
        minimumLabelFont: Math.min(...sizes.map((item) => item.px)),
        duplicateIds: Array.from(document.querySelectorAll('[id]')).map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index),
        integrationKeysPresent: integrationKeys.every((key) => document.querySelector(`[data-integration-key="${key}"]`))
      };
    }, { integrationKeys, ecosystemKeys });

    results.breakpoints.push({ size: `${width}x${height}`, ...audit });
    if (audit.horizontalOverflow > 1) results.failures.push(`${width}x${height}: horizontal overflow ${audit.horizontalOverflow}px`);
    if (audit.integration.componentCount !== 5 || audit.integration.applicationCount !== 4 || !audit.integrationKeysPresent) results.failures.push(`${width}x${height}: integration inventory mismatch`);
    if (audit.integration.capabilityOverlaps.length || audit.integration.applicationOverlaps.length || audit.integration.outOfBounds.length || audit.integration.clippedText.length) results.failures.push(`${width}x${height}: integration overlap, bounds, or clipping failure`);
    for (const state of audit.ecosystem.states) if (state.stepOverlaps.length || state.outOfBounds.length || state.clippedLabels.length || state.labels.length !== 4 || !state.headline || !state.copy) results.failures.push(`${width}x${height}: ecosystem ${state.key} overlap, bounds, clipping, or content failure`);
    if (audit.ecosystem.stateCount !== 4) results.failures.push(`${width}x${height}: ecosystem state inventory mismatch`);
    if (audit.minimumLabelFont < 7.5) results.failures.push(`${width}x${height}: label below legibility threshold (${audit.minimumLabelFont}px)`);
    if (audit.duplicateIds.length) results.failures.push(`${width}x${height}: duplicate ids ${audit.duplicateIds.join(', ')}`);
    if (run.errors.length || run.failedRequests.length || run.badResponses.length) {
      results.browserErrors.push({ size: `${width}x${height}`, errors: run.errors, requests: run.failedRequests, responses: run.badResponses });
      results.failures.push(`${width}x${height}: console, request, or response error`);
    }

    const letter = width === 1920 ? 'A' : width === 1440 ? 'B' : 'C';
    await sectionShot(run.page, '#integracion', `${letter}-integration-${width}x${height}.png`);
    await run.context.close();
  }

  const desktop = await openPage(browser, { width: 1440, height: 900 });
  for (const key of integrationKeys) {
    const button = desktop.page.locator(`[data-integration-key="${key}"]`);
    await button.click();
    const state = await desktop.page.evaluate(() => ({
      key: document.querySelector('[data-integration-story]').dataset.integrationActive,
      output: document.querySelector('[data-integration-story]').dataset.integrationOutput,
      selected: document.querySelector('[data-integration-key].is-active')?.getAttribute('aria-selected'),
      activeApplication: document.querySelector('.integration-application.is-active')?.textContent.trim().replace(/\s+/g, ' '),
      title: document.getElementById('integrationDetailTitle').textContent.trim(),
      copy: document.getElementById('integrationDetailCopy').textContent.trim()
    }));
    results.integration.push(state);
    if (state.key !== key || state.selected !== 'true' || !state.output || !state.activeApplication || !state.title || !state.copy) results.failures.push(`Integration ${key}: incomplete active route`);
  }

  const firstIntegration = desktop.page.locator('[data-integration-key="ia"]');
  await firstIntegration.focus();
  await firstIntegration.press('ArrowRight');
  const focusedIntegration = desktop.page.locator('[data-integration-key="software"]');
  const focusStyle = await focusedIntegration.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, outlineWidth: getComputedStyle(element).outlineWidth, selected: element.getAttribute('aria-selected'), focused: document.activeElement === element }));
  results.accessibility.integrationKeyboard = await desktop.page.locator('[data-integration-story]').getAttribute('data-integration-active');
  results.accessibility.integrationFocus = focusStyle;
  if (results.accessibility.integrationKeyboard !== 'software' || !focusStyle.focused || focusStyle.outline === 'none' || focusStyle.outlineWidth === '0px') results.failures.push('Integration keyboard or focus-visible test failed');
  await desktop.page.locator('[data-integration-key="data"]').hover();
  results.accessibility.integrationPointer = await desktop.page.locator('[data-integration-story]').getAttribute('data-integration-active');
  if (results.accessibility.integrationPointer !== 'data') results.failures.push('Integration pointer activation failed');
  await desktop.page.locator('[data-integration-key="automation"]').click();
  await frameSequence(desktop.page, '.integration-model', 'integration-automation-route', 5, 90);

  const screenshotNames = { m: 'F-ecosystem-vitairos-m-1440x900.png', industrial: 'E-ecosystem-industrial-ai-1440x900.png', agro: 'D-ecosystem-agro-intelligence-1440x900.png', conecta: 'G-ecosystem-vitairos-conecta-1440x900.png' };
  for (const key of ecosystemKeys) {
    const button = desktop.page.locator(`[data-ecosystem-item="${key}"] button`);
    await button.click();
    const state = await desktop.page.evaluate(() => ({
      key: document.getElementById('ecosystemExperience').dataset.activeProject,
      headline: document.getElementById('ecosystemPreviewHeadline').textContent.trim(),
      copy: document.getElementById('ecosystemPreviewCopy').textContent.trim(),
      labels: Array.from(document.querySelectorAll('.initiative-step small')).map((element) => element.textContent.trim()),
      expanded: document.querySelector('.ecosystem-item.is-active button')?.getAttribute('aria-expanded')
    }));
    results.ecosystem.push(state);
    if (state.key !== key || state.expanded !== 'true' || state.labels.length !== 4 || !state.headline || !state.copy) results.failures.push(`Ecosystem ${key}: incomplete narrative state`);
    await desktop.page.waitForTimeout(540);
    await sectionShot(desktop.page, '#ecosystemExperience', screenshotNames[key]);
  }

  const firstEcosystem = desktop.page.locator('[data-ecosystem-item="m"] button');
  await firstEcosystem.focus();
  await firstEcosystem.press('ArrowDown');
  const focusedEcosystem = desktop.page.locator('[data-ecosystem-item="industrial"] button');
  const ecoFocusStyle = await focusedEcosystem.evaluate((element) => ({ outline: getComputedStyle(element).outlineStyle, outlineWidth: getComputedStyle(element).outlineWidth, focused: document.activeElement === element }));
  results.accessibility.ecosystemKeyboard = await desktop.page.locator('#ecosystemExperience').getAttribute('data-active-project');
  results.accessibility.ecosystemFocus = ecoFocusStyle;
  if (results.accessibility.ecosystemKeyboard !== 'industrial' || !ecoFocusStyle.focused || ecoFocusStyle.outline === 'none' || ecoFocusStyle.outlineWidth === '0px') results.failures.push('Ecosystem keyboard or focus-visible test failed');
  await desktop.page.locator('[data-ecosystem-item="agro"] button').hover();
  results.accessibility.ecosystemPointer = await desktop.page.locator('#ecosystemExperience').getAttribute('data-active-project');
  if (results.accessibility.ecosystemPointer !== 'agro') results.failures.push('Ecosystem pointer activation failed');
  await desktop.page.locator('[data-ecosystem-item="conecta"] button').click();
  await frameSequence(desktop.page, '#ecosystemPreview', 'ecosystem-conecta-transition', 6, 80);

  if (desktop.errors.length || desktop.failedRequests.length || desktop.badResponses.length) {
    results.browserErrors.push({ size: '1440x900-interactions', errors: desktop.errors, requests: desktop.failedRequests, responses: desktop.badResponses });
    results.failures.push('Interaction evidence produced browser console, request, or response errors');
  }

  const previous = path.resolve(__dirname, '../preview/home-v3.4-responsive-motion-rebuild/screenshots');
  copyIfPresent(path.join(previous, '11-integration-desktop.png'), path.join(comparisons, 'integration-old-v3.4.png'));
  copyIfPresent(path.join(screenshots, 'B-integration-1440x900.png'), path.join(comparisons, 'integration-new-v3.4.1.png'));
  copyIfPresent(path.join(previous, '17-initiatives-desktop.png'), path.join(comparisons, 'ecosystem-old-v3.4.png'));
  copyIfPresent(path.join(screenshots, 'D-ecosystem-agro-intelligence-1440x900.png'), path.join(comparisons, 'ecosystem-new-v3.4.1-agro.png'));

  fs.writeFileSync(path.join(root, 'qa-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  await desktop.context.close();
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  if (results.failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
