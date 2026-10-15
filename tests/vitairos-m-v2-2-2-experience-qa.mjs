import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2-2-2-experience-review");
const reportPath = path.join(outputDir, "qa-results.json");
const formEndpoint = "https://formsubmit.co/contacto@vitairos.com";
const viewports = [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[360,800]];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const failures = [];
const results = [];
let motionEvidence = { status: "not-attempted" };

function fail(condition, message) { if (condition) failures.push(message); }

async function openPage(width, height, { reducedMotion = "no-preference", skipIntro = true } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion });
  if (skipIntro) await page.addInitScript(() => sessionStorage.setItem("vitairosMIntroSeen", "1"));
  const consoleErrors = [];
  const requestFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || "failed"}`));
  const response = await page.goto(baseURL, { waitUntil: "networkidle" });
  if (!response || response.status() !== 200) failures.push(`HTTP ${response?.status() || "sin respuesta"} en ${width}x${height}`);
  return { page, consoleErrors, requestFailures };
}

async function stabilize(page, { completeLoop = true } = {}) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}
    [data-reveal]{opacity:1!important;transform:none!important}
    .between-session article,.criteria-grid article{opacity:1!important;transform:none!important}
    .between-session__rail{transform:none!important}
    .between-session__rail::before,.between-session__rail span,.between-session__rail::after{opacity:1!important;transform:translate(-50%,-50%) scale(1)!important}
    .loop-center{opacity:1!important}
    .loop-node{opacity:1!important}
    ${completeLoop ? ".loop-path--draw{stroke-dashoffset:0!important}" : ""}
    @media(min-width:1041px){.loop-center{transform:translate(-50%,-48%) scale(1)!important}.loop-node--person,.loop-node--professional{transform:translateX(-50%)!important}}
    @media(max-width:1040px){.loop-center,.loop-node,.loop-node--person,.loop-node--professional{transform:none!important}}
  ` });
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
    document.querySelectorAll(".hero,.hero-orbit,[data-loop]").forEach((item) => item.classList.add("is-in-view"));
  });
  await page.waitForTimeout(100);
}

async function validateViewport(width, height) {
  const { page, consoleErrors, requestFailures } = await openPage(width, height);
  await stabilize(page);
  const metrics = await page.evaluate(({ width, height }) => {
    const rect = (selector) => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return { top: bounds.top, right: bounds.right, bottom: bounds.bottom, left: bounds.left, width: bounds.width, height: bounds.height };
    };
    const font = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    const loopNodes = Array.from(document.querySelectorAll(".loop-node")).map((node) => {
      const bounds = node.getBoundingClientRect();
      return { top: bounds.top, bottom: bounds.bottom };
    });
    const levels = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((heading) => Number(heading.tagName.slice(1)));
    const route = getComputedStyle(document.querySelector(".continuity-loop"), "::before");
    return {
      viewport: `${width}x${height}`,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1Count: document.querySelectorAll("h1").length,
      headingSkips: levels.flatMap((level, index) => index && level > levels[index - 1] + 1 ? [`h${levels[index - 1]}→h${level}`] : []),
      duplicateIds: (() => { const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id); return Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index))); })(),
      missingLabels: Array.from(document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]),select,textarea")).filter((control) => !control.labels?.length && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")).map((control) => control.id || control.name),
      missingAriaReferences: Array.from(document.querySelectorAll("[aria-controls],[aria-labelledby],[aria-describedby]")).flatMap((element) => ["aria-controls","aria-labelledby","aria-describedby"].flatMap((attribute) => (element.getAttribute(attribute) || "").split(/\s+/).filter(Boolean))).filter((id) => !document.getElementById(id)),
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      logos: Array.from(document.querySelectorAll("img[src*='vitairos-m-logo']")).map((image) => ({ src: image.getAttribute("src"), width: image.naturalWidth, height: image.naturalHeight })),
      undersizedTargets: Array.from(document.querySelectorAll(".brand,.desktop-nav a,.menu-toggle,.button,[role=tab],.ecosystem-heading>a,.ecosystem-grid>a,.contact-card input:not([type=hidden]):not([type=checkbox]),.contact-card select,.contact-card textarea,.mobile-menu a")).filter((element) => element.getAttribute("aria-hidden") !== "true").filter((element) => { const bounds = element.getBoundingClientRect(); return bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44); }).map((element) => element.className || element.id || element.tagName),
      outsideViewport: Array.from(document.querySelectorAll("main>section .container,.footer-main,.footer-bottom")).filter((element) => { const bounds = element.getBoundingClientRect(); return bounds.left < -1 || bounds.right > document.documentElement.clientWidth + 1; }).map((element) => element.className || element.tagName),
      mobileLoopGaps: loopNodes.slice(1).map((node, index) => node.top - loopNodes[index].bottom),
      mobileRoute: { content: route.content, width: Number.parseFloat(route.width), height: Number.parseFloat(route.height), background: route.backgroundImage },
      quoteMarks: document.querySelectorAll(".breach-quote .quote-mark").length,
      quoteHeight: rect(".breach-quote").height,
      navbarBackground: getComputedStyle(document.querySelector(".site-header")).backgroundColor,
      legalFonts: { consent: font(".privacy-consent div"), formNote: font(".form-note"), footerLabel: font(".footer-label"), footerHelp: font(".footer-help p:not(.footer-label)") },
      sectionHeights: { breach: rect("#brecha").height, continuity: rect("#continuidad").height, experience: rect("#experiencia").height, safety: rect("#seguridad").height, state: rect("#estado").height, ecosystem: rect("#ecosistema").height },
      form: { action: document.querySelector("#contactForm")?.getAttribute("action"), required: document.querySelector("#privacyConsent")?.required, checked: document.querySelector("#privacyConsent")?.checked, privacyVersion: document.querySelector('input[name="privacy_version"]')?.value },
      seo: {
        title: document.title,
        description: Boolean(document.querySelector('meta[name="description"]')?.content),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        openGraph: ["og:title","og:description","og:url","og:image","og:image:width","og:image:height","og:image:alt"].every((property) => document.querySelector(`meta[property="${property}"]`)?.content),
        twitter: ["twitter:card","twitter:title","twitter:description","twitter:image"].every((name) => document.querySelector(`meta[name="${name}"]`)?.content),
        jsonLd: (() => { try { const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')); return scripts.length > 0 && scripts.every((script) => Boolean(JSON.parse(script.textContent))); } catch { return false; } })()
      }
    };
  }, { width, height });

  fail(metrics.scrollWidth > metrics.clientWidth, `Overflow ${metrics.viewport}: ${metrics.scrollWidth}>${metrics.clientWidth}`);
  fail(metrics.h1Count !== 1 || metrics.headingSkips.length, `Jerarquía de headings inválida ${metrics.viewport}`);
  fail(metrics.duplicateIds.length || metrics.missingLabels.length || metrics.missingAriaReferences.length, `Regresión ARIA/labels/IDs ${metrics.viewport}`);
  fail(metrics.brokenImages.length, `Imágenes rotas ${metrics.viewport}`);
  fail(metrics.logos.length !== 5 || metrics.logos.some((logo) => logo.src !== "assets/vitairos-m-logo.png" || logo.width !== 574 || logo.height !== 166), `Asset de logo alterado ${metrics.viewport}: ${JSON.stringify(metrics.logos)}`);
  fail(metrics.undersizedTargets.length, `Targets <44 px ${metrics.viewport}: ${metrics.undersizedTargets.join(",")}`);
  fail(metrics.outsideViewport.length, `Clipping ${metrics.viewport}: ${metrics.outsideViewport.join(",")}`);
  fail(Object.values(metrics.legalFonts).some((value) => value < 13), `Texto legal <13 px ${metrics.viewport}`);
  fail(metrics.quoteMarks !== 2, `La cita no tiene dos comillas ${metrics.viewport}`);
  fail(metrics.navbarBackground !== "rgb(255, 255, 255)", `Navbar no usa blanco del asset ${metrics.viewport}: ${metrics.navbarBackground}`);
  if (width <= 430) {
    fail(metrics.mobileRoute.content === "none" || metrics.mobileRoute.width < 3 || metrics.mobileRoute.height < 500, `Spine móvil inválido ${metrics.viewport}`);
    fail(metrics.mobileLoopGaps.some((gap) => gap < 10), `Colisión loop móvil ${metrics.viewport}: ${metrics.mobileLoopGaps.join(",")}`);
  }
  fail(metrics.form.action !== formEndpoint || !metrics.form.required || metrics.form.checked || metrics.form.privacyVersion !== "2026-10", `Formulario alterado ${metrics.viewport}`);
  fail(metrics.seo.title !== "VITAIROS-M | Continuidad en salud mental digital" || !metrics.seo.description || metrics.seo.canonical !== "https://www.vitairos.com/vitairos-m/" || !metrics.seo.openGraph || !metrics.seo.twitter || !metrics.seo.jsonLd, `SEO alterado ${metrics.viewport}`);
  fail(consoleErrors.length, `Consola ${metrics.viewport}: ${consoleErrors.join(" | ")}`);
  fail(requestFailures.length, `Requests fallidas ${metrics.viewport}: ${requestFailures.join(" | ")}`);
  results.push({ ...metrics, consoleErrors: consoleErrors.length, requestFailures: requestFailures.length });
  await page.close();
}

for (const [width, height] of viewports) await validateViewport(width, height);

let introResult;
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  const pendingAtNodes = await page.evaluate(() => document.documentElement.classList.contains("intro-pending"));
  await page.screenshot({ path: path.join(outputDir, "01-intro-nodes.png") });
  await page.waitForTimeout(380);
  const logoOpacity = await page.locator(".site-intro__logo").evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity));
  await page.screenshot({ path: path.join(outputDir, "02-intro-logo.png") });
  await page.waitForTimeout(720);
  const afterIntro = await page.evaluate(() => ({ pending: document.documentElement.classList.contains("intro-pending"), hidden: document.querySelector("[data-site-intro]").hidden, seen: sessionStorage.getItem("vitairosMIntroSeen") }));
  await page.reload({ waitUntil: "domcontentloaded" });
  const repeated = await page.evaluate(() => document.documentElement.classList.contains("intro-pending"));
  introResult = { pendingAtNodes, logoOpacity, afterIntro, repeated };
  fail(!pendingAtNodes || logoOpacity <= 0 || afterIntro.pending || !afterIntro.hidden || afterIntro.seen !== "1" || repeated, `Intro de sesión inválida: ${JSON.stringify(introResult)}`);
  await context.close();
}

let reducedMotionResult;
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "networkidle" });
  reducedMotionResult = await page.evaluate(() => ({
    pending: document.documentElement.classList.contains("intro-pending"),
    introDisplay: getComputedStyle(document.querySelector("[data-site-intro]")).display,
    hiddenRevealCount: Array.from(document.querySelectorAll("[data-reveal]")).filter((item) => getComputedStyle(item).opacity === "0").length,
    loopDash: getComputedStyle(document.querySelector(".loop-path--draw")).strokeDashoffset,
    loopPulse: getComputedStyle(document.querySelector(".loop-pulse")).display,
    orbitPulse: getComputedStyle(document.querySelector(".orbit-travel-pulse")).display
  }));
  fail(reducedMotionResult.pending || reducedMotionResult.introDisplay !== "none" || reducedMotionResult.hiddenRevealCount || !reducedMotionResult.loopDash.startsWith("0") || reducedMotionResult.loopPulse !== "none" || reducedMotionResult.orbitPulse !== "none", `Reduced motion inválido: ${JSON.stringify(reducedMotionResult)}`);
  await context.close();
}

async function captureViewport(file, width, height, fullPage = false) {
  const { page } = await openPage(width, height);
  await stabilize(page);
  await page.screenshot({ path: path.join(outputDir, file), fullPage });
  await page.close();
}

async function captureSection(file, selector, width = 1440, height = 900) {
  const { page } = await openPage(width, height);
  await stabilize(page);
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.addStyleTag({ content: ".site-header,.skip-link,.reading-progress{display:none!important}" });
  await section.screenshot({ path: path.join(outputDir, file) });
  await page.close();
}

await captureViewport("03-hero-desktop.png", 1440, 900);
await captureViewport("04-hero-mobile.png", 390, 844);
await captureSection("05-brecha.png", "#brecha");
await captureSection("06-cita.png", ".breach-quote");

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    sessionStorage.setItem("vitairosMIntroSeen", "1");
    window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}.loop-center{opacity:1!important;transform:translate(-50%,-48%) scale(1)!important}.site-header,.skip-link,.reading-progress{display:none!important}" });
  await page.locator("#continuidad").screenshot({ path: path.join(outputDir, "07-continuity-before.png") });
  await page.close();
}

await captureSection("08-continuity-complete.png", "#continuidad");
await captureSection("09-persona.png", "#experiencia");

{
  const { page } = await openPage(1440, 900);
  await stabilize(page);
  await page.getByRole("tab", { name: /Profesional/ }).click();
  await page.waitForTimeout(420);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: ".site-header,.skip-link,.reading-progress{display:none!important}" });
  await page.locator("#experiencia").screenshot({ path: path.join(outputDir, "10-profesional.png") });
  await page.close();
}

await captureSection("11-seguridad.png", "#seguridad");
await captureSection("12-estado.png", "#estado");
await captureSection("13-ecosistema.png", "#ecosistema");
await captureSection("14-contacto.png", "#conversemos");
await captureViewport("15-full-desktop.png", 1440, 900, true);
await captureViewport("16-full-mobile.png", 390, 844, true);

{
  const { page } = await openPage(390, 844);
  await page.locator(".menu-toggle").click();
  await page.waitForTimeout(100);
  fail(await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "true", "Menú móvil no abrió");
  await page.keyboard.press("Escape");
  fail(await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "false", "Menú móvil no cerró con Escape");
  fail(!await page.locator(".menu-toggle").evaluate((element) => document.activeElement === element), "Menú móvil no restauró foco");
  await page.close();
}

{
  const { page } = await openPage(1440, 900);
  const professional = page.getByRole("tab", { name: /Profesional/ });
  await professional.click();
  const duringTransition = await page.evaluate(() => ({ personaHidden: document.querySelector("#panel-persona").hidden, personaLeaving: document.querySelector("#panel-persona").classList.contains("is-leaving"), professionalVisible: !document.querySelector("#panel-profesional").hidden }));
  fail(duringTransition.personaHidden || !duringTransition.personaLeaving || !duringTransition.professionalVisible, `Transición de tabs ausente: ${JSON.stringify(duringTransition)}`);
  await page.waitForTimeout(420);
  fail(!await page.locator("#panel-persona").evaluate((element) => element.hidden), "Panel Persona no se ocultó al terminar transición");
  await professional.focus();
  await page.keyboard.press("ArrowLeft");
  fail(await page.getByRole("tab", { name: /Persona/ }).getAttribute("aria-selected") !== "true", "Tabs no responden a teclado");
  const privacyTrigger = page.getByRole("button", { name: "Política de Privacidad" });
  await privacyTrigger.scrollIntoViewIfNeeded();
  await privacyTrigger.click();
  await page.keyboard.press("Escape");
  fail(!await privacyTrigger.evaluate((element) => document.activeElement === element), "Modal de privacidad no restauró foco");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => sessionStorage.setItem("vitairosMIntroSeen", "1"));
  let intercepted = null;
  await page.route("https://formsubmit.co/**", async (route) => {
    const request = route.request();
    intercepted = { url: request.url(), method: request.method(), postData: request.postData() || "" };
    await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>QA local</title>" });
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.locator("#nombre").fill("Persona QA");
  await page.locator("#correo").fill("qa@example.test");
  await page.locator("#perfil").selectOption("colaboracion");
  await page.locator("#privacyConsent").check();
  const observed = page.waitForRequest((request) => request.url().startsWith("https://formsubmit.co/") && request.method() === "POST");
  await page.locator(".form-submit").click();
  await observed;
  fail(!intercepted || intercepted.url !== formEndpoint || intercepted.method !== "POST", "FormSubmit no se interceptó localmente");
  await page.close();
}

try {
  const videoDir = path.join(outputDir, "video-temp");
  await fs.mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } } });
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  await page.locator("#brecha").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2200);
  await page.locator("#continuidad").scrollIntoViewIfNeeded();
  await page.waitForTimeout(4800);
  await page.locator("#experiencia").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await page.getByRole("tab", { name: /Profesional/ }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("tab", { name: /Persona/ }).click();
  await page.waitForTimeout(1300);
  const video = page.video();
  await page.close();
  const recordedPath = video ? await video.path() : null;
  await context.close();
  if (recordedPath) {
    const finalVideo = path.join(outputDir, "17-motion-evidence.webm");
    await fs.rename(recordedPath, finalVideo);
    motionEvidence = { status: "created", file: path.basename(finalVideo) };
  } else motionEvidence = { status: "unavailable", reason: "Playwright no devolvió un archivo de video" };
  await fs.rm(videoDir, { recursive: true, force: true });
} catch (error) {
  motionEvidence = { status: "unavailable", reason: error.message };
}

await browser.close();
const screenshots = (await fs.readdir(outputDir)).filter((file) => file.endsWith(".png")).sort();
fail(screenshots.length !== 16, `Se esperaban 16 capturas y existen ${screenshots.length}`);
const report = { baseURL, intro: introResult, reducedMotion: reducedMotionResult, viewports: results, screenshots, motionEvidence, failures };
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
