const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.VITAIROS_PREVIEW_URL || "http://127.0.0.1:4173/";
const outputDir = path.resolve(__dirname, "..", "preview");
const viewports = [
  ["1920x1080", 1920, 1080],
  ["1440x900", 1440, 900],
  ["1366x768", 1366, 768],
  ["1024x768", 1024, 768],
  ["768x1024", 768, 1024],
  ["430x932", 430, 932],
  ["390x844", 390, 844],
  ["360x800", 360, 800]
];

const browserCandidates = [
  process.env.PLAYWRIGHT_BROWSER_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));

async function revealPage(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.8));
    for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
      window.scrollTo(0, position);
      await new Promise((resolve) => setTimeout(resolve, 28));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 80));
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 80));
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
    if (document.activeElement && document.activeElement instanceof HTMLElement) document.activeElement.blur();
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
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const response = await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(120);

    const metrics = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      main: Boolean(document.querySelector("main")),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      height: document.documentElement.scrollHeight,
      visibleReveals: Array.from(document.querySelectorAll(".reveal")).every((node) => node.classList.contains("is-visible") && Number.parseFloat(getComputedStyle(node).opacity) > 0.99),
      brokenImages: Array.from(document.images).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.currentSrc || image.src)
    }));

    const status = response ? response.status() : 0;
    if (status !== 200) failures.push(`${name}: HTTP ${status}`);
    if (metrics.h1 !== 1 || !metrics.main) failures.push(`${name}: estructura semántica incompleta`);
    if (metrics.overflow > 1) failures.push(`${name}: overflow horizontal de ${metrics.overflow}px`);
    if (!metrics.visibleReveals) failures.push(`${name}: existen reveals sin mostrar al final del scroll`);
    if (metrics.brokenImages.length) failures.push(`${name}: imágenes rotas: ${metrics.brokenImages.join(", ")}`);
    if (consoleErrors.length) failures.push(`${name}: consola: ${consoleErrors.join(" | ")}`);

    results.push({ viewport: name, status, ...metrics, consoleErrors });
    await context.close();
  }

  const functionalContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const functionalPage = await functionalContext.newPage();
  await functionalPage.goto(baseUrl, { waitUntil: "networkidle" });
  await functionalPage.click("#menuToggle");
  const menuOpened = await functionalPage.evaluate(() => {
    const button = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenu");
    return button?.getAttribute("aria-expanded") === "true" && menu?.hidden === false && document.body.classList.contains("menu-open");
  });
  await functionalPage.keyboard.press("Escape");
  const menuClosed = await functionalPage.evaluate(() => {
    const button = document.getElementById("menuToggle");
    const menu = document.getElementById("mobileMenu");
    return button?.getAttribute("aria-expanded") === "false" && menu?.hidden === true && document.activeElement === button;
  });
  if (!menuOpened) failures.push("Interacción móvil: el menú no abre con estado accesible coherente");
  if (!menuClosed) failures.push("Interacción móvil: Escape no cierra/restaura foco correctamente");

  const internalRoutes = await functionalPage.evaluate(() => Array.from(new Set(
    Array.from(document.querySelectorAll("a[href^='/']"), (link) => link.getAttribute("href")).filter((href) => href && href.endsWith("/"))
  )));
  const routeStatuses = {};
  for (const route of internalRoutes) {
    const routeResponse = await functionalContext.request.get(new URL(route, baseUrl).toString());
    routeStatuses[route] = routeResponse.status();
    if (routeResponse.status() !== 200) failures.push(`Enlace interno ${route}: HTTP ${routeResponse.status()}`);
  }
  await functionalContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(baseUrl, { waitUntil: "networkidle" });
  const reducedMotionApplied = await reducedPage.evaluate(() => {
    const reveal = document.querySelector(".reveal");
    const duration = reveal ? Number.parseFloat(getComputedStyle(reveal).transitionDuration) : 1;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches && duration < 0.01;
  });
  if (!reducedMotionApplied) failures.push("Accesibilidad: prefers-reduced-motion no se aplicó correctamente");
  await reducedContext.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const desktopPage = await desktop.newPage();
  await desktopPage.goto(baseUrl, { waitUntil: "networkidle" });
  await desktopPage.screenshot({ path: path.join(outputDir, "homepage-v2-hero.png") });
  await revealPage(desktopPage);
  await desktopPage.screenshot({ path: path.join(outputDir, "homepage-v2-desktop-full.png"), fullPage: true });
  await desktopPage.locator(".breach").screenshot({ path: path.join(outputDir, "homepage-v2-section-breach.png") });
  await desktopPage.locator(".verticals").screenshot({ path: path.join(outputDir, "homepage-v2-section-solutions.png") });
  await desktopPage.locator(".capabilities").screenshot({ path: path.join(outputDir, "homepage-v2-section-capabilities.png") });
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
  await revealPage(mobilePage);
  await mobilePage.screenshot({ path: path.join(outputDir, "homepage-v2-mobile-full.png"), fullPage: true });
  await mobile.close();

  const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const ogPage = await og.newPage();
  await ogPage.goto(baseUrl, { waitUntil: "networkidle" });
  await ogPage.screenshot({ path: path.resolve(__dirname, "..", "assets", "homepage-v2-og.png") });
  await og.close();

  await browser.close();

  console.log(JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ menuOpened, menuClosed, reducedMotionApplied, routeStatuses }, null, 2));
  if (failures.length) {
    console.error("\nBrowser QA failures:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }
  console.log("\nBrowser QA: OK en 8 viewports. Screenshots y OG generados.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
