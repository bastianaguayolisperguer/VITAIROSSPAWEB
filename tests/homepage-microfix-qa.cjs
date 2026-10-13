const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.2';
const outputDir = path.resolve(__dirname, '..', 'preview');
const viewports = [
  ['1920x1080', 1920, 1080], ['1440x900', 1440, 900], ['1366x768', 1366, 768], ['1024x768', 1024, 768],
  ['768x1024', 768, 1024], ['430x932', 430, 932], ['390x844', 390, 844], ['360x800', 360, 800]
];
const candidates = [
  process.env.PLAYWRIGHT_BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);
const executablePath = candidates.find((candidate) => fs.existsSync(candidate));

function recordErrors(page, target) {
  page.on('console', (message) => { if (message.type() === 'error') target.push(message.text()); });
  page.on('pageerror', (error) => target.push(error.message));
}

async function seedFirstVisit(page) {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('vitairos_qa_initialized')) {
      sessionStorage.clear();
      sessionStorage.setItem('vitairos_qa_initialized', '1');
    }
  });
}

async function seedReturningVisit(page) {
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
}

async function preparePage(page) {
  await page.evaluate(async () => {
    document.getElementById('introLoader')?.remove();
    document.documentElement.classList.remove('intro-enabled');
    document.body.classList.remove('loader-active', 'intro-resolving');
    const step = Math.max(320, Math.floor(window.innerHeight * .8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll('.reveal,[data-reveal]').forEach((node) => {
      node.classList.add('is-visible'); node.style.transition = 'none'; node.style.opacity = '1'; node.style.transform = 'none';
    });
    await new Promise((resolve) => setTimeout(resolve, 140));
  });
}

async function hideChrome(page) {
  await page.evaluate(() => document.querySelectorAll('header,.scroll-progress,.skip-link').forEach((node) => { node.style.visibility = 'hidden'; }));
}

async function captureG(page, filename) {
  const title = page.locator('#ecosystemTitle');
  await title.scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  await hideChrome(page);
  const box = await title.boundingBox();
  if (!box) throw new Error('No fue posible localizar #ecosystemTitle');
  const padding = 24;
  const x = Math.max(0, box.x - padding);
  await page.screenshot({ path: path.join(outputDir, filename), clip: { x, y: Math.max(0, box.y - padding), width: Math.min(1440 - x, box.width + padding * 2), height: box.height + padding * 2 } });
}

async function introState(page) {
  return page.evaluate(() => {
    const loader = document.getElementById('introLoader');
    const official = document.querySelector('.intro-mark__official');
    const identity = document.querySelector('.intro-loader__identity');
    return {
      enabled: document.documentElement.classList.contains('intro-enabled'),
      active: document.body.classList.contains('loader-active'),
      running: loader?.classList.contains('is-running') || false,
      loaderVisible: Boolean(loader) && getComputedStyle(loader).display !== 'none',
      officialOpacity: official ? Number.parseFloat(getComputedStyle(official).opacity || '0') : 0,
      identityOpacity: identity ? Number.parseFloat(getComputedStyle(identity).opacity || '0') : 0
    };
  });
}

async function captureIntroPhase(browser, filename, time, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(() => sessionStorage.clear());
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.getElementById('introLoader')?.classList.contains('is-running'));
  await page.evaluate(async (phaseTime) => {
    await document.fonts.ready;
    document.getAnimations().forEach((animation) => {
      const target = animation.effect?.target;
      if (!(target instanceof Element)) return;
      if (target.closest('#introLoader') || target.matches('.hero-copy,header,.hb-sphere-wrap')) {
        animation.pause();
        animation.currentTime = phaseTime;
      }
    });
  }, time);
  await page.screenshot({ path: path.join(outputDir, filename) });
  await context.close();
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const failures = [];
  const results = [];

  const introProbeContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const introProbePage = await introProbeContext.newPage();
  await seedFirstVisit(introProbePage);
  await introProbePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  const introProbe = await introProbePage.evaluate(() => new Promise((resolve) => {
    const start = performance.now(); const samples = [];
    const timer = setInterval(() => {
      const mark = document.querySelector('.intro-mark__official'); const identity = document.querySelector('.intro-loader__identity'); const loader = document.getElementById('introLoader');
      samples.push({ mark: mark ? Number.parseFloat(getComputedStyle(mark).opacity || '0') : 0, identity: identity ? Number.parseFloat(getComputedStyle(identity).opacity || '0') : 0, active: document.body.classList.contains('loader-active'), visible: Boolean(loader) && getComputedStyle(loader).display !== 'none' });
      if (performance.now() - start >= 1550) { clearInterval(timer); resolve({ maxMark: Math.max(...samples.map((sample) => sample.mark)), maxIdentity: Math.max(...samples.map((sample) => sample.identity)), activeAtStart: samples[0].active, activeAtEnd: samples.at(-1).active, visibleAtEnd: samples.at(-1).visible }); }
    }, 25);
  }));
  await introProbeContext.close();

  const introContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const introPage = await introContext.newPage();
  const introErrors = [];
  recordErrors(introPage, introErrors);
  await seedFirstVisit(introPage);
  await introPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await introPage.waitForTimeout(120);
  const nodesState = await introState(introPage);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-03-intro-nodes.png') });
  await introPage.waitForTimeout(520);
  const markState = await introState(introPage);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-04-intro-isotipo.png') });
  await introPage.waitForTimeout(150);
  const identityState = await introState(introPage);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-05-intro-vitairos.png') });
  await introPage.waitForTimeout(300);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-06-intro-sphere-transition.png') });
  await introPage.waitForTimeout(400);
  const finalState = await introState(introPage);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-07-hero-final.png') });
  if (!introProbe.activeAtStart) failures.push('Intro: la primera visita no activa la firma');
  if (introProbe.maxMark < .9) failures.push(`Intro: el isotipo oficial no alcanza presencia suficiente (${introProbe.maxMark})`);
  if (introProbe.maxIdentity < .9) failures.push('Intro: la identidad no aparece durante la secuencia');
  if (introProbe.activeAtEnd || introProbe.visibleAtEnd || finalState.active || finalState.loaderVisible) failures.push('Intro: excede la ventana de 1,5 segundos');
  if (introErrors.length) failures.push(`Intro desktop: ${introErrors.join(' | ')}`);

  await introPage.reload({ waitUntil: 'domcontentloaded' });
  await introPage.waitForTimeout(80);
  const refreshState = await introState(introPage);
  if (refreshState.active || refreshState.loaderVisible || refreshState.enabled) failures.push('Intro: refresh de la sesión vuelve a mostrar la firma');
  await introPage.goto(new URL('#brecha', baseUrl).toString(), { waitUntil: 'domcontentloaded' });
  await introPage.waitForTimeout(80);
  const directState = await introState(introPage);
  if (directState.active || directState.loaderVisible) failures.push('Intro: navegación directa de la sesión vuelve a mostrar la firma');
  await introContext.close();

  await captureIntroPhase(browser, 'homepage-v3-2-microfix-03-intro-nodes.png', 210);
  await captureIntroPhase(browser, 'homepage-v3-2-microfix-04-intro-isotipo.png', 640);
  await captureIntroPhase(browser, 'homepage-v3-2-microfix-05-intro-vitairos.png', 790);
  await captureIntroPhase(browser, 'homepage-v3-2-microfix-06-intro-sphere-transition.png', 1080);

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  recordErrors(mobilePage, mobileErrors);
  await seedFirstVisit(mobilePage);
  await mobilePage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(790);
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-08-mobile-intro.png') });
  await mobilePage.waitForTimeout(700);
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-microfix-09-mobile-hero.png') });
  if (mobileErrors.length) failures.push(`Intro mobile: ${mobileErrors.join(' | ')}`);
  await mobileContext.close();

  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const consoleErrors = [];
    recordErrors(page, consoleErrors);
    await seedReturningVisit(page);
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await preparePage(page);
    const metrics = await page.evaluate(() => {
      const title = document.getElementById('ecosystemTitle');
      const titleStyle = getComputedStyle(title);
      const range = document.createRange();
      range.selectNodeContents(title);
      const textBox = range.getBoundingClientRect();
      const titleBox = title.getBoundingClientRect();
      const clippingAncestors = [];
      let ancestor = title.parentElement;
      while (ancestor && ancestor !== document.body) {
        const style = getComputedStyle(ancestor);
        if (['hidden', 'clip'].includes(style.overflowY)) clippingAncestors.push(ancestor.className || ancestor.tagName);
        ancestor = ancestor.parentElement;
      }
      const headingsClipped = Array.from(document.querySelectorAll('h1,h2,h3')).filter((heading) => {
        const headingRange = document.createRange(); headingRange.selectNodeContents(heading);
        const content = headingRange.getBoundingClientRect(); let parent = heading;
        while (parent && parent !== document.body) {
          const box = parent.getBoundingClientRect(); const style = getComputedStyle(parent);
          if (['hidden', 'clip'].includes(style.overflowY) && (content.top < box.top - 1 || content.bottom > box.bottom + 1)) return true;
          parent = parent.parentElement;
        }
        return false;
      }).map((heading) => heading.textContent.trim());
      return {
        statusReady: document.readyState,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
        headingsClipped,
        clippingAncestors,
        gSafe: titleStyle.overflowY === 'visible' && textBox.height > 0 && titleBox.height > 0,
        titleLineHeight: Number.parseFloat(titleStyle.lineHeight),
        titleFontSize: Number.parseFloat(titleStyle.fontSize),
        logoClipped: Array.from(document.querySelectorAll('.brand-logo img,.ecosystem-visual>img')).some((image) => { const box = image.getBoundingClientRect(); return box.width <= 0 || box.height <= 0; }),
        introActive: document.body.classList.contains('loader-active') || document.documentElement.classList.contains('intro-enabled')
      };
    });
    if (!response || response.status() !== 200) failures.push(`${name}: HTTP ${response?.status() || 0}`);
    if (metrics.overflow > 1) failures.push(`${name}: overflow horizontal ${metrics.overflow}px`);
    if (metrics.brokenImages.length) failures.push(`${name}: imágenes rotas ${metrics.brokenImages.join(', ')}`);
    if (metrics.headingsClipped.length || metrics.clippingAncestors.length || !metrics.gSafe) failures.push(`${name}: clipping tipográfico ${[...metrics.headingsClipped, ...metrics.clippingAncestors].join(', ')}`);
    if (metrics.titleLineHeight < metrics.titleFontSize) failures.push(`${name}: line-height insuficiente en la G`);
    if (metrics.logoClipped) failures.push(`${name}: logo sin área renderizable`);
    if (metrics.introActive) failures.push(`${name}: la visita repetida conserva intro activa`);
    if (consoleErrors.length) failures.push(`${name}: consola ${consoleErrors.join(' | ')}`);
    results.push({ viewport: name, ...metrics, consoleErrors: consoleErrors.length });
    await context.close();
  }

  const afterContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const afterPage = await afterContext.newPage();
  await seedReturningVisit(afterPage);
  await afterPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(afterPage);
  await captureG(afterPage, 'homepage-v3-2-microfix-02-g-corrected.png');
  await afterContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  const reducedErrors = [];
  recordErrors(reducedPage, reducedErrors);
  await reducedPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await reducedPage.waitForTimeout(100);
  const reducedState = await reducedPage.evaluate(() => ({
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    introEnabled: document.documentElement.classList.contains('intro-enabled'),
    introActive: document.body.classList.contains('loader-active'),
    loaderVisible: Boolean(document.getElementById('introLoader')) && getComputedStyle(document.getElementById('introLoader')).display !== 'none',
    heroVisible: Number.parseFloat(getComputedStyle(document.querySelector('.hero-copy')).opacity || '1') > .9
  }));
  if (!reducedState.reduced || reducedState.introEnabled || reducedState.introActive || reducedState.loaderVisible || !reducedState.heroVisible) failures.push('Reduced motion: no entra directamente al hero completo');
  if (reducedErrors.length) failures.push(`Reduced motion: ${reducedErrors.join(' | ')}`);
  await reducedContext.close();

  const keyboardContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const keyboardPage = await keyboardContext.newPage();
  await seedReturningVisit(keyboardPage);
  await keyboardPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await keyboardPage.keyboard.press('Tab');
  await keyboardPage.waitForTimeout(240);
  const keyboardState = await keyboardPage.evaluate(() => ({
    firstFocus: document.activeElement?.className || document.activeElement?.tagName,
    skipVisible: document.activeElement?.classList.contains('skip-link') && ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(getComputedStyle(document.activeElement).transform)
  }));
  if (!keyboardState.skipVisible) failures.push(`Teclado: el primer foco no expone el skip link (${keyboardState.firstFocus})`);
  await keyboardContext.close();

  await browser.close();
  console.log(JSON.stringify({ introProbe, nodesState, markState, identityState, finalState, refreshState, directState, reducedState, keyboardState }, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (failures.length) {
    console.error('\nMicro-fix QA failures:'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1);
  }
  console.log(`\nVITAIROS V3.2 micro-fix QA: OK en ${viewports.length} viewports; 9 evidencias completas.`);
})().catch((error) => { console.error(error); process.exit(1); });
