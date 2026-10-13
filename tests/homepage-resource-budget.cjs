const fs = require('node:fs');
const { chromium } = require('playwright');

const target = process.env.HOMEPAGE_URL || 'http://127.0.0.1:4173/';

(async () => {
  const browserCandidates = [
    process.env.PLAYWRIGHT_BROWSER_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const responses = new Map();

  page.on('response', async (response) => {
    const request = response.request();
    const url = response.url();
    if (!url.startsWith(target)) return;

    try {
      const body = await response.body();
      responses.set(url, {
        url,
        type: request.resourceType(),
        status: response.status(),
        bytes: body.byteLength,
        contentType: (await response.allHeaders())['content-type'] || '',
      });
    } catch {
      responses.set(url, {
        url,
        type: request.resourceType(),
        status: response.status(),
        bytes: 0,
        contentType: '',
      });
    }
  });

  await page.goto(target, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(750);

  const assets = [...responses.values()].sort((a, b) => a.url.localeCompare(b.url));
  const categoryFor = (asset) => {
    if (asset.type === 'document') return 'html';
    if (asset.type === 'stylesheet') return 'css';
    if (asset.type === 'script') return 'js';
    if (asset.type === 'image' || asset.contentType.startsWith('image/')) return 'images_svg';
    if (asset.type === 'font') return 'fonts';
    return asset.type || 'other';
  };
  const totals = assets.reduce((acc, asset) => {
    const category = categoryFor(asset);
    acc[category] = (acc[category] || 0) + asset.bytes;
    acc.total = (acc.total || 0) + asset.bytes;
    return acc;
  }, {});

  console.log(JSON.stringify({ target, totals, assets }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
