import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2-2-3-intro-review");
const reportPath = path.join(outputDir, "qa-results.json");
const viewports = [[1440, 900], [1024, 768], [430, 932], [390, 844], [360, 800]];
const failures = [];
const results = [];
let motionEvidence = { status: "not-attempted" };

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });

function fail(condition, message) {
  if (condition) failures.push(message);
}

async function createPage(width, height, reducedMotion = "no-preference") {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || "failed"}`));
  await page.addInitScript(() => {
    window.__introCLS = 0;
    window.__introShiftEntries = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
        window.__introCLS += entry.value;
        window.__introShiftEntries.push({
          value: entry.value,
          sources: entry.sources?.map((source) => source.node?.className || source.node?.id || source.node?.tagName || "unknown") || []
        });
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  const response = await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  if (!response || response.status() !== 200) failures.push(`HTTP ${response?.status() || "sin respuesta"} en ${width}x${height}`);
  return { context, page, consoleErrors, requestFailures };
}

async function freezeIntroAt(page, time) {
  await page.evaluate((milliseconds) => {
    document.querySelectorAll(".site-intro svg").forEach((svg) => {
      try { svg.setCurrentTime(milliseconds / 1000); svg.pauseAnimations(); } catch (error) {}
    });
    document.getAnimations().forEach((animation) => {
      const target = animation.effect?.target;
      if (target && (target.matches?.(".site-intro") || target.closest?.(".site-intro"))) {
        animation.pause();
        animation.currentTime = milliseconds;
      }
    });
  }, time);
}

async function captureAt(fileName, width, height, time) {
  const { context, page } = await createPage(width, height);
  if (time < 1700) {
    await freezeIntroAt(page, time);
    await page.waitForTimeout(40);
  } else {
    await page.waitForTimeout(time);
  }
  await page.screenshot({ path: path.join(outputDir, fileName) });
  await context.close();
}

await captureAt("01-intro-start.png", 1440, 900, 120);
await captureAt("02-intro-path.png", 1440, 900, 610);
await captureAt("03-intro-logo.png", 1440, 900, 1050);
await captureAt("04-intro-transition.png", 1440, 900, 1380);
await captureAt("05-hero-after-intro.png", 1440, 900, 1840);
await captureAt("06-intro-mobile-logo.png", 390, 844, 990);
await captureAt("07-hero-mobile-after-intro.png", 390, 844, 1840);

for (const [width, height] of viewports) {
  const { context, page, consoleErrors, requestFailures } = await createPage(width, height);
  await page.waitForTimeout(110);
  const start = await page.evaluate(() => {
    const visibleContinuities = Array.from(document.querySelectorAll(".site-intro__continuity")).filter((element) => getComputedStyle(element).display !== "none");
    const visibleNodes = visibleContinuities.flatMap((svg) => Array.from(svg.querySelectorAll(".site-intro__node"))).filter((node) => Number.parseFloat(getComputedStyle(node).opacity) > 0.05);
    return {
      pending: document.documentElement.classList.contains("intro-pending"),
      introDisplay: getComputedStyle(document.querySelector("[data-site-intro]")).display,
      visibleContinuities: visibleContinuities.length,
      visibleNodes: visibleNodes.length,
      logoSrc: document.querySelector(".site-intro__logo").getAttribute("src"),
      logoNatural: [document.querySelector(".site-intro__logo").naturalWidth, document.querySelector(".site-intro__logo").naturalHeight]
    };
  });
  await page.waitForTimeout(530);
  const path = await page.evaluate(() => {
    const visible = Array.from(document.querySelectorAll(".site-intro__continuity")).find((element) => getComputedStyle(element).display !== "none");
    const line = visible.querySelector(".site-intro__path");
    const nodes = Array.from(visible.querySelectorAll(".site-intro__node"));
    return {
      dashOffset: Number.parseFloat(getComputedStyle(line).strokeDashoffset),
      nodeOpacity: nodes.map((node) => Number.parseFloat(getComputedStyle(node).opacity)),
      pathData: line.getAttribute("d")
    };
  });
  await page.waitForTimeout(500);
  const logo = await page.evaluate(() => {
    const element = document.querySelector(".site-intro__logo");
    const filter = getComputedStyle(element).filter;
    return { opacity: Number.parseFloat(getComputedStyle(element).opacity), filter, blur: Number.parseFloat(filter.match(/[\d.]+/)?.[0] || "0") };
  });
  const transitionProbe = await createPage(width, height);
  await freezeIntroAt(transitionProbe.page, 1660);
  await transitionProbe.page.waitForTimeout(40);
  const transition = await transitionProbe.page.evaluate(() => {
    const introBrand = document.querySelector(".site-intro__brand").getBoundingClientRect();
    const headerLogo = document.querySelector(".brand img");
    const target = headerLogo.getBoundingClientRect();
    return {
      centerDelta: Math.hypot(introBrand.left + introBrand.width / 2 - target.left - target.width / 2, introBrand.top + introBrand.height / 2 - target.top - target.height / 2),
      widthDelta: Math.abs(introBrand.width - target.width),
      headerLogoOpacity: Number.parseFloat(getComputedStyle(headerLogo).opacity)
    };
  });
  await transitionProbe.context.close();
  await page.waitForTimeout(600);
  const finish = await page.evaluate(() => ({
    pending: document.documentElement.classList.contains("intro-pending"),
    hidden: document.querySelector("[data-site-intro]").hidden,
    seen: sessionStorage.getItem("vitairosMIntroSeen"),
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    bodyOverflow: getComputedStyle(document.body).overflow,
    cls: window.__introCLS,
    shiftEntries: window.__introShiftEntries,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(80);
  const reloadPending = await page.evaluate(() => document.documentElement.classList.contains("intro-pending"));
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(80);
  const secondNavigationPending = await page.evaluate(() => document.documentElement.classList.contains("intro-pending"));

  results.push({ viewport: `${width}x${height}`, start, path, logo, transition, finish, reloadPending, secondNavigationPending, consoleErrors, requestFailures });
  fail(!start.pending || start.introDisplay !== "grid", `Intro no visible al inicio en ${width}x${height}`);
  fail(start.visibleContinuities !== 1, `Geometría incorrecta: ${start.visibleContinuities} trayectorias visibles en ${width}x${height}`);
  fail(start.logoSrc !== "assets/vitairos-m-logo.png" || start.logoNatural.join("x") !== "574x166", `Logo oficial alterado en ${width}x${height}`);
  fail(path.nodeOpacity.some((opacity) => opacity < 0.95), `Los tres nodos no completaron su entrada en ${width}x${height}`);
  fail(!(path.dashOffset >= 0 && path.dashOffset < 1), `Trayectoria sin progreso verificable en ${width}x${height}`);
  fail(logo.opacity < 0.9 || logo.blur > 0.02, `Logo no está nítido en el cierre en ${width}x${height}`);
  fail(transition.centerDelta > 18 || transition.widthDelta > 18 || transition.headerLogoOpacity > 0.01, `Intercambio de marca desalineado en ${width}x${height}`);
  fail(finish.pending || !finish.hidden || finish.seen !== "1", `Intro no finalizó correctamente en ${width}x${height}`);
  fail(finish.htmlOverflow === "hidden" || finish.bodyOverflow === "hidden", `Scroll lock residual en ${width}x${height}`);
  fail(finish.cls > 0.001, `CLS ${finish.cls} en ${width}x${height}`);
  fail(finish.scrollWidth > finish.clientWidth + 1, `Overflow horizontal en ${width}x${height}`);
  fail(reloadPending || secondNavigationPending, `Intro se repite en la misma sesión en ${width}x${height}`);
  fail(consoleErrors.length > 0, `Errores de consola en ${width}x${height}: ${consoleErrors.join(" | ")}`);
  fail(requestFailures.length > 0, `Requests fallidas en ${width}x${height}: ${requestFailures.join(" | ")}`);
  await context.close();
}

fail(results[0].path.pathData === results[2].path.pathData, "Mobile reutiliza la misma geometría desktop");

{
  const { context, page, consoleErrors, requestFailures } = await createPage(390, 844, "reduce");
  await page.waitForTimeout(100);
  const reduced = await page.evaluate(() => ({
    pending: document.documentElement.classList.contains("intro-pending"),
    display: getComputedStyle(document.querySelector("[data-site-intro]")).display,
    hiddenReveals: Array.from(document.querySelectorAll("[data-reveal]")).filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99).length
  }));
  results.push({ viewport: "390x844-reduced", reduced, consoleErrors, requestFailures });
  fail(reduced.pending || reduced.display !== "none" || reduced.hiddenReveals > 0, "Reduced motion no omite la intro o deja contenido oculto");
  fail(consoleErrors.length > 0 || requestFailures.length > 0, "Errores con reduced motion");
  await context.close();
}

const videoTemp = path.join(outputDir, "video-temp");
try {
  await fs.mkdir(videoTemp, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: videoTemp, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1900);
  const video = page.video();
  await context.close();
  const source = await video.path();
  const destination = path.join(outputDir, "intro-v2.webm");
  await fs.rename(source, destination);
  motionEvidence = { status: "created", file: "intro-v2.webm" };
} catch (error) {
  motionEvidence = { status: "unavailable", reason: error.message };
} finally {
  await fs.rm(videoTemp, { recursive: true, force: true });
}

await browser.close();

const report = {
  baseURL,
  viewports: results,
  screenshots: [
    "01-intro-start.png",
    "02-intro-path.png",
    "03-intro-logo.png",
    "04-intro-transition.png",
    "05-hero-after-intro.png",
    "06-intro-mobile-logo.png",
    "07-hero-mobile-after-intro.png"
  ],
  motionEvidence,
  failures
};

await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
