const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=v3.2.1';
const origin = new URL(baseUrl).origin;
const outputDir = path.resolve(__dirname, '..', 'preview');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const viewports = [
  ['1920x1080', 1920, 1080], ['1440x900', 1440, 900], ['1366x768', 1366, 768], ['1024x768', 1024, 768],
  ['768x1024', 768, 1024], ['430x932', 430, 932], ['390x844', 390, 844], ['360x800', 360, 800]
];
const routes = ['/vitairos-m/', '/vitairos-industrial-ai/', '/agro-intelligence/', '/conecta/'];

function trackErrors(page, bucket) {
  page.on('console', (message) => { if (message.type() === 'error') bucket.push(message.text()); });
  page.on('pageerror', (error) => bucket.push(error.message));
}

async function seedReturningVisit(page) {
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
}

async function prepare(page) {
  await page.evaluate(async () => {
    document.getElementById('introLoader')?.remove();
    document.documentElement.classList.remove('intro-enabled');
    document.body.classList.remove('loader-active', 'intro-resolving');
    const step = Math.max(320, Math.floor(innerHeight * .78));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 8));
    }
    scrollTo(0, 0);
    document.querySelectorAll('.reveal,[data-reveal]').forEach((node) => {
      node.classList.add('is-visible'); node.style.transition = 'none'; node.style.opacity = '1'; node.style.transform = 'none';
    });
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

async function scrollScreenshot(page, y, filename) {
  await page.evaluate((position) => scrollTo({ top: position, behavior: 'instant' }), Math.max(0, y));
  await page.waitForTimeout(180);
  await page.screenshot({ path: path.join(outputDir, filename) });
}

async function sectionCoordinates(page) {
  return page.evaluate(() => {
    const absolute = (selector) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { top: rect.top + scrollY, bottom: rect.bottom + scrollY, height: rect.height } : null;
    };
    return {
      ecosystemExperience: absolute('#ecosistema .ecosystem-experience'),
      newsIntro: absolute('#actualidad .section-intro'),
      newsGrid: absolute('#actualidad .news-grid'),
      principlesIntro: absolute('#nosotros .section-intro'),
      principlesGrid: absolute('#nosotros .principles-grid'),
      aboutNote: absolute('#nosotros .about-note'),
      signature: absolute('#ecosystemSignature'),
      principlesSection: absolute('#nosotros'),
      footer: absolute('footer')
    };
  });
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const failures = [];
  const viewportResults = [];
  const routeResults = [];

  for (const route of routes) {
    const response = await browser.newPage().then(async (routePage) => {
      const result = await routePage.goto(origin + route, { waitUntil: 'domcontentloaded' });
      const status = result?.status() || 0; await routePage.close(); return status;
    });
    routeResults.push({ route, status: response });
    if (response !== 200) failures.push(`${route}: HTTP ${response}`);
  }

  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = []; trackErrors(page, errors); await seedReturningVisit(page);
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' }); await prepare(page);
    const metrics = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const signatureLinks = Array.from(document.querySelectorAll('.ecosystem-signature__project'));
      const targetSizes = signatureLinks.map((link) => { const rect = link.getBoundingClientRect(); return { width: Math.round(rect.width), height: Math.round(rect.height) }; });
      const rowTops = [...new Set(signatureLinks.map((link) => Math.round(link.getBoundingClientRect().top)))];
      const columnLefts = [...new Set(signatureLinks.map((link) => Math.round(link.getBoundingClientRect().left)))];
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
        signatureCount: signatureLinks.length,
        signatureRows: rowTops.length,
        signatureColumns: columnLefts.length,
        targetSizes,
        emptyLinks: links.filter((link) => !link.getAttribute('href')?.trim()).length,
        placeholderLinks: links.filter((link) => ['#', 'javascript:void(0)', 'javascript:;'].includes(link.getAttribute('href')?.trim().toLowerCase())).length,
        uselessAnchors: links.filter((link) => { const href = link.getAttribute('href') || ''; return href.startsWith('#') && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))); }).map((link) => link.getAttribute('href')),
        instagram: Array.from(document.querySelectorAll('a')).filter((link) => link.textContent.trim() === 'Instagram').map((link) => ({ href: link.href, target: link.target, rel: link.rel })),
        linkedin: Array.from(document.querySelectorAll('a')).filter((link) => link.textContent.trim() === 'LinkedIn').map((link) => ({ href: link.href, target: link.target, rel: link.rel })),
        schemaInstagram: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).some((script) => script.textContent.includes('https://www.instagram.com/vitairos_com')),
        signatureHrefs: signatureLinks.map((link) => new URL(link.href).pathname),
        scrollHeight: document.documentElement.scrollHeight
      };
    });
    if (!response || response.status() !== 200) failures.push(`${name}: HTTP ${response?.status() || 0}`);
    if (metrics.overflow > 1) failures.push(`${name}: overflow horizontal ${metrics.overflow}px`);
    if (metrics.brokenImages.length) failures.push(`${name}: imágenes rotas ${metrics.brokenImages.join(', ')}`);
    if (metrics.signatureCount !== 4) failures.push(`${name}: firma con ${metrics.signatureCount} proyectos`);
    if (metrics.targetSizes.some((size) => size.width < 44 || size.height < 44)) failures.push(`${name}: target de firma menor a 44px`);
    if (width > 820 && (metrics.signatureRows !== 1 || metrics.signatureColumns !== 4)) failures.push(`${name}: firma desktop no está en 4 columnas`);
    if (width <= 820 && (metrics.signatureRows !== 2 || metrics.signatureColumns !== 2)) failures.push(`${name}: firma mobile no está en 2×2`);
    if (metrics.emptyLinks || metrics.placeholderLinks || metrics.uselessAnchors.length) failures.push(`${name}: enlaces vacíos/placeholders/anclas inútiles`);
    if (metrics.signatureHrefs.join('|') !== routes.join('|')) failures.push(`${name}: rutas de firma incorrectas`);
    if (metrics.instagram.length !== 1 || metrics.instagram[0].href !== 'https://www.instagram.com/vitairos_com' || metrics.instagram[0].target !== '_blank' || !metrics.instagram[0].rel.includes('noopener') || !metrics.instagram[0].rel.includes('noreferrer')) failures.push(`${name}: Instagram incorrecto`);
    if (!metrics.schemaInstagram) failures.push(`${name}: Instagram ausente del schema`);
    if (metrics.linkedin.length !== 1 || metrics.linkedin[0].href !== 'https://www.linkedin.com/company/vitairos/' || metrics.linkedin[0].target !== '_blank' || !metrics.linkedin[0].rel.includes('noopener') || !metrics.linkedin[0].rel.includes('noreferrer')) failures.push(`${name}: LinkedIn incorrecto`);
    if (errors.length) failures.push(`${name}: consola ${errors.join(' | ')}`);
    viewportResults.push({ viewport: name, ...metrics, consoleErrors: errors.length });
    await context.close();
  }

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await desktopContext.newPage(); const desktopErrors = []; trackErrors(page, desktopErrors); await seedReturningVisit(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' }); await prepare(page);
  const positions = await sectionCoordinates(page);
  const whitespace = {
    ecosystemToEvidence: Math.round(positions.newsIntro.top - positions.ecosystemExperience.bottom),
    evidenceToPrinciples: Math.round(positions.principlesIntro.top - positions.newsGrid.bottom),
    signatureToClose: Math.round(positions.principlesSection.bottom - positions.signature.bottom),
    signatureHeight: Math.round(positions.signature.height)
  };
  if (whitespace.ecosystemToEvidence < 150 || whitespace.ecosystemToEvidence > 235) failures.push(`Whitespace Ecosistema→Evidencia fuera de rango: ${whitespace.ecosystemToEvidence}px`);
  if (whitespace.evidenceToPrinciples < 150 || whitespace.evidenceToPrinciples > 245) failures.push(`Whitespace Evidencia→Por qué fuera de rango: ${whitespace.evidenceToPrinciples}px`);
  if (whitespace.signatureToClose > 120) failures.push(`Whitespace tras firma excesivo: ${whitespace.signatureToClose}px`);

  const ambientLifecycle = {};
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(220);
  ambientLifecycle.outside = await page.locator('[data-ambient-network].is-ambient-active').count();
  await page.locator('#actualidad').scrollIntoViewIfNeeded(); await page.waitForTimeout(240);
  ambientLifecycle.inside = await page.locator('#actualidad [data-ambient-network].is-ambient-active').count();
  const evidenceBox = await page.locator('#actualidad').boundingBox();
  if (evidenceBox) await page.mouse.move(evidenceBox.x + evidenceBox.width * .76, evidenceBox.y + Math.min(evidenceBox.height * .36, 500));
  await page.waitForTimeout(80);
  ambientLifecycle.pointerShift = await page.locator('#actualidad [data-ambient-network]').evaluate((node) => ({ x: getComputedStyle(node).getPropertyValue('--ambient-shift-x').trim(), y: getComputedStyle(node).getPropertyValue('--ambient-shift-y').trim() }));
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(240);
  ambientLifecycle.pausedAgain = await page.locator('[data-ambient-network].is-ambient-active').count();
  if (ambientLifecycle.outside !== 0 || ambientLifecycle.inside !== 1 || ambientLifecycle.pausedAgain !== 0) failures.push('Ambient: no pausa/reactiva correctamente según viewport');
  if (!ambientLifecycle.pointerShift.x || ambientLifecycle.pointerShift.x === '0px') failures.push('Ambient: respuesta de puntero no detectada');

  await scrollScreenshot(page, positions.ecosystemExperience.bottom - 250, 'homepage-v3-2-1-01-ecosystem-to-evidence.png');
  await scrollScreenshot(page, positions.newsGrid.bottom - 250, 'homepage-v3-2-1-02-evidence-to-principles.png');
  await scrollScreenshot(page, positions.aboutNote.top - 130, 'homepage-v3-2-1-03-principles-signature.png');
  for (const [project, number, slug] of [['m','04','m'],['industrial','05','industrial'],['agro','06','agro'],['conecta','07','conecta']]) {
    await page.locator(`[data-signature-project="${project}"]`).hover(); await page.waitForTimeout(300);
    const state = await page.evaluate((key) => ({ active: document.getElementById('ecosystemSignature').dataset.activeProject, categoryOpacity: Number.parseFloat(getComputedStyle(document.querySelector(`[data-signature-project="${key}"] small`)).opacity) }), project);
    if (state.active !== project || state.categoryOpacity < .5) failures.push(`Firma ${project}: hover/focus no activa identidad`);
    await page.locator('#ecosystemSignature').screenshot({ path: path.join(outputDir, `homepage-v3-2-1-${number}-hover-${slug}.png`) });
    await page.locator(`[data-signature-project="${project}"]`).focus(); await page.waitForTimeout(40);
    const focusState = await page.evaluate((key) => ({ active: document.getElementById('ecosystemSignature').dataset.activeProject, categoryOpacity: Number.parseFloat(getComputedStyle(document.querySelector(`[data-signature-project="${key}"] small`)).opacity) }), project);
    if (focusState.active !== project || focusState.categoryOpacity < .5) failures.push(`Firma ${project}: foco de teclado no activa identidad`);
  }
  await scrollScreenshot(page, positions.footer.top - 280, 'homepage-v3-2-1-09-footer-instagram.png');
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, 'homepage-v3-2-1-10-desktop-full.png'), fullPage: true });
  await desktopContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobileContext.newPage(); await seedReturningVisit(mobilePage); await mobilePage.goto(baseUrl, { waitUntil: 'networkidle' }); await prepare(mobilePage);
  const mobilePositions = await sectionCoordinates(mobilePage);
  await scrollScreenshot(mobilePage, mobilePositions.signature.top - 190, 'homepage-v3-2-1-08-mobile-signature.png');
  await mobilePage.evaluate(() => scrollTo(0, 0)); await mobilePage.waitForTimeout(100);
  await mobilePage.screenshot({ path: path.join(outputDir, 'homepage-v3-2-1-11-mobile-full.png'), fullPage: true });
  await mobileContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage(); await seedReturningVisit(reducedPage); await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' }); await prepare(reducedPage);
  const reducedMotion = await reducedPage.evaluate(() => ({
    activeAmbient: document.querySelectorAll('[data-ambient-network].is-ambient-active').length,
    animations: Array.from(document.querySelectorAll('.ambient-network__links path,.ambient-network__nodes circle')).map((node) => getComputedStyle(node).animationName),
    signatureLinks: document.querySelectorAll('.ecosystem-signature__project').length,
    signatureLayout: getComputedStyle(document.querySelector('.ecosystem-signature__projects')).gridTemplateColumns
  }));
  if (reducedMotion.activeAmbient !== 0 || reducedMotion.animations.some((name) => name !== 'none') || reducedMotion.signatureLinks !== 4) failures.push('Reduced motion: movimiento ambiental activo o firma no usable');
  await reducedContext.close();

  await browser.close();
  const summary = { branch: require('node:child_process').execSync('git branch --show-current', { cwd: path.resolve(__dirname, '..') }).toString().trim(), whitespace, ambientLifecycle, reducedMotion, routes: routeResults, viewports: viewportResults.map(({ viewport, overflow, brokenImages, signatureRows, signatureColumns, scrollHeight, consoleErrors }) => ({ viewport, overflow, brokenImages: brokenImages.length, signatureRows, signatureColumns, scrollHeight, consoleErrors })), failures };
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = failures.length ? 1 : 0;
})().catch((error) => { console.error(error); process.exitCode = 1; });
