import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const screenshotDir = path.join(repoRoot, 'docs', 'screenshots', 'agro-v2-1-intro');
const port = Number(process.env.AGRO_INTRO_QA_PORT || 4176);
const baseUrl = `http://127.0.0.1:${port}`;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const devices = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
];
const frames = [
  { name: '01-initial', at: 100 },
  { name: '02-convergence', at: 660 },
  { name: '03-isotype', at: 1370 },
  { name: '04-hero-transition', at: 2075 }
];

const server = spawn('python', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd: repoRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true
});

const failures = [];
const records = [];
let browser;
const check = (condition, message) => { if (!condition) failures.push(message); };

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await new Promise((resolve, reject) => {
        const request = http.get(`${baseUrl}/agro-intelligence/`, (response) => {
          response.resume();
          response.statusCode === 200 ? resolve() : reject(new Error(String(response.statusCode)));
        });
        request.on('error', reject);
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('No fue posible iniciar el servidor local de QA.');
};

const createContactSheet = async () => {
  const tileWidth = 370;
  const tileHeight = 280;
  const top = 52;
  const canvasWidth = tileWidth * frames.length;
  const canvasHeight = top + tileHeight * devices.length;
  const composites = [];
  let labels = '';

  for (let row = 0; row < devices.length; row += 1) {
    for (let column = 0; column < frames.length; column += 1) {
      const device = devices[row];
      const frame = frames[column];
      const file = path.join(screenshotDir, `${device.name}-${frame.name}.png`);
      const buffer = await sharp(file).resize({ width: 340, height: 220, fit: 'contain', background: '#03131c' }).png().toBuffer();
      composites.push({ input: buffer, left: column * tileWidth + 15, top: top + row * tileHeight + 34 });
      labels += `<text x="${column * tileWidth + 15}" y="${top + row * tileHeight + 22}" fill="#8ff0c0" font-family="Arial" font-size="15" font-weight="700">${device.name} · ${frame.name.replaceAll('-', ' ')}</text>`;
    }
  }

  composites.unshift({
    input: Buffer.from(`<svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg"><text x="16" y="31" fill="#fff" font-family="Arial" font-size="20" font-weight="700">VITAIROS Agro Intelligence · intro water + leaf</text>${labels}</svg>`),
    left: 0,
    top: 0
  });

  await sharp({ create: { width: canvasWidth, height: canvasHeight, channels: 4, background: '#020b11' } })
    .composite(composites)
    .png()
    .toFile(path.join(screenshotDir, 'intro-sequence-contact-sheet.png'));
};

try {
  await waitForServer();
  await mkdir(screenshotDir, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: edgePath });

  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      reducedMotion: 'no-preference',
      locale: 'es-CL'
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout.bind(window);
      window.setTimeout = (handler, timeout = 0, ...args) => {
        if (timeout === 2300) return -1;
        return nativeSetTimeout(handler, timeout, ...args);
      };
    });
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'domcontentloaded' });

    const frameStates = [];
    for (const frame of frames) {
      await page.evaluate((at) => {
        const intro = document.querySelector('#agroIntro');
        intro?.getAnimations({ subtree: true }).forEach((animation) => {
          animation.pause();
          animation.currentTime = at;
        });
      }, frame.at);
      await page.waitForTimeout(40);
      await page.screenshot({ path: path.join(screenshotDir, `${device.name}-${frame.name}.png`) });
      frameStates.push(await page.evaluate((frameName) => {
        const complete = document.querySelector('.intro-mark__complete');
        const intro = document.querySelector('#agroIntro');
        const water = document.querySelector('.intro-mark__part--water');
        const leaf = document.querySelector('.intro-mark__part--leaf');
        return {
          frame: frameName,
          completeOpacity: complete ? Number(getComputedStyle(complete).opacity) : 0,
          naturalWidth: complete?.naturalWidth || 0,
          naturalHeight: complete?.naturalHeight || 0,
          introPresent: Boolean(intro),
          introVisible: Boolean(intro?.getClientRects().length),
          introOpacity: intro ? Number(getComputedStyle(intro).opacity) : 0,
          completeDisplay: complete ? getComputedStyle(complete).display : null,
          completeVisibility: complete ? getComputedStyle(complete).visibility : null,
          completeBox: complete ? complete.getBoundingClientRect().toJSON() : null,
          completeSrc: complete?.getAttribute('src') || null,
          waterTransform: water ? getComputedStyle(water).transform : null,
          leafTransform: leaf ? getComputedStyle(leaf).transform : null
        };
      }, frame.name));
    }

    const convergenceState = frameStates.find((state) => state.frame === '02-convergence');
    const isotypeState = frameStates.find((state) => state.frame === '03-isotype');
    const transitionState = frameStates.find((state) => state.frame === '04-hero-transition');
    check(isotypeState?.completeSrc === './vitairos-logo.webp' && isotypeState?.naturalWidth > 0 && isotypeState?.naturalHeight > 0, `${device.name}: el isotipo final no corresponde al activo original.`);
    check(isotypeState?.completeOpacity > .99, `${device.name}: el isotipo original no queda completamente formado.`);
    check(convergenceState?.waterTransform && convergenceState?.leafTransform, `${device.name}: faltan los dos recorridos de convergencia.`);
    check(!transitionState?.introVisible || transitionState.introOpacity < 1, `${device.name}: la transición al hero no comenzó en el frame final.`);
    check(consoleErrors.length === 0 && pageErrors.length === 0, `${device.name}: errores de runtime.`);
    records.push({ device: device.name, frameStates, consoleErrors, pageErrors });
    await context.close();
  }

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${baseUrl}/agro-intelligence/`, { waitUntil: 'domcontentloaded' });
  await reducedPage.waitForTimeout(100);
  check(await reducedPage.locator('#agroIntro').isVisible(), 'Reduced motion: no se muestra la versión estática breve.');
  check(Number(await reducedPage.locator('.intro-mark__complete').evaluate((node) => getComputedStyle(node).opacity)) === 1, 'Reduced motion: el isotipo original no está visible.');
  await reducedPage.waitForTimeout(620);
  check((await reducedPage.locator('#agroIntro').count()) === 0, 'Reduced motion: la versión breve bloquea demasiado tiempo.');
  await reducedContext.close();

  await createContactSheet();
} finally {
  if (browser) await browser.close();
  server.kill();
}

console.log(JSON.stringify({ ok: failures.length === 0, failures, records }, null, 2));
if (failures.length) process.exitCode = 1;
