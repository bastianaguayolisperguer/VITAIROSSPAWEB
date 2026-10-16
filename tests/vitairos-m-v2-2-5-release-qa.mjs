import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2-2-5-release-review");
const viewports = [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[360,800]];
const failures = [];
const results = [];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });

function fail(condition, message) {
  if (condition) failures.push(message);
}

async function createPage(width, height, { reducedMotion = "no-preference", skipIntro = true, observeCLS = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || "failed"}`));
  await page.addInitScript(({ skip, cls }) => {
    if (skip) sessionStorage.setItem("vitairosMIntroSeen", "1");
    if (cls) {
      window.__qaCLS = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaCLS += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    }
  }, { skip: skipIntro, cls: observeCLS });
  const response = await page.goto(`${baseURL}?qa=225`, { waitUntil: "networkidle" });
  fail(!response || response.status() !== 200, `HTTP ${response?.status() || "sin respuesta"} en ${width}x${height}`);
  return { context, page, consoleErrors, requestFailures };
}

async function stabilize(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important}
    [data-reveal]{opacity:1!important;transform:none!important}
    .between-session__landscape,.between-session article{opacity:1!important;filter:none!important;transform:none!important}
    .between-session__bird{animation-play-state:paused!important;animation-delay:-11s!important;opacity:.62!important}
    .between-session__wing{animation-play-state:paused!important}.between-session__flow{display:none!important}
    .between-session__rail{transform:none!important}
    .between-session__rail::before,.between-session__rail span,.between-session__rail::after{opacity:1!important;transform:translate(-50%,-50%) scale(1)!important}
    .loop-center,.loop-node,.loop-return-cue{opacity:1!important}.loop-path--draw{stroke-dashoffset:0!important}
    @media(min-width:1041px){.loop-center{transform:translate(-50%,-48%) scale(1)!important}.loop-node--person,.loop-node--professional{transform:translateX(-50%)!important}.loop-return-cue{transform:none!important}}
  ` });
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
    document.querySelectorAll(".hero,.hero-orbit,[data-loop]").forEach((item) => item.classList.add("is-in-view"));
  });
  await page.waitForTimeout(80);
}

async function freezeIntro(page, milliseconds) {
  await page.evaluate((time) => {
    document.getAnimations().forEach((animation) => {
      const target = animation.effect?.target;
      if (target?.matches?.(".site-intro") || target?.closest?.(".site-intro")) {
        animation.pause();
        animation.currentTime = time;
      }
    });
    const story = document.querySelector(".site-intro__story");
    if (story?.pauseAnimations) {
      story.pauseAnimations();
      story.setCurrentTime(time / 1000);
    }
  }, milliseconds);
  await page.waitForTimeout(50);
}

async function captureIntro(file, time) {
  const { context, page } = await createPage(1440, 900, { skipIntro: false });
  await freezeIntro(page, time);
  await page.screenshot({ path: path.join(outputDir, file) });
  await context.close();
}

await captureIntro("01-intro-start.png", 150);
await captureIntro("02-intro-growth-from-v.png", 560);
await captureIntro("03-intro-flower-formation.png", 1020);
await captureIntro("04-intro-circuit-closure.png", 1760);

{
  const { context, page } = await createPage(1440, 900, { skipIntro: false });
  await page.waitForTimeout(2480);
  await page.screenshot({ path: path.join(outputDir, "05-final-hero.png") });
  await context.close();
}

for (const [width, height] of viewports) {
  const { context, page, consoleErrors, requestFailures } = await createPage(width, height);
  await stabilize(page);
  const metrics = await page.evaluate(({ width }) => {
    const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
    const ariaRefs = Array.from(document.querySelectorAll("[aria-controls],[aria-labelledby],[aria-describedby]")).flatMap((element) => ["aria-controls","aria-labelledby","aria-describedby"].flatMap((attribute) => (element.getAttribute(attribute) || "").split(/\s+/).filter(Boolean)));
    const controls = Array.from(document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]),select,textarea"));
    const targets = Array.from(document.querySelectorAll(".brand,.desktop-nav a,.menu-toggle,.button,[role=tab],.ecosystem-heading>a,.ecosystem-grid>a,.mobile-menu a,.privacy-consent button,.contact-card input:not([type=hidden]):not([type=checkbox]):not(.form-honey),.contact-card select,.contact-card textarea")).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).map((element) => element.className || element.id || element.tagName);
    return {
      viewport: `${innerWidth}x${innerHeight}`,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      duplicateIds: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      missingAriaRefs: ariaRefs.filter((id) => !document.getElementById(id)),
      missingLabels: controls.filter((control) => !control.labels?.length && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")).map((control) => control.id || control.name),
      undersizedTargets: targets,
      sectionOrder: Array.from(document.querySelectorAll("main > section")).map((section) => section.id),
      introSteps: document.querySelectorAll(".site-intro__step").length,
      introAsset: document.querySelector(".site-intro__official-mark")?.getAttribute("href"),
      orbitClosed: /Z\s*$/i.test(document.querySelector(".site-intro__orbit")?.getAttribute("d") || ""),
      birdPaths: document.querySelectorAll(".between-session__bird path").length,
      birdAnimation: getComputedStyle(document.querySelector(".between-session__bird")).animationName,
      mountainLayers: document.querySelectorAll(".between-session__mountains path").length,
      formAction: document.querySelector("#contactForm")?.getAttribute("action"),
      consentRequired: document.querySelector("#privacyConsent")?.required,
      submitText: document.querySelector(".form-submit")?.textContent.replace(/\s+/g," ").trim(),
      audienceCount: document.querySelectorAll(".contact-audiences li").length,
      contactColumns: getComputedStyle(document.querySelector(".contact-layout")).gridTemplateColumns,
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1Count: document.querySelectorAll("h1").length,
      width
    };
  }, { width });
  fail(metrics.scrollWidth > metrics.clientWidth + 1, `Overflow ${metrics.viewport}: ${metrics.scrollWidth}>${metrics.clientWidth}`);
  fail(metrics.brokenImages.length, `Imágenes rotas ${metrics.viewport}: ${metrics.brokenImages.join(",")}`);
  fail(metrics.duplicateIds.length || metrics.missingAriaRefs.length || metrics.missingLabels.length, `Regresión semántica ${metrics.viewport}`);
  fail(metrics.undersizedTargets.length, `Targets menores a 44px ${metrics.viewport}: ${metrics.undersizedTargets.join(",")}`);
  fail(metrics.sectionOrder.slice(-2).join(",") !== "conversemos,ecosistema", `Orden final alterado ${metrics.viewport}`);
  fail(metrics.introSteps !== 5 || !metrics.orbitClosed || metrics.introAsset !== "assets/vitairos-m-isotype-transparent.png", `Narrativa de intro incompleta ${metrics.viewport}`);
  fail(metrics.birdPaths < 4 || metrics.birdAnimation !== "birdCross" || metrics.mountainLayers < 4, `Escena ambiental incompleta ${metrics.viewport}`);
  fail(metrics.formAction !== "https://formsubmit.co/contacto@vitairos.com" || !metrics.consentRequired || !metrics.submitText.includes("Quiero conversar") || metrics.audienceCount !== 3, `Cierre/formulario alterado ${metrics.viewport}`);
  fail(width > 1040 ? metrics.contactColumns.split(" ").length < 2 : metrics.contactColumns.split(" ").length !== 1, `Formulario responsive incorrecto ${metrics.viewport}`);
  fail(metrics.title !== "VITAIROS-M | Continuidad en salud mental digital" || metrics.canonical !== "https://www.vitairos.com/vitairos-m/" || metrics.h1Count !== 1, `SEO/estructura alterados ${metrics.viewport}`);
  fail(consoleErrors.length, `Consola ${metrics.viewport}: ${consoleErrors.join(" | ")}`);
  fail(requestFailures.length, `Requests fallidas ${metrics.viewport}: ${requestFailures.join(" | ")}`);
  results.push({ ...metrics, consoleErrors, requestFailures });
  await context.close();
}

let introChecks;
{
  const { context, page, consoleErrors, requestFailures } = await createPage(1440, 900, { skipIntro: false, observeCLS: true });
  await page.waitForTimeout(100);
  const start = await page.evaluate(() => ({ pending: document.documentElement.classList.contains("intro-pending"), display: getComputedStyle(document.querySelector("[data-site-intro]")).display }));
  await page.waitForTimeout(2380);
  const finish = await page.evaluate(() => ({ pending: document.documentElement.classList.contains("intro-pending"), hidden: document.querySelector("[data-site-intro]").hidden, seen: sessionStorage.getItem("vitairosMIntroSeen"), cls: window.__qaCLS }));
  await page.reload({ waitUntil: "networkidle" });
  const repeated = await page.evaluate(() => document.documentElement.classList.contains("intro-pending"));
  introChecks = { start, finish, repeated, consoleErrors, requestFailures };
  fail(!start.pending || start.display !== "grid", "Intro no aparece en primera visita");
  fail(finish.pending || !finish.hidden || finish.seen !== "1" || repeated, `Intro no respeta la sesión: ${JSON.stringify({ finish, repeated })}`);
  fail(finish.cls > 0.01, `CLS de intro ${finish.cls}`);
  fail(consoleErrors.length || requestFailures.length, "Errores durante la intro");
  await context.close();
}

let reducedMotion;
{
  const { context, page, consoleErrors, requestFailures } = await createPage(390, 844, { skipIntro: false, reducedMotion: "reduce" });
  reducedMotion = await page.evaluate(() => ({
    pending: document.documentElement.classList.contains("intro-pending"),
    introDisplay: getComputedStyle(document.querySelector("[data-site-intro]")).display,
    birdDuration: getComputedStyle(document.querySelector(".between-session__bird")).animationDuration,
    flowDisplay: getComputedStyle(document.querySelector(".between-session__flow")).display,
    hiddenReveals: Array.from(document.querySelectorAll("[data-reveal]")).filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99).length
  }));
  fail(reducedMotion.pending || reducedMotion.introDisplay !== "none" || reducedMotion.flowDisplay !== "none" || reducedMotion.hiddenReveals, `Reduced motion inválido: ${JSON.stringify(reducedMotion)}`);
  fail(Number.parseFloat(reducedMotion.birdDuration) > 0.001, `Ave no se detiene con reduced motion: ${reducedMotion.birdDuration}`);
  fail(consoleErrors.length || requestFailures.length, "Errores con reduced motion");
  await context.close();
}

{
  const { context, page } = await createPage(390, 844);
  const menuButton = page.locator(".menu-toggle");
  await menuButton.click();
  fail(await menuButton.getAttribute("aria-expanded") !== "true", "Menú móvil no abre");
  await page.keyboard.press("Escape");
  fail(await menuButton.getAttribute("aria-expanded") !== "false", "Menú móvil no cierra con Escape");
  fail(!await menuButton.evaluate((element) => document.activeElement === element), "Menú móvil no restaura foco");
  await context.close();
}

{
  const { context, page } = await createPage(1440, 900);
  const professional = page.getByRole("tab", { name: /Profesional/ });
  await professional.focus();
  await page.keyboard.press("ArrowLeft");
  fail(await page.getByRole("tab", { name: /Persona/ }).getAttribute("aria-selected") !== "true", "Tabs no responden al teclado");
  const privacyButton = page.getByRole("button", { name: "Política de Privacidad" });
  await privacyButton.click();
  fail(await page.locator("#modal-privacidad").getAttribute("aria-hidden") !== "false", "Modal de privacidad no abre");
  await page.keyboard.press("Escape");
  fail(await page.locator("#modal-privacidad").getAttribute("aria-hidden") !== "true", "Modal de privacidad no cierra con Escape");
  await context.close();
}

async function captureSection(file, selector, width = 1440, height = 900) {
  const { context, page } = await createPage(width, height);
  await stabilize(page);
  await page.addStyleTag({ content: ".site-header,.skip-link,.reading-progress{display:none!important}" });
  await page.locator(selector).screenshot({ path: path.join(outputDir, file) });
  await context.close();
}

async function captureFull(file, width, height) {
  const { context, page } = await createPage(width, height);
  await stabilize(page);
  await page.screenshot({ path: path.join(outputDir, file), fullPage: true });
  await context.close();
}

await captureSection("06-atmospheric-section.png", "#brecha");
await captureSection("07-new-form-desktop.png", "#conversemos");
await captureSection("08-new-form-mobile.png", "#conversemos", 390, 844);
await captureFull("09-full-desktop-1440x900.png", 1440, 900);
await captureFull("10-full-mobile-390x844.png", 390, 844);

await browser.close();
const screenshots = (await fs.readdir(outputDir)).filter((file) => file.endsWith(".png")).sort();
fail(screenshots.length !== 10, `Se esperaban 10 capturas y existen ${screenshots.length}`);
const report = { baseURL, viewports: results, intro: introChecks, reducedMotion, screenshots, failures };
await fs.writeFile(path.join(outputDir, "qa-results.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
