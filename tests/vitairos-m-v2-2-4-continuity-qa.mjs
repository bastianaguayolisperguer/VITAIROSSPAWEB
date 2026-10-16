import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2-2-4-continuity-review");
const reportPath = path.join(outputDir, "qa-results.json");
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
  if (skipIntro) await page.addInitScript(() => sessionStorage.setItem("vitairosMIntroSeen", "1"));
  if (observeCLS) {
    await page.addInitScript(() => {
      window.__qaCLS = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaCLS += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
  }
  const response = await page.goto(baseURL, { waitUntil: "networkidle" });
  fail(!response || response.status() !== 200, `HTTP ${response?.status() || "sin respuesta"} en ${width}x${height}`);
  return { context, page, consoleErrors, requestFailures };
}

async function stabilize(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important}
    [data-reveal]{opacity:1!important;transform:none!important}
    .between-session article,.criteria-grid article{opacity:1!important;transform:none!important}
    .between-session__bird{animation:none!important;opacity:.65!important;transform:translate3d(42vw,-4px,0) scale(.92)!important}
    .between-session__rail{transform:none!important}
    .between-session__rail::before,.between-session__rail span,.between-session__rail::after{opacity:1!important;transform:translate(-50%,-50%) scale(1)!important}
    .loop-center,.loop-node,.loop-return-cue{opacity:1!important}
    .loop-path--draw{stroke-dashoffset:0!important}
    @media(min-width:1041px){.loop-center{transform:translate(-50%,-48%) scale(1)!important}.loop-node--person,.loop-node--professional{transform:translateX(-50%)!important}.loop-return-cue{transform:none!important}}
  ` });
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
    document.querySelectorAll(".hero,.hero-orbit,[data-loop]").forEach((item) => item.classList.add("is-in-view"));
  });
  await page.waitForTimeout(80);
}

async function freezeIntroAt(page, milliseconds) {
  await page.evaluate((time) => {
    document.getAnimations().forEach((animation) => {
      const target = animation.effect?.target;
      if (target?.matches?.(".site-intro") || target?.closest?.(".site-intro")) {
        animation.pause();
        animation.currentTime = time;
      }
    });
  }, milliseconds);
  await page.waitForTimeout(40);
}

async function captureIntro(file, time, width = 1440, height = 900) {
  const { context, page } = await createPage(width, height, { skipIntro: false });
  await freezeIntroAt(page, time);
  await page.screenshot({ path: path.join(outputDir, file) });
  await context.close();
}

await captureIntro("01-intro-start-v.png", 120);
await captureIntro("02-intro-flower-growth.png", 650);
await captureIntro("03-intro-circle-closure.png", 1360);
await captureIntro("04-intro-hero-transition.png", 1640);

{
  const { context, page } = await createPage(1440, 900, { skipIntro: false });
  await page.waitForTimeout(2050);
  await page.screenshot({ path: path.join(outputDir, "05-hero-final.png") });
  await context.close();
}

for (const [width, height] of viewports) {
  const { context, page, consoleErrors, requestFailures } = await createPage(width, height);
  await stabilize(page);
  const metrics = await page.evaluate(({ width, height }) => {
    const sections = Array.from(document.querySelectorAll("main > section"));
    const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
    const ariaRefs = Array.from(document.querySelectorAll("[aria-controls],[aria-labelledby],[aria-describedby]")).flatMap((element) => ["aria-controls","aria-labelledby","aria-describedby"].flatMap((attribute) => (element.getAttribute(attribute) || "").split(/\s+/).filter(Boolean)));
    const controls = Array.from(document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]),select,textarea"));
    const targetSelectors = ".brand,.desktop-nav a,.menu-toggle,.button,[role=tab],.ecosystem-heading>a,.ecosystem-grid>a,.mobile-menu a,.contact-card input:not([type=hidden]):not([type=checkbox]):not(.form-honey),.contact-card select,.contact-card textarea";
    const targetSizes = Array.from(document.querySelectorAll(targetSelectors)).filter((element) => element.getAttribute("aria-hidden") !== "true" && !element.classList.contains("form-honey")).filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44);
    }).map((element) => element.className || element.id || element.tagName);
    const containersOutside = Array.from(document.querySelectorAll("main>section .container,.footer-main,.footer-bottom")).filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left < -1 || bounds.right > document.documentElement.clientWidth + 1;
    }).map((element) => element.className || element.tagName);
    const loopNodes = Array.from(document.querySelectorAll(".loop-node")).map((element) => {
      const r = element.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });
    const collisions = [];
    if (width > 1040) {
      for (let i = 0; i < loopNodes.length; i += 1) for (let j = i + 1; j < loopNodes.length; j += 1) {
        const a = loopNodes[i]; const b = loopNodes[j];
        const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (overlapX > 4 && overlapY > 4) collisions.push(`${i + 1}-${j + 1}`);
      }
    }
    const mountainFills = Array.from(document.querySelectorAll(".between-session__mountains path")).map((element) => getComputedStyle(element).fill);
    return {
      viewport: `${width}x${height}`,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      logos: Array.from(document.querySelectorAll("img[src='assets/vitairos-m-logo.png']")).map((image) => [image.naturalWidth, image.naturalHeight]),
      duplicateIds: Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index))),
      missingAriaRefs: ariaRefs.filter((id) => !document.getElementById(id)),
      missingLabels: controls.filter((control) => !control.labels?.length && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")).map((control) => control.id || control.name),
      undersizedTargets: targetSizes,
      outsideViewport: containersOutside,
      loopCollisions: collisions,
      sectionOrder: sections.map((section) => section.id),
      loopClosed: /Z\s*$/i.test(document.querySelector("#loopMotionPath")?.getAttribute("d") || ""),
      loopArrows: document.querySelectorAll(".loop-arrow").length,
      loopLabels: Array.from(document.querySelectorAll(".loop-node h3")).map((heading) => heading.textContent.trim()),
      mobileReturnVisible: getComputedStyle(document.querySelector(".loop-return-mobile")).display !== "none",
      mountainFills,
      birdAnimation: getComputedStyle(document.querySelector(".between-session__bird")).animationName,
      ecosystemHeight: document.querySelector("#ecosistema").getBoundingClientRect().height,
      formAction: document.querySelector("#contactForm")?.getAttribute("action"),
      consentRequired: document.querySelector("#privacyConsent")?.required,
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1Count: document.querySelectorAll("h1").length
    };
  }, { width, height });

  fail(metrics.scrollWidth > metrics.clientWidth + 1, `Overflow ${metrics.viewport}: ${metrics.scrollWidth}>${metrics.clientWidth}`);
  fail(metrics.brokenImages.length, `Imágenes rotas ${metrics.viewport}: ${metrics.brokenImages.join(",")}`);
  fail(metrics.logos.length !== 4 || metrics.logos.some(([w,h]) => w !== 574 || h !== 166), `Logos oficiales alterados ${metrics.viewport}: ${JSON.stringify(metrics.logos)}`);
  fail(metrics.duplicateIds.length || metrics.missingAriaRefs.length || metrics.missingLabels.length, `Regresión semántica ${metrics.viewport}`);
  fail(metrics.undersizedTargets.length, `Targets menores a 44px ${metrics.viewport}: ${metrics.undersizedTargets.join(",")}`);
  fail(metrics.outsideViewport.length, `Clipping ${metrics.viewport}: ${metrics.outsideViewport.join(",")}`);
  fail(metrics.loopCollisions.length, `Colisiones del loop ${metrics.viewport}: ${metrics.loopCollisions.join(",")}`);
  fail(metrics.sectionOrder.slice(-2).join(",") !== "conversemos,ecosistema", `Ecosistema no cierra el landing ${metrics.viewport}`);
  fail(!metrics.loopClosed || metrics.loopArrows < 4, `Loop visual incompleto ${metrics.viewport}`);
  fail(metrics.loopLabels[4] !== "Ajuste del acompañamiento" || metrics.loopLabels[5] !== "Retorno a la persona", `Narrativa del retorno incompleta ${metrics.viewport}`);
  fail(width <= 1040 ? !metrics.mobileReturnVisible : metrics.mobileReturnVisible, `Conector de retorno responsive incorrecto ${metrics.viewport}`);
  fail(metrics.mountainFills.some((fill) => fill === "rgb(0, 0, 0)"), `Cordillera sin integración tonal ${metrics.viewport}`);
  fail(metrics.birdAnimation !== "birdCross", `Ave sin animación ambiental ${metrics.viewport}`);
  fail(metrics.ecosystemHeight > (width <= 760 ? 650 : 430), `Ecosistema demasiado protagonista ${metrics.viewport}: ${metrics.ecosystemHeight}px`);
  fail(metrics.formAction !== "https://formsubmit.co/contacto@vitairos.com" || !metrics.consentRequired, `Formulario o consentimiento alterado ${metrics.viewport}`);
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
  const start = await page.evaluate(() => ({
    pending: document.documentElement.classList.contains("intro-pending"),
    display: getComputedStyle(document.querySelector("[data-site-intro]")).display,
    fullLogoInIntro: Boolean(document.querySelector(".site-intro img")),
    officialHref: document.querySelector(".site-intro__official-mark")?.getAttribute("href"),
    cropWidth: document.querySelector("#introOfficialMarkCrop rect")?.getAttribute("width"),
    flowerViewBox: document.querySelector(".site-intro__flower")?.getAttribute("viewBox")
  }));
  await page.waitForTimeout(1950);
  const finish = await page.evaluate(() => ({
    pending: document.documentElement.classList.contains("intro-pending"),
    hidden: document.querySelector("[data-site-intro]").hidden,
    seen: sessionStorage.getItem("vitairosMIntroSeen"),
    cls: window.__qaCLS
  }));
  await page.reload({ waitUntil: "networkidle" });
  const repeated = await page.evaluate(() => document.documentElement.classList.contains("intro-pending"));
  introChecks = { start, finish, repeated, consoleErrors, requestFailures };
  fail(!start.pending || start.display !== "grid", "Intro no aparece en primera visita");
  fail(start.fullLogoInIntro || start.officialHref !== "assets/vitairos-m-logo.png" || start.cropWidth !== "166" || start.flowerViewBox !== "0 0 166 166", `Intro no usa el recorte fiel del isotipo: ${JSON.stringify(start)}`);
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
    loopPulseDisplay: getComputedStyle(document.querySelector(".loop-pulse")).display,
    hiddenReveals: Array.from(document.querySelectorAll("[data-reveal]")).filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99).length
  }));
  fail(reducedMotion.pending || reducedMotion.introDisplay !== "none" || reducedMotion.loopPulseDisplay !== "none" || reducedMotion.hiddenReveals, `Reduced motion inválido: ${JSON.stringify(reducedMotion)}`);
  fail(Number.parseFloat(reducedMotion.birdDuration) > 0.001, `Ave no se detiene con reduced motion: ${reducedMotion.birdDuration}`);
  fail(consoleErrors.length || requestFailures.length, "Errores con reduced motion");
  await context.close();
}

{
  const { context, page } = await createPage(390, 844);
  await page.locator(".menu-toggle").click();
  fail(await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "true", "Menú móvil no abre");
  await page.keyboard.press("Escape");
  fail(await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "false", "Menú móvil no cierra con Escape");
  fail(!await page.locator(".menu-toggle").evaluate((element) => document.activeElement === element), "Menú móvil no restaura foco");
  await context.close();
}

{
  const { context, page } = await createPage(1440, 900);
  const professional = page.getByRole("tab", { name: /Profesional/ });
  await professional.focus();
  await page.keyboard.press("ArrowLeft");
  fail(await page.getByRole("tab", { name: /Persona/ }).getAttribute("aria-selected") !== "true", "Tabs no responden al teclado");
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

await captureSection("06-loop-closed.png", "#continuidad");
await captureSection("07-orient-context-continuity.png", "#brecha");
await captureSection("08-ecosystem-closing.png", "#ecosistema");
await captureFull("09-full-desktop-1440x900.png", 1440, 900);
await captureFull("10-full-mobile-390x844.png", 390, 844);

await browser.close();
const screenshots = (await fs.readdir(outputDir)).filter((file) => file.endsWith(".png")).sort();
fail(screenshots.length !== 10, `Se esperaban 10 capturas y existen ${screenshots.length}`);

const report = { baseURL, viewports: results, intro: introChecks, reducedMotion, screenshots, failures };
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
