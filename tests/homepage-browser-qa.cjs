const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/';
const outputDir = path.resolve(__dirname, '..', 'preview');
const viewports = [
  ['1920x1080', 1920, 1080], ['1440x900', 1440, 900], ['1366x768', 1366, 768], ['1024x768', 1024, 768],
  ['768x1024', 768, 1024], ['430x932', 430, 932], ['390x844', 390, 844], ['360x800', 360, 800]
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
    const step = Math.max(320, Math.floor(window.innerHeight * 0.8));
    for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
      window.scrollTo(0, position);
      await new Promise((resolve) => setTimeout(resolve, 12));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll('.reveal').forEach((node) => {
      node.classList.add('is-visible'); node.style.transition = 'none'; node.style.opacity = '1'; node.style.transform = 'none';
    });
    await new Promise((resolve) => setTimeout(resolve, 180));
  });
}

async function captureSection(page, selector, filename) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  await page.evaluate(() => document.querySelectorAll('header,.scroll-progress,.skip-link').forEach((node) => { node.dataset.qaVisibility = node.style.visibility; node.style.visibility = 'hidden'; }));
  await locator.screenshot({ path: path.join(outputDir, filename) });
  await page.evaluate(() => document.querySelectorAll('header,.scroll-progress,.skip-link').forEach((node) => { node.style.visibility = node.dataset.qaVisibility || ''; delete node.dataset.qaVisibility; }));
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
    const metrics = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelectorAll('h1').length,
      main: Boolean(document.querySelector('main')),
      orbitLinks: document.querySelectorAll('.orbit-project').length,
      methodNodes: document.querySelectorAll('.method-node').length,
      ecosystemItems: document.querySelectorAll('.ecosystem-item').length,
      diagnosticSteps: document.querySelectorAll('.diagnostic-step').length,
      visibleDiagnosticSteps: Array.from(document.querySelectorAll('.diagnostic-step')).filter((step) => !step.hidden).length,
      newsCards: document.querySelectorAll('.news-card').length,
      newsHidden: document.querySelector('[data-news-section]')?.hidden ?? true,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      height: document.documentElement.scrollHeight,
      brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      duplicateIds: Array.from(document.querySelectorAll('[id]'), (node) => node.id).filter((id, index, list) => list.indexOf(id) !== index),
      headerVisible: getComputedStyle(document.getElementById('siteHeader')).display !== 'none'
    }));
    const status = response ? response.status() : 0;
    if (status !== 200) failures.push(`${name}: HTTP ${status}`);
    if (metrics.h1 !== 1 || !metrics.main) failures.push(`${name}: estructura semántica incompleta`);
    if (metrics.orbitLinks !== 4 || metrics.methodNodes !== 4 || metrics.ecosystemItems !== 4) failures.push(`${name}: arquitectura interactiva incompleta`);
    if (metrics.diagnosticSteps !== 4 || metrics.visibleDiagnosticSteps !== 1) failures.push(`${name}: diagnóstico no inicia en un único paso`);
    if (metrics.newsCards !== 2 || metrics.newsHidden) failures.push(`${name}: actualidad no renderizó dos historias`);
    if (metrics.overflow > 1) failures.push(`${name}: overflow horizontal de ${metrics.overflow}px`);
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
  if (!menuOpened) failures.push('Menú móvil: estado accesible de apertura incorrecto');
  if (!menuClosed) failures.push('Menú móvil: Escape no cierra o no restaura foco');

  await functionalPage.locator('[data-value="product"]').focus();
  const valueKeyboard = await functionalPage.evaluate(() => document.querySelector('.value-experience')?.dataset.valueActive === 'product' && document.getElementById('valueResult')?.textContent.includes('experiencia útil'));
  if (!valueKeyboard) failures.push('Valor: el foco de teclado no activa la microexperiencia');
  await functionalPage.click('[data-ecosystem-item="conecta"] button');
  const ecosystemTap = await functionalPage.evaluate(() => document.getElementById('ecosystemExperience')?.dataset.activeProject === 'conecta' && document.getElementById('ecosystemLabelD')?.textContent === 'Oportunidad');
  if (!ecosystemTap) failures.push('Ecosistema: el tap no actualiza el preview');

  await functionalPage.click('label:has(input[name="oportunidad"][value="Un proceso manual"])');
  await functionalPage.click('[data-step="1"] [data-next-step]');
  await functionalPage.fill('#contexto', 'Queremos reducir tareas manuales en un flujo operacional.');
  await functionalPage.click('[data-step="2"] [data-next-step]');
  await functionalPage.click('label:has(input[name="etapa"][value="Quiero probar un piloto"])');
  await functionalPage.click('[data-step="3"] [data-next-step]');
  await functionalPage.click('[data-step="4"] [data-previous-step]');
  const diagnosticEditable = await functionalPage.evaluate(() => !document.querySelector('[data-step="3"]').hidden && document.querySelector('input[name="oportunidad"]:checked')?.value === 'Un proceso manual' && document.getElementById('contexto')?.value.includes('tareas manuales'));
  if (!diagnosticEditable) failures.push('Diagnóstico: volver no conserva respuestas');

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
  const reducedMotionApplied = await reducedPage.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.body.classList.contains('loader-active') && getComputedStyle(document.querySelector('.hero-aurora')).animationName === 'none');
  if (!reducedMotionApplied) failures.push('Accesibilidad: prefers-reduced-motion no se aplicó');
  await reducedContext.close();

  const repeatContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const repeatPage = await repeatContext.newPage();
  await repeatPage.goto(baseUrl, { waitUntil: 'load' });
  await repeatPage.waitForTimeout(1550);
  await repeatPage.reload({ waitUntil: 'domcontentloaded' });
  const repeatedIntroSkipped = await repeatPage.evaluate(() => !document.body.classList.contains('loader-active') && (!document.getElementById('introLoader') || document.getElementById('introLoader').classList.contains('is-hidden')));
  if (!repeatedIntroSkipped) failures.push('Intro: sessionStorage no evita la repetición');
  await repeatContext.close();

  const introContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const introPage = await introContext.newPage();
  await introPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await introPage.waitForTimeout(780);
  await introPage.screenshot({ path: path.join(outputDir, 'homepage-v3-01-intro.png') });
  await introContext.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(desktopPage);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-v3-02-hero-desktop.png') });
  await desktopPage.locator('.orbit-project--m').evaluate((element) => element.focus());
  await desktopPage.waitForTimeout(180);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-v3-04-sphere-interaction.png') });
  await desktopPage.evaluate(() => window.scrollTo(0, document.getElementById('brecha').offsetTop - 260));
  await desktopPage.waitForTimeout(240);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-v3-05-hero-breach.png') });
  await captureSection(desktopPage, '#brecha', 'homepage-v3-06-value.png');
  await captureSection(desktopPage, '#metodo', 'homepage-v3-07-method.png');
  await captureSection(desktopPage, '#ecosistema', 'homepage-v3-08-ecosystem.png');
  await desktopPage.hover('[data-ecosystem-item="industrial"]');
  await desktopPage.waitForTimeout(180);
  await desktopPage.locator('.ecosystem-experience').screenshot({ path: path.join(outputDir, 'homepage-v3-09-ecosystem-hover.png') });
  await captureSection(desktopPage, '#actualidad', 'homepage-v3-10-movement.png');
  await captureSection(desktopPage, '#nosotros', 'homepage-v3-11-why.png');
  await captureSection(desktopPage, '.diagnostic-card', 'homepage-v3-12-diagnostic-step-1.png');
  await desktopPage.click('label:has(input[name="oportunidad"][value="Información o datos"])');
  await desktopPage.click('[data-step="1"] [data-next-step]');
  await desktopPage.fill('#contexto', 'La información operacional está distribuida en documentos y sistemas.');
  await desktopPage.click('[data-step="2"] [data-next-step]');
  await desktopPage.click('label:has(input[name="etapa"][value="Tengo un problema identificado"])');
  await desktopPage.click('[data-step="3"] [data-next-step]');
  await desktopPage.fill('#nombre', 'Nombre de muestra');
  await desktopPage.fill('#empresa', 'Organización de muestra');
  await desktopPage.fill('#email', 'muestra@example.com');
  await desktopPage.locator('.diagnostic-card').screenshot({ path: path.join(outputDir, 'homepage-v3-13-diagnostic-final.png') });
  await desktopPage.locator('.diagnostic-intro').screenshot({ path: path.join(outputDir, 'homepage-v3-14-final-cta.png') });
  await desktopPage.evaluate(() => window.scrollTo(0, 0));
  await desktopPage.waitForTimeout(180);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-v3-15-desktop-full.png'), fullPage: true });

  await desktopPage.goto(new URL('/conecta/', baseUrl).toString(), { waitUntil: 'networkidle' });
  await preparePage(desktopPage);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-v3-benchmark-conecta.png'), fullPage: true });
  await desktopPage.goto(new URL('/vitairos-industrial-ai/', baseUrl).toString(), { waitUntil: 'networkidle' });
  await preparePage(desktopPage);
  await desktopPage.screenshot({ path: path.join(outputDir, 'homepage-v3-benchmark-industrial-ai.png'), fullPage: true });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(mobilePage);
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-v3-03-hero-mobile.png') });
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-v3-16-mobile-full.png'), fullPage: true });
  await mobile.close();

  const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const ogPage = await og.newPage();
  await ogPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await preparePage(ogPage);
  await ogPage.screenshot({ path: path.resolve(__dirname, '..', 'assets', 'vitairos-open-graph-1200x630.png') });
  await og.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ menuOpened, menuClosed, valueKeyboard, ecosystemTap, diagnosticEditable, reducedMotionApplied, repeatedIntroSkipped, routeStatuses }, null, 2));
  if (failures.length) {
    console.error('\nBrowser QA failures:'); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1);
  }
  console.log(`\nBrowser QA V3: OK en ${viewports.length} viewports. 16 capturas obligatorias y benchmarks generados.`);
})().catch((error) => { console.error(error); process.exit(1); });
