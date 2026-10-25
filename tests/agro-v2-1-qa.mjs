import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const screenshotDir = path.join(repoRoot, 'docs', 'screenshots', 'agro-v2-1');
const port = Number(process.env.AGRO_V21_QA_PORT || 4175);
const baseUrl = `http://127.0.0.1:${port}`;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'desktop-1024', width: 1024, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 720 }
];

const server = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: repoRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true
});

const failures = [];
const results = [];
let browser;
const check = (condition, message) => { if (!condition) failures.push(message); };

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await new Promise((resolve, reject) => {
        const request = http.get(`${baseUrl}/agro-intelligence/`, (response) => {
          response.resume();
          response.on('end', () => response.statusCode === 200 ? resolve() : reject(new Error(String(response.statusCode))));
        });
        request.setTimeout(1000, () => request.destroy(new Error('timeout')));
        request.on('error', reject);
      });
      return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('No fue posible iniciar el servidor de QA.');
};

const installVitals = async (page) => {
  await page.addInitScript(() => {
    window.__qaVitals = { cls: 0, lcp: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaVitals.cls += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        window.__qaVitals.lcp = list.getEntries().at(-1)?.startTime || window.__qaVitals.lcp;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  });
};

const captureFullPage = async (page, output, width, viewportHeight) => {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  if (pageHeight <= 16000) {
    await page.screenshot({ path: output, fullPage: true });
    return;
  }
  await page.addStyleTag({ content: '.site-header{position:absolute!important}.contact-copy{position:static!important}' });
  const positions = [];
  for (let top = 0; top < pageHeight - viewportHeight; top += viewportHeight) positions.push(top);
  positions.push(Math.max(0, pageHeight - viewportHeight));
  const layers = [];
  for (const top of [...new Set(positions)]) {
    await page.evaluate((scrollTop) => window.scrollTo(0, scrollTop), top);
    layers.push({ input: await page.screenshot({ fullPage: false }), left: 0, top });
  }
  await sharp({ create: { width, height: pageHeight, channels: 4, background: '#ffffff' } }).composite(layers).png().toFile(output);
};

const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' })[character]);

const createContactSheet = async () => {
  const cardWidth = 368;
  const gap = 12;
  const canvasWidth = cardWidth * 5 + gap * 6;
  const canvasHeight = 1730;
  const composites = [];
  let decoration = '<rect width="100%" height="100%" fill="#061720"/>';
  decoration += '<text x="24" y="38" fill="#f3faf8" font-family="Arial" font-size="21" font-weight="700">VITAIROS Agro Intelligence · V2.1</text>';
  for (const [index, viewport] of viewports.entries()) {
    const screenshot = path.join(screenshotDir, `${viewport.name}.png`);
    const metadata = await sharp(screenshot).metadata();
    const sourceHeight = metadata.height || viewport.height;
    const sourceWidth = metadata.width || viewport.width;
    const cropHeight = Math.min(viewport.height, sourceHeight);
    const positions = [0, Math.max(0, Math.round(sourceHeight * .48 - cropHeight / 2)), Math.max(0, sourceHeight - cropHeight)];
    const x = gap + index * (cardWidth + gap);
    decoration += `<rect x="${x}" y="58" width="${cardWidth}" height="1648" rx="12" fill="#0a222d" stroke="#1e4854"/>`;
    decoration += `<text x="${x + 16}" y="89" fill="#75e2b1" font-family="Arial" font-size="15" font-weight="700">${escapeXml(viewport.name)} · ${viewport.width}px</text>`;
    for (const [cropIndex, top] of positions.entries()) {
      const y = 114 + cropIndex * 524;
      const buffer = await sharp(screenshot).extract({ left: 0, top, width: sourceWidth, height: cropHeight }).resize({ width: cardWidth - 24, height: 482, fit: 'contain', background: '#061720' }).png().toBuffer();
      composites.push({ input: buffer, left: x + 12, top: y });
      decoration += `<text x="${x + 17}" y="${y + 500}" fill="#8ca8ae" font-family="Arial" font-size="12">${['Hero', 'Producto + sistema', 'CTA + footer'][cropIndex]}</text>`;
    }
  }
  composites.unshift({ input: Buffer.from(`<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">${decoration}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: canvasWidth, height: canvasHeight, channels: 4, background: '#061720' } }).composite(composites).png().toFile(path.join(screenshotDir, 'agro-v2-1-contact-sheet.png'));
};

try {
  const html = await readFile(path.join(repoRoot, 'agro-intelligence', 'index.html'), 'utf8');
  check((html.match(/Duoc UC Quillota/gi) || []).length === 1, 'Duoc UC Quillota debe aparecer una sola vez.');
  check(/Validación en terreno en preparación/.test(html), 'Falta el tratamiento secundario aprobado para Duoc.');
  check(/DEMO · DATOS SIMULADOS/.test(html) && /ESCENARIO DEMO/.test(html), 'El producto conceptual no está rotulado como demo.');
  check(/PRESENTE/.test(html) && /ROADMAP/.test(html), 'No se separa presente y roadmap.');
  check(!/cliente[^.]{0,80}Duoc|Duoc[^.]{0,80}cliente/i.test(html), 'Duoc aparece como cliente.');

  await waitForServer();
  await mkdir(screenshotDir, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: edgePath });

  const introContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', locale: 'es-CL' });
  const introPage = await introContext.newPage();
  await introPage.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'domcontentloaded' });
  await introPage.waitForTimeout(120);
  check(await introPage.locator('#agroIntro').isVisible(), 'La intro VITAIROS/Agro no se muestra en una primera sesión.');
  check((await introPage.locator('.intro-mark__part--water').count()) === 1, 'La intro no contiene el componente de agua original.');
  check((await introPage.locator('.intro-mark__part--leaf').count()) === 1, 'La intro no contiene el componente de hoja original.');
  check((await introPage.locator('.intro-mark__complete').getAttribute('src')) === './vitairos-logo.webp', 'La intro no resuelve al isotipo original.');
  await introPage.waitForTimeout(2900);
  check((await introPage.locator('#agroIntro').count()) === 0, 'La intro no se retira al terminar.');
  await introContext.close();

  const warmContext = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: 'reduce' });
  const warmPage = await warmContext.newPage();
  await warmPage.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'load' });
  check(await warmPage.locator('#agroIntro').isVisible(), 'Reduced motion no conserva el branding estático breve.');
  check((await warmPage.locator('.intro-mark__complete').evaluate((node) => getComputedStyle(node).opacity)) === '1', 'Reduced motion no muestra el isotipo original.');
  await warmPage.waitForFunction(() => !document.querySelector('#agroIntro'));
  await warmContext.close();

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce', deviceScaleFactor: 1, locale: 'es-CL' });
    const page = await context.newPage();
    await installVitals(page);
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    const response = await page.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.querySelector('#agroIntro'));
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-visible')));
    await page.waitForTimeout(220);
    const audit = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        statusTitle: document.title,
        h1Count: document.querySelectorAll('h1').length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pageHeight: document.documentElement.scrollHeight,
        brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
        missingAnchors: Array.from(document.querySelectorAll('a[href^="#"]')).map((link) => link.getAttribute('href')).filter((href) => href && href !== '#' && !document.querySelector(href)),
        minButton: Math.min(...Array.from(document.querySelectorAll('.button')).filter((node) => node.getClientRects().length).map((node) => node.getBoundingClientRect().height)),
        formAction: document.querySelector('#diagnosticForm')?.action,
        unnamed: Array.from(document.querySelectorAll('a,button,input:not([type="hidden"]),select,textarea')).filter((node) => node.getClientRects().length && !(node.getAttribute('aria-label') || node.labels?.[0]?.textContent || node.textContent || '').trim()).length,
        productWindow: Boolean(document.querySelector('.product-window--tour')),
        peacockFeathers: document.querySelectorAll('.peacock i').length,
        lcp: Math.round(window.__qaVitals?.lcp || 0),
        cls: Number((window.__qaVitals?.cls || 0).toFixed(4)),
        transferBytes: Math.round((navigation?.transferSize || 0) + resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0))
      };
    });
    check(response?.status() === 200, `${viewport.name}: HTTP ${response?.status()}.`);
    check(audit.statusTitle === 'VITAIROS Agro Intelligence | Inteligencia operacional para agricultura', `${viewport.name}: title inesperado.`);
    check(audit.h1Count === 1, `${viewport.name}: H1 count ${audit.h1Count}.`);
    check(audit.overflow <= 1, `${viewport.name}: overflow ${audit.overflow}px.`);
    check(audit.brokenImages.length === 0, `${viewport.name}: imágenes rotas.`);
    check(audit.missingAnchors.length === 0, `${viewport.name}: anchors ausentes ${audit.missingAnchors.join(', ')}.`);
    check(audit.minButton >= 40, `${viewport.name}: botón mínimo ${audit.minButton}px.`);
    check(audit.formAction === 'https://formsubmit.co/contacto@vitairos.com', `${viewport.name}: FormSubmit alterado.`);
    check(audit.unnamed === 0, `${viewport.name}: ${audit.unnamed} controles sin nombre.`);
    check(audit.productWindow && audit.peacockFeathers >= 16, `${viewport.name}: producto/pavo real ausente.`);
    check(audit.cls <= .1, `${viewport.name}: CLS ${audit.cls}.`);
    check(audit.transferBytes <= 900000, `${viewport.name}: transferencia ${audit.transferBytes} bytes.`);
    check(consoleErrors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0, `${viewport.name}: errores runtime/red.`);
    if (viewport.width <= 900) {
      await page.locator('#menuToggle').click();
      check(await page.locator('#mobileMenu').isVisible(), `${viewport.name}: menú no abre.`);
      await page.locator('#menuToggle').click();
      check(!(await page.locator('#mobileMenu').isVisible()), `${viewport.name}: menú no cierra.`);
    }
    await captureFullPage(page, path.join(screenshotDir, `${viewport.name}.png`), viewport.width, viewport.height);
    results.push({ viewport: viewport.name, ...audit, consoleErrors, pageErrors, failedRequests });
    await context.close();
  }

  const interactionContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', locale: 'es-CL' });
  const page = await interactionContext.newPage();
  await page.addInitScript(() => { window.dataLayer = []; });
  await page.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'networkidle' });
  await page.locator('[data-product-tab="alerts"]').click();
  await page.waitForFunction(() => document.querySelector('#tourMap')?.dataset.mode === 'alerts');
  check((await page.locator('#tourTitle').textContent()) === 'Eventos que requieren revisión', 'El tab Alertas no actualiza el producto.');
  check((await page.locator('#tourMap').getAttribute('data-mode')) === 'alerts', 'El mapa no cambia al modo Alertas.');
  await page.locator('[data-product-tab="trace"]').focus();
  await page.keyboard.press('Home');
  check((await page.locator('[data-product-tab="visibility"]').getAttribute('aria-selected')) === 'true', 'Navegación por teclado de tabs defectuosa.');
  await page.locator('[data-intent="integration"]').first().click();
  check((await page.locator('#contactIntent').inputValue()) === 'Integración tecnológica para el agro', 'CTA integración no adapta intención.');
  check((await page.locator('#challenge').inputValue()) === 'Explorar una integración tecnológica', 'CTA integración no adapta desafío.');
  await page.evaluate(() => {
    const form = document.querySelector('#diagnosticForm');
    form.addEventListener('submit', (event) => event.preventDefault(), { capture: true, once: true });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  const events = await page.evaluate(() => window.dataLayer.map((item) => item.event));
  check(events.includes('integration_cta') && events.includes('contact_submit') && events.includes('product_view'), 'Eventos analíticos V2.1 incompletos.');
  await interactionContext.close();

  await createContactSheet();
} finally {
  if (browser) await browser.close();
  server.kill();
}

console.log(JSON.stringify({ ok: failures.length === 0, failures, results }, null, 2));
if (failures.length) process.exitCode = 1;
