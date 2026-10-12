const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/';
const outputDir = path.resolve(__dirname, '..', 'preview');
const viewports = [
  ['1920x1080', 1920, 1080],
  ['1440x900', 1440, 900],
  ['1366x768', 1366, 768],
  ['1024x768', 1024, 768],
  ['900x900', 900, 900],
  ['768x1024', 768, 1024],
  ['430x932', 430, 932],
  ['390x844', 390, 844],
  ['360x800', 360, 800]
];

const browserCandidates = [
  process.env.PLAYWRIGHT_BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));

async function preparePage(page) {
  await page.evaluate(async () => {
    const loader = document.getElementById('introLoader');
    if (loader) loader.remove();
    document.body.classList.remove('loader-active');
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    const step = Math.max(320, Math.floor(window.innerHeight * 0.8));
    for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
      window.scrollTo(0, position);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll('.reveal').forEach((node) => {
      node.classList.add('is-visible');
      node.style.transition = 'none';
      node.style.opacity = '1';
      node.style.transform = 'none';
    });
    await Promise.race([
      Promise.all(Array.from(document.images).map((image) => {
        if (image.complete && image.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        });
      })),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ]);
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const failures = [];
  const results = [];

  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await preparePage(page);

    const metrics = await page.evaluate(() => {
      const hiddenReveals = Array.from(document.querySelectorAll('.reveal'))
        .filter((node) => Number.parseFloat(getComputedStyle(node).opacity) <= 0.99)
        .map((node) => `${node.tagName.toLowerCase()}.${Array.from(node.classList).join('.')} (${getComputedStyle(node).opacity})`);
      return {
        title: document.title,
        h1: document.querySelectorAll('h1').length,
        main: Boolean(document.querySelector('main')),
        orbitLinks: document.querySelectorAll('.orbit-project').length,
        newsCards: document.querySelectorAll('.news-card').length,
        newsHidden: document.querySelector('[data-news-section]')?.hidden ?? true,
        careersFallback: document.getElementById('jobsList')?.textContent.includes('Actualmente no tenemos procesos abiertos.') ?? false,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        height: document.documentElement.scrollHeight,
        visibleReveals: hiddenReveals.length === 0,
        hiddenReveals,
        brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
        duplicateIds: Array.from(document.querySelectorAll('[id]'), (node) => node.id).filter((id, index, list) => list.indexOf(id) !== index)
      };
    });

    const status = response ? response.status() : 0;
    if (status !== 200) failures.push(`${name}: HTTP ${status}`);
    if (metrics.h1 !== 1 || !metrics.main) failures.push(`${name}: estructura semántica incompleta`);
    if (metrics.orbitLinks !== 4) failures.push(`${name}: órbita con ${metrics.orbitLinks} enlaces`);
    if (metrics.newsCards !== 3 || metrics.newsHidden) failures.push(`${name}: actualidad verificada no renderizada`);
    if (!metrics.careersFallback) failures.push(`${name}: estado de vacantes no renderizado`);
    if (metrics.overflow > 1) failures.push(`${name}: overflow horizontal de ${metrics.overflow}px`);
    if (!metrics.visibleReveals) failures.push(`${name}: reveals incompletos: ${metrics.hiddenReveals.join(', ')}`);
    if (metrics.brokenImages.length) failures.push(`${name}: imágenes rotas: ${metrics.brokenImages.join(', ')}`);
    if (metrics.duplicateIds.length) failures.push(`${name}: IDs duplicados: ${metrics.duplicateIds.join(', ')}`);
    if (consoleErrors.length) failures.push(`${name}: consola: ${consoleErrors.join(' | ')}`);
    results.push({ viewport: name, status, ...metrics, consoleErrors });
    await context.close();
  }

  const functionalContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const functionalPage = await functionalContext.newPage();
  await functionalPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(functionalPage);
  await functionalPage.click('#hamburger');
  const menuOpened = await functionalPage.evaluate(() => document.getElementById('hamburger')?.getAttribute('aria-expanded') === 'true' && document.getElementById('mobileMenu')?.classList.contains('open') && document.body.classList.contains('menu-open'));
  await functionalPage.keyboard.press('Escape');
  const menuClosed = await functionalPage.evaluate(() => document.getElementById('hamburger')?.getAttribute('aria-expanded') === 'false' && !document.getElementById('mobileMenu')?.classList.contains('open') && document.activeElement === document.getElementById('hamburger'));
  if (!menuOpened) failures.push('Interacción móvil: el menú no abre con estado accesible coherente');
  if (!menuClosed) failures.push('Interacción móvil: Escape no cierra o no restaura el foco');

  const internalRoutes = ['/vitairos-m/', '/vitairos-industrial-ai/', '/agro-intelligence/', '/conecta/'];
  const routeStatuses = {};
  for (const route of internalRoutes) {
    const routeResponse = await functionalContext.request.get(new URL(route, baseUrl).toString());
    routeStatuses[route] = routeResponse.status();
    if (routeResponse.status() !== 200) failures.push(`Enlace interno ${route}: HTTP ${routeResponse.status()}`);
  }
  await functionalContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' });
  const reducedMotionApplied = await reducedPage.evaluate(() => {
    const orbit = document.querySelector('.orbit-project');
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches && orbit && getComputedStyle(orbit).animationName === 'none' && !document.body.classList.contains('loader-active');
  });
  if (!reducedMotionApplied) failures.push('Accesibilidad: prefers-reduced-motion no se aplicó correctamente');
  await reducedContext.close();

  const repeatContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const repeatPage = await repeatContext.newPage();
  await repeatPage.goto(baseUrl, { waitUntil: 'load' });
  await repeatPage.waitForTimeout(1600);
  await repeatPage.reload({ waitUntil: 'domcontentloaded' });
  const repeatedIntroSkipped = await repeatPage.evaluate(() => {
    const loader = document.getElementById('introLoader');
    return !document.body.classList.contains('loader-active') && (!loader || loader.classList.contains('is-hidden'));
  });
  if (!repeatedIntroSkipped) failures.push('Intro: la visita repetida no se omite con sessionStorage');
  await repeatContext.close();

  const intro = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const introPage = await intro.newPage();
  await introPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await introPage.waitForTimeout(900);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-premium-intro.png') });
  await intro.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(desktopPage);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-premium-hero.png') });
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-premium-desktop-full.png'), fullPage: true });
  await desktopPage.locator('.skip-link').evaluate((element) => { element.style.visibility = 'hidden'; });
  await desktopPage.locator('#ecosistema').screenshot({ path: path.join(outputDir, 'homepage-premium-ecosystem.png') });
  await desktopPage.locator('#actualidad').screenshot({ path: path.join(outputDir, 'homepage-premium-news.png') });
  await desktopPage.locator('#trabaja').screenshot({ path: path.join(outputDir, 'homepage-premium-careers.png') });
  await desktopPage.locator('.skip-link').evaluate((element) => { element.style.visibility = ''; });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(mobilePage);
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-premium-mobile-hero.png') });
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-premium-mobile-full.png'), fullPage: true });
  await mobile.close();

  const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const ogPage = await og.newPage();
  await ogPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(ogPage);
  await ogPage.screenshot({ path: path.resolve(__dirname, '..', 'assets', 'vitairos-open-graph-1200x630.png') });
  await og.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ menuOpened, menuClosed, reducedMotionApplied, repeatedIntroSkipped, routeStatuses }, null, 2));
  if (failures.length) {
    console.error('\nBrowser QA failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log(`\nBrowser QA: OK en ${viewports.length} viewports. Evidencia y Open Graph generados.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
