import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const filePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(filePath), '..');
const screenshotDir = path.join(repoRoot, 'docs', 'screenshots', 'agro-v2-final');
const port = Number(process.env.AGRO_QA_PORT || 4174);
const baseUrl = `http://127.0.0.1:${port}`;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'desktop-1024', width: 1024, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 720 }
];
const regressionRoutes = ['/', '/vitairos-m/', '/conecta/', '/vitairos-industrial-ai/'];

const probeServer = () => new Promise((resolve, reject) => {
  const request = http.get(`${baseUrl}/agro-intelligence/`, (response) => {
    response.resume();
    response.on('end', () => {
      if (response.statusCode === 200) resolve();
      else reject(new Error(`HTTP ${response.statusCode}`));
    });
  });
  request.setTimeout(1000, () => request.destroy(new Error('timeout')));
  request.on('error', reject);
});

const waitForServer = async () => {
  let lastError;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await probeServer();
      return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw lastError || new Error('No fue posible iniciar el servidor de QA.');
};

const server = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: repoRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true
});

const failures = [];
const warnings = [];
const results = [];
const regressions = [];
let browser;

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const installVitalsObserver = async (page) => {
  await page.addInitScript(() => {
    window.__qaVitals = { cls: 0, lcp: 0, longTasks: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__qaVitals.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        window.__qaVitals.lcp = entries.at(-1)?.startTime || window.__qaVitals.lcp;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        window.__qaVitals.longTasks += list.getEntries().length;
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
  });
};

const captureFullPage = async (page, outputPath, width, viewportHeight) => {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  if (pageHeight <= 16000) {
    await page.screenshot({ path: outputPath, fullPage: true });
    return;
  }

  await page.addStyleTag({ content: '.site-header{position:absolute!important}.contact-copy{position:static!important}' });
  const positions = [];
  for (let top = 0; top < pageHeight - viewportHeight; top += viewportHeight) positions.push(top);
  positions.push(Math.max(0, pageHeight - viewportHeight));
  const layers = [];

  for (const top of [...new Set(positions)]) {
    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), top);
    const input = await page.screenshot({ fullPage: false });
    layers.push({ input, left: 0, top });
  }

  await sharp({ create: { width, height: pageHeight, channels: 4, background: '#ffffff' } })
    .composite(layers)
    .png()
    .toFile(outputPath);
};

const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;'
})[character]);

const createContactSheet = async () => {
  const cardWidth = 368;
  const cardGap = 12;
  const canvasWidth = 5 * cardWidth + 6 * cardGap;
  const canvasHeight = 1730;
  const composites = [];
  let decoration = '<rect width="100%" height="100%" fill="#061720"/>';
  decoration += '<text x="24" y="38" fill="#f3faf8" font-family="Arial" font-size="21" font-weight="700">VITAIROS Agro Intelligence · QA visual final</text>';

  for (const [index, viewport] of viewports.entries()) {
    const screenshot = path.join(screenshotDir, `${viewport.name}.png`);
    const metadata = await sharp(screenshot).metadata();
    const sourceHeight = metadata.height || viewport.height;
    const sourceWidth = metadata.width || viewport.width;
    const cropHeight = Math.min(viewport.height, sourceHeight);
    const positions = [0, Math.max(0, Math.round(sourceHeight * 0.48 - cropHeight / 2)), Math.max(0, sourceHeight - cropHeight)];
    const x = cardGap + index * (cardWidth + cardGap);
    decoration += `<rect x="${x}" y="58" width="${cardWidth}" height="1648" rx="12" fill="#0a222d" stroke="#1e4854"/>`;
    decoration += `<text x="${x + 16}" y="89" fill="#75e2b1" font-family="Arial" font-size="15" font-weight="700">${escapeXml(viewport.name)} · ${viewport.width}px</text>`;

    for (const [cropIndex, top] of positions.entries()) {
      const y = 114 + cropIndex * 524;
      const buffer = await sharp(screenshot)
        .extract({ left: 0, top, width: sourceWidth, height: cropHeight })
        .resize({ width: cardWidth - 24, height: 482, fit: 'contain', background: '#061720' })
        .png()
        .toBuffer();
      composites.push({ input: buffer, left: x + 12, top: y });
      const label = ['Hero', 'Desarrollo', 'Formulario + footer'][cropIndex];
      decoration += `<text x="${x + 17}" y="${y + 500}" fill="#8ca8ae" font-family="Arial" font-size="12">${label}</text>`;
    }
  }

  composites.unshift({ input: Buffer.from(`<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">${decoration}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: canvasWidth, height: canvasHeight, channels: 4, background: '#061720' } })
    .composite(composites)
    .png()
    .toFile(path.join(screenshotDir, 'agro-v2-final-contact-sheet.png'));
};

try {
  const htmlSource = await readFile(path.join(repoRoot, 'agro-intelligence', 'index.html'), 'utf8');
  const scriptSource = await readFile(path.join(repoRoot, 'agro-intelligence', 'script.js'), 'utf8');
  const forbiddenClaims = [
    /\bMaaS\b/i,
    /\bRAG\b/i,
    /\bOpenAI\b/i,
    /\bGPT(?:-\w+)?\b/i,
    /embeddings?/i,
    /vector database/i,
    /fine[- ]tuning/i,
    /chain[- ]of[- ]thought/i,
    /\bROI\b/i,
    /mayor rentabilidad/i,
    /predicciones precisas/i,
    /decisiones autónomas/i,
    /revolucionamos la agricultura/i,
    /optimiza automáticamente el riego/i,
    /ahorra\w*\s+\d+\s*%/i,
    /cliente[^.]{0,80}Duoc|Duoc[^.]{0,80}cliente/i
  ];
  forbiddenClaims.forEach((pattern) => check(!pattern.test(htmlSource), `Claim prohibido encontrado: ${pattern}`));
  check(/Primera validación en terreno junto a Duoc UC Quillota/i.test(htmlSource), 'Falta la formulación aprobada para Duoc UC Quillota.');
  check(/En preparación/i.test(htmlSource), 'La validación de terreno no está marcada como “En preparación”.');
  check(!/(?:sk-[A-Za-z0-9_-]{12,}|BEGIN (?:RSA |EC )?PRIVATE KEY|api[_-]?key\s*[=:])/i.test(`${htmlSource}\n${scriptSource}`), 'Posible secreto o clave expuesto en archivos productivos.');
  check(!/(?:file:\/\/|localhost|127\.0\.0\.1|[A-Za-z]:\\\\)/i.test(`${htmlSource}\n${scriptSource}`), 'Referencia local expuesta en archivos productivos.');

  await waitForServer();
  await mkdir(screenshotDir, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: edgePath });

  const warmupContext = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
  const warmupPage = await warmupContext.newPage();
  await warmupPage.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'load' });
  await warmupContext.close();

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
      deviceScaleFactor: 1,
      locale: 'es-CL'
    });
    const page = await context.newPage();
    await installVitalsObserver(page);
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));

    const response = await page.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'networkidle' });
    check(response?.status() === 200, `${viewport.name}: la ruta principal no respondió 200.`);
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-visible')));
    await page.waitForTimeout(250);

    const audit = await page.evaluate(() => {
      const root = document.documentElement;
      const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
      const missingAnchors = anchors.map((link) => link.getAttribute('href')).filter((href) => href && href !== '#' && !document.querySelector(href));
      const images = Array.from(document.images);
      const resources = performance.getEntriesByType('resource');
      const navigation = performance.getEntriesByType('navigation')[0];
      const firstPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;
      const visibleButtons = Array.from(document.querySelectorAll('.button')).filter((button) => button.getClientRects().length > 0);
      return {
        title: document.title,
        h1Count: document.querySelectorAll('h1').length,
        h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        description: document.querySelector('meta[name="description"]')?.content,
        overflow: root.scrollWidth - root.clientWidth,
        missingAnchors,
        brokenImages: images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
        currentHero: document.querySelector('.hero-visual img')?.currentSrc,
        formAction: document.querySelector('#diagnosticForm')?.action,
        menuVisible: getComputedStyle(document.querySelector('#menuToggle')).display !== 'none',
        minButtonHeight: Math.min(...visibleButtons.map((button) => button.getBoundingClientRect().height)),
        duplicateIds: Array.from(new Set(Array.from(document.querySelectorAll('[id]')).map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index))),
        unnamedInteractive: Array.from(document.querySelectorAll('a,button,input:not([type="hidden"]),select,textarea')).filter((node) => {
          if (node.getClientRects().length === 0) return false;
          const name = node.getAttribute('aria-label') || node.labels?.[0]?.textContent || node.textContent || node.getAttribute('title') || '';
          return !name.trim();
        }).map((node) => node.tagName + (node.id ? `#${node.id}` : '')),
        performance: {
          fcp: Math.round(firstPaint),
          lcp: Math.round(window.__qaVitals?.lcp || 0),
          cls: Number((window.__qaVitals?.cls || 0).toFixed(4)),
          longTasks: window.__qaVitals?.longTasks || 0,
          load: Math.round(navigation?.loadEventEnd || 0),
          transferBytes: Math.round((navigation?.transferSize || 0) + resources.reduce((total, item) => total + (item.transferSize || 0), 0)),
          requests: resources.length + 1
        }
      };
    });

    check(audit.title === 'VITAIROS Agro Intelligence | Inteligencia operacional para agricultura', `${viewport.name}: title SEO inesperado.`);
    check(audit.h1Count === 1, `${viewport.name}: se esperó un único H1 y se encontraron ${audit.h1Count}.`);
    check(audit.h1?.startsWith('Más control sobre el riego.'), `${viewport.name}: H1 principal incorrecto.`);
    check(audit.canonical === 'https://www.vitairos.com/agro-intelligence/', `${viewport.name}: canonical incorrecto.`);
    check(Boolean(audit.description), `${viewport.name}: falta meta description.`);
    check(audit.overflow <= 1, `${viewport.name}: overflow horizontal de ${audit.overflow}px.`);
    check(audit.missingAnchors.length === 0, `${viewport.name}: anchors sin destino: ${audit.missingAnchors.join(', ')}`);
    check(audit.brokenImages.length === 0, `${viewport.name}: imágenes rotas: ${audit.brokenImages.join(', ')}`);
    check(audit.formAction === 'https://formsubmit.co/contacto@vitairos.com', `${viewport.name}: se alteró el backend del formulario.`);
    check(audit.minButtonHeight >= 42, `${viewport.name}: botón menor a 42px (${audit.minButtonHeight}px).`);
    check(audit.duplicateIds.length === 0, `${viewport.name}: IDs duplicados: ${audit.duplicateIds.join(', ')}.`);
    check(audit.unnamedInteractive.length === 0, `${viewport.name}: controles sin nombre accesible: ${audit.unnamedInteractive.join(', ')}.`);
    check(audit.performance.lcp > 0 && audit.performance.lcp <= 2500, `${viewport.name}: LCP local material (${audit.performance.lcp} ms).`);
    check(audit.performance.cls <= 0.1, `${viewport.name}: CLS material (${audit.performance.cls}).`);
    check(audit.performance.transferBytes <= 800000, `${viewport.name}: transferencia local superior a 800 KB (${audit.performance.transferBytes} bytes).`);
    check(pageErrors.length === 0, `${viewport.name}: errores JavaScript: ${pageErrors.join(' | ')}`);
    check(consoleErrors.length === 0, `${viewport.name}: errores de consola: ${consoleErrors.join(' | ')}`);
    check(failedRequests.length === 0, `${viewport.name}: requests fallidas: ${failedRequests.join(' | ')}`);

    if (viewport.width <= 900) {
      check(audit.menuVisible, `${viewport.name}: el botón de menú móvil no está visible.`);
      await page.locator('#menuToggle').click();
      check(await page.locator('#mobileMenu').isVisible(), `${viewport.name}: el menú móvil no abre.`);
      await page.locator('#menuToggle').click();
      check(!(await page.locator('#mobileMenu').isVisible()), `${viewport.name}: el menú móvil no cierra.`);
    }

    await captureFullPage(page, path.join(screenshotDir, `${viewport.name}.png`), viewport.width, viewport.height);
    results.push({ viewport: viewport.name, ...audit, consoleErrors, pageErrors, failedRequests });
    await context.close();
  }

  await createContactSheet();

  const auditContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', locale: 'es-CL' });
  const auditPage = await auditContext.newPage();
  await auditPage.addInitScript(() => { window.dataLayer = []; });
  await auditPage.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'networkidle' });
  const jsonLd = await auditPage.locator('script[type="application/ld+json"]').textContent();
  try {
    JSON.parse(jsonLd || '');
  } catch (error) {
    failures.push(`JSON-LD inválido: ${error.message}`);
  }

  const semanticAudit = await auditPage.evaluate(() => {
    const formControls = Array.from(document.querySelectorAll('#diagnosticForm input:not([type="hidden"]), #diagnosticForm select, #diagnosticForm textarea'));
    const today = document.querySelector('.roadmap-stage--now')?.textContent || '';
    const next = document.querySelector('.roadmap-stage--next')?.textContent || '';
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((heading) => Number(heading.tagName.slice(1)));
    const headingJumps = headings.filter((level, index) => index > 0 && level - headings[index - 1] > 1);
    const form = document.querySelector('#diagnosticForm');
    const email = document.querySelector('#email');
    email.value = 'correo-invalido';
    const result = {
      imagesWithoutAlt: Array.from(document.images).filter((image) => !image.hasAttribute('alt')).length,
      unlabeledFormControls: formControls.filter((control) => !control.labels?.length).map((control) => control.name || control.id),
      todayContainsFutureSources: /sensores|IoT|5G|drones/i.test(today),
      nextContainsFutureSources: /sensores/i.test(next) && /IoT/i.test(next) && /5G/i.test(next),
      hasMain: Boolean(document.querySelector('main')),
      hasNav: Boolean(document.querySelector('nav')),
      hasFooter: Boolean(document.querySelector('footer')),
      headingJumps: headingJumps.length,
      initialFormValid: form.checkValidity(),
      invalidEmailRejected: email.validity.typeMismatch,
      invalidRequiredCount: Array.from(form.elements).filter((control) => control.willValidate && !control.validity.valid).length,
      honeypot: {
        exists: Boolean(form.elements._honey),
        tabIndex: form.elements._honey?.tabIndex,
        className: form.elements._honey?.closest('label')?.className
      },
      nextUrl: form.elements._next?.value,
      heroCta: {
        text: document.querySelector('[data-analytics="hero_cta"]')?.textContent.trim(),
        href: document.querySelector('[data-analytics="hero_cta"]')?.getAttribute('href')
      },
      social: {
        ogTitle: document.querySelector('meta[property="og:title"]')?.content,
        ogDescription: document.querySelector('meta[property="og:description"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content,
        ogImageAlt: document.querySelector('meta[property="og:image:alt"]')?.content,
        twitterCard: document.querySelector('meta[name="twitter:card"]')?.content,
        twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content,
        twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content,
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.content,
        twitterImageAlt: document.querySelector('meta[name="twitter:image:alt"]')?.content
      }
    };
    email.value = '';
    return result;
  });

  check(semanticAudit.imagesWithoutAlt === 0, `Hay ${semanticAudit.imagesWithoutAlt} imágenes sin atributo alt.`);
  check(semanticAudit.unlabeledFormControls.length === 0, `Controles sin label: ${semanticAudit.unlabeledFormControls.join(', ')}`);
  check(!semanticAudit.todayContainsFutureSources, 'La columna “Hoy” mezcla fuentes futuras.');
  check(semanticAudit.nextContainsFutureSources, 'La columna de expansión no identifica sensores, IoT y 5G.');
  check(semanticAudit.hasMain && semanticAudit.hasNav && semanticAudit.hasFooter, 'Faltan landmarks semánticos principales.');
  check(semanticAudit.headingJumps === 0, `Jerarquía de encabezados con ${semanticAudit.headingJumps} saltos.`);
  check(!semanticAudit.initialFormValid && semanticAudit.invalidRequiredCount >= 1, 'La validación nativa no bloquea el formulario vacío.');
  check(semanticAudit.invalidEmailRejected, 'El email inválido no activa typeMismatch.');
  check(semanticAudit.honeypot.exists && semanticAudit.honeypot.tabIndex === -1 && semanticAudit.honeypot.className === 'form-honey', 'Honeypot ausente o expuesto al teclado.');
  check(semanticAudit.nextUrl === 'https://www.vitairos.com/agro-intelligence/?enviado=1#diagnostico', 'Redirect de éxito inesperado.');
  check(semanticAudit.heroCta.text === 'Solicitar diagnóstico de gestión hídrica' && semanticAudit.heroCta.href === '#diagnostico', 'CTA principal del hero no está alineado con gestión hídrica.');
  check(Boolean(semanticAudit.social.ogTitle && semanticAudit.social.ogDescription && semanticAudit.social.ogImage && semanticAudit.social.ogImageAlt), 'Open Graph incompleto.');
  check(semanticAudit.social.twitterCard === 'summary_large_image' && Boolean(semanticAudit.social.twitterTitle && semanticAudit.social.twitterDescription && semanticAudit.social.twitterImage && semanticAudit.social.twitterImageAlt), 'Twitter/X Card incompleta.');

  await auditPage.locator('[data-analytics="hero_cta"]').click();
  const heroTargetTop = await auditPage.evaluate(() => document.querySelector('#diagnostico').getBoundingClientRect().top);
  check(heroTargetTop >= 0 && heroTargetTop < 180, `CTA principal deja el destino fuera de contexto (${heroTargetTop}px).`);
  await auditPage.locator('[data-intent="integration"]').click();
  const integrationState = await auditPage.evaluate(() => ({
    intent: document.querySelector('#contactIntent').value,
    challenge: document.querySelector('#challenge').value,
    copy: document.querySelector('#formIntentCopy').textContent.trim()
  }));
  check(integrationState.intent === 'Integración tecnológica para el agro', 'CTA de integración no actualiza la intención del formulario.');
  check(integrationState.challenge === 'Explorar una integración tecnológica', 'CTA de integración no preselecciona el desafío.');
  check(/integración tecnológica/i.test(integrationState.copy), 'CTA de integración no adapta el contexto del formulario.');
  await auditPage.locator('.desktop-nav [data-analytics="diagnostic_cta"]').click();
  await auditPage.evaluate(() => {
    const form = document.querySelector('#diagnosticForm');
    form.addEventListener('submit', (event) => event.preventDefault(), { capture: true, once: true });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  const analyticsEvents = await auditPage.evaluate(() => window.dataLayer.map((item) => item.event));
  for (const eventName of ['hero_cta', 'diagnostic_cta', 'integration_cta', 'contact_submit']) {
    check(analyticsEvents.includes(eventName), `Evento analítico ausente: ${eventName}.`);
  }

  await auditPage.goto(`${baseUrl}/agro-intelligence/?enviado=1#diagnostico`, { waitUntil: 'networkidle' });
  check(await auditPage.locator('#formSuccess').isVisible(), 'El estado de envío exitoso no se muestra con ?enviado=1.');
  check(await auditPage.locator('#diagnosticForm').getAttribute('aria-describedby') === 'formSuccess', 'El estado exitoso no queda asociado al formulario.');
  await auditPage.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'networkidle' });
  await auditPage.keyboard.press('Tab');
  const focusAudit = await auditPage.evaluate(() => {
    const active = document.activeElement;
    const style = getComputedStyle(active);
    return { text: active.textContent.trim(), visible: active.getClientRects().length > 0, outline: `${style.outlineStyle} ${style.outlineWidth}`, boxShadow: style.boxShadow };
  });
  check(focusAudit.text === 'Saltar al contenido principal' && focusAudit.visible, 'El primer foco no expone el skip link.');
  check(!focusAudit.outline.startsWith('none') || focusAudit.boxShadow !== 'none', 'El foco visible no tiene indicador perceptible.');
  await auditContext.close();

  const ogMetadata = await sharp(path.join(repoRoot, 'agro-intelligence', 'assets', 'agro-intelligence-og-1200x630.jpg')).metadata();
  check(ogMetadata.width === 1200 && ogMetadata.height === 630 && ogMetadata.format === 'jpeg', `OG image inválida: ${ogMetadata.width}×${ogMetadata.height} ${ogMetadata.format}.`);

  const regressionContext = await browser.newContext({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce', locale: 'es-CL' });
  for (const route of regressionRoutes) {
    const page = await regressionContext.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const routeAudit = await page.evaluate(() => ({
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      stylesheets: Array.from(document.styleSheets).length,
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      nav: Boolean(document.querySelector('nav')),
      footer: Boolean(document.querySelector('footer'))
    }));
    check(response?.status() === 200, `Regresión ${route}: HTTP ${response?.status()}.`);
    check(Boolean(routeAudit.title) && routeAudit.h1Count === 1, `Regresión ${route}: title/H1 inesperado.`);
    check(routeAudit.stylesheets >= 1, `Regresión ${route}: CSS no cargó.`);
    check(routeAudit.brokenImages.length === 0, `Regresión ${route}: assets rotos: ${routeAudit.brokenImages.join(', ')}.`);
    check(routeAudit.overflow <= 1, `Regresión ${route}: overflow horizontal de ${routeAudit.overflow}px.`);
    check(routeAudit.nav && routeAudit.footer, `Regresión ${route}: faltan navegación o footer.`);
    check(consoleErrors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0, `Regresión ${route}: errores runtime o requests fallidas.`);
    regressions.push({ route, status: response?.status(), ...routeAudit, consoleErrors, pageErrors, failedRequests });
    await page.close();
  }

  for (const assetPath of ['/robots.txt', '/sitemap.xml', '/favicon.ico', '/favicon-96x96.png', '/apple-touch-icon.png', '/agro-intelligence/sitemap.xml', '/agro-intelligence/politica-privacidad/', '/agro-intelligence/terminos/']) {
    const response = await regressionContext.request.get(`${baseUrl}${assetPath}`);
    check(response.status() === 200, `Regresión de asset/ruta ${assetPath}: HTTP ${response.status()}.`);
    check((await response.body()).length > 0, `Regresión de asset/ruta ${assetPath}: respuesta vacía.`);
  }
  await regressionContext.close();
} finally {
  if (browser) await browser.close();
  server.kill();
}

console.log(JSON.stringify({ ok: failures.length === 0, failures, warnings, results, regressions }, null, 2));
if (failures.length > 0) process.exitCode = 1;
