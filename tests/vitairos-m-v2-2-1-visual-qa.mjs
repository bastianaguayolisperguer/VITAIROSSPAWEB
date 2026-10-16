import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2-2-1-visual-review");
const reportPath = path.join(outputDir, "qa-results.json");
const formEndpoint = "https://formsubmit.co/contacto@vitairos.com";
const viewports = [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 800]];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const failures = [];
const results = [];

async function openPage(width, height, reducedMotion = "no-preference") {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion });
  const consoleErrors = [];
  const requestFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || "failed"}`));
  const response = await page.goto(baseURL, { waitUntil: "networkidle" });
  if (!response || response.status() !== 200) failures.push(`HTTP ${response?.status() || "sin respuesta"} en ${width}x${height}`);
  return { page, consoleErrors, requestFailures };
}

async function stabilize(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}
    [data-reveal]{opacity:1!important;transform:none!important}
    .loop-node{opacity:1!important}
    .loop-path--draw{stroke-dashoffset:0!important}
    @media(min-width:1041px){.loop-node--person,.loop-node--professional{transform:translateX(-50%)!important}}
    @media(max-width:1040px){.loop-node,.loop-node--person,.loop-node--professional{transform:none!important}}
  ` });
  await page.waitForTimeout(120);
}

function addFailure(condition, message) {
  if (condition) failures.push(message);
}

async function validateViewport(width, height) {
  const { page, consoleErrors, requestFailures } = await openPage(width, height);
  await stabilize(page);
  const metrics = await page.evaluate(({ width, height }) => {
    const px = (selector) => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    const rect = (selector) => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return { top: bounds.top, right: bounds.right, bottom: bounds.bottom, left: bounds.left, width: bounds.width, height: bounds.height };
    };
    const loopNodes = Array.from(document.querySelectorAll(".loop-node")).map((node) => {
      const bounds = node.getBoundingClientRect();
      return { className: node.className, top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right };
    });
    const mobileLoopGaps = loopNodes.slice(1).map((node, index) => node.top - loopNodes[index].bottom);
    const containersOutsideViewport = Array.from(document.querySelectorAll("main > section .container, .footer-main, .footer-bottom")).filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left < -1 || bounds.right > document.documentElement.clientWidth + 1;
    }).map((element) => element.className || element.tagName);
    const routeStyle = getComputedStyle(document.querySelector(".continuity-loop"), "::before");
    const logoMetrics = Array.from(document.querySelectorAll("img[src*='vitairos-m-logo']")).map((image) => ({
      src: image.getAttribute("src"), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight
    }));
    const headingLevels = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((heading) => Number(heading.tagName.slice(1)));
    const privacy = document.querySelector("#modal-privacidad");
    const terms = document.querySelector("#modal-terminos");
    return {
      viewport: `${width}x${height}`,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1Count: document.querySelectorAll("h1").length,
      headingSkips: headingLevels.flatMap((level, index) => index && level > headingLevels[index - 1] + 1 ? [`h${headingLevels[index - 1]}→h${level}`] : []),
      duplicateIds: (() => { const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id); return Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index))); })(),
      missingLabels: Array.from(document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]),select,textarea")).filter((control) => !control.labels?.length && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")).map((control) => control.id || control.name),
      missingAriaReferences: Array.from(document.querySelectorAll("[aria-controls],[aria-labelledby],[aria-describedby]")).flatMap((element) => ["aria-controls", "aria-labelledby", "aria-describedby"].flatMap((attribute) => (element.getAttribute(attribute) || "").split(/\s+/).filter(Boolean))).filter((id) => !document.getElementById(id)),
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      logos: logoMetrics,
      undersizedTargets: Array.from(document.querySelectorAll(".brand,.desktop-nav a,.menu-toggle,.button,[role=tab],.ecosystem-heading>a,.ecosystem-grid>a,.contact-card input:not([type=hidden]):not([type=checkbox]),.contact-card select,.contact-card textarea,.mobile-menu a")).filter((element) => element.getAttribute("aria-hidden") !== "true").filter((element) => { const bounds = element.getBoundingClientRect(); return bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44); }).map((element) => element.className || element.id || element.tagName),
      containersOutsideViewport,
      mobileLoopGaps,
      route: { content: routeStyle.content, width: Number.parseFloat(routeStyle.width), height: Number.parseFloat(routeStyle.height), backgroundImage: routeStyle.backgroundImage },
      heroOrbit: rect(".hero-orbit"),
      heroOrbitVisiblePixels: height - rect(".hero-orbit").top,
      legalFontSizes: { consent: px(".privacy-consent div"), formNote: px(".form-note"), footerLabel: px(".footer-label"), footerHelp: px(".footer-help p:not(.footer-label)") },
      ecosystemCard: rect(".ecosystem-grid > a"),
      form: {
        action: document.querySelector("#contactForm")?.getAttribute("action"),
        consentRequired: document.querySelector("#privacyConsent")?.required,
        consentChecked: document.querySelector("#privacyConsent")?.checked,
        privacyVersion: document.querySelector('input[name="privacy_version"]')?.value,
        privacyDialog: Boolean(privacy), termsDialog: Boolean(terms)
      },
      seo: {
        title: document.title,
        description: Boolean(document.querySelector('meta[name="description"]')?.content),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        openGraph: ["og:title", "og:description", "og:url", "og:image", "og:image:width", "og:image:height", "og:image:alt"].every((property) => document.querySelector(`meta[property="${property}"]`)?.content),
        twitter: ["twitter:card", "twitter:title", "twitter:description", "twitter:image"].every((name) => document.querySelector(`meta[name="${name}"]`)?.content),
        jsonLdValid: (() => { try { const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')); return scripts.length > 0 && scripts.every((script) => Boolean(JSON.parse(script.textContent))); } catch { return false; } })()
      }
    };
  }, { width, height });

  addFailure(metrics.scrollWidth > metrics.clientWidth, `Overflow horizontal ${metrics.viewport}: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
  addFailure(metrics.h1Count !== 1, `H1 inválidos ${metrics.viewport}: ${metrics.h1Count}`);
  addFailure(metrics.headingSkips.length, `Saltos de jerarquía ${metrics.viewport}: ${metrics.headingSkips.join(", ")}`);
  addFailure(metrics.duplicateIds.length, `IDs duplicados ${metrics.viewport}: ${metrics.duplicateIds.join(", ")}`);
  addFailure(metrics.missingLabels.length, `Controles sin etiqueta ${metrics.viewport}: ${metrics.missingLabels.join(", ")}`);
  addFailure(metrics.missingAriaReferences.length, `Referencias ARIA inexistentes ${metrics.viewport}: ${metrics.missingAriaReferences.join(", ")}`);
  addFailure(metrics.brokenImages.length, `Imágenes rotas ${metrics.viewport}: ${metrics.brokenImages.join(", ")}`);
  addFailure(metrics.logos.length !== 4 || metrics.logos.some((logo) => logo.src !== "assets/vitairos-m-logo.png" || logo.naturalWidth !== 574 || logo.naturalHeight !== 166), `Logo final inválido ${metrics.viewport}`);
  addFailure(metrics.undersizedTargets.length, `Objetivos menores a 44 px ${metrics.viewport}: ${metrics.undersizedTargets.join(", ")}`);
  addFailure(metrics.containersOutsideViewport.length, `Contenedores recortados ${metrics.viewport}: ${metrics.containersOutsideViewport.join(", ")}`);
  addFailure(Object.values(metrics.legalFontSizes).some((size) => size < 13), `Texto legal menor a 13 px ${metrics.viewport}: ${JSON.stringify(metrics.legalFontSizes)}`);
  if (width <= 430) {
    addFailure(metrics.route.content === "none" || metrics.route.width < 3 || metrics.route.height < 500 || !metrics.route.backgroundImage.includes("linear-gradient"), `Ruta móvil ausente o discontinua ${metrics.viewport}: ${JSON.stringify(metrics.route)}`);
    addFailure(metrics.mobileLoopGaps.some((gap) => gap < 10), `Colisión de nodos del loop ${metrics.viewport}: ${metrics.mobileLoopGaps.join(",")}`);
  }
  if (width === 390) addFailure(metrics.heroOrbitVisiblePixels < 4, `Orbit no asoma en hero 390x844: ${metrics.heroOrbitVisiblePixels}px visibles`);
  addFailure(metrics.form.action !== formEndpoint || !metrics.form.consentRequired || metrics.form.consentChecked || metrics.form.privacyVersion !== "2026-10" || !metrics.form.privacyDialog || !metrics.form.termsDialog, `Formulario o legales alterados ${metrics.viewport}: ${JSON.stringify(metrics.form)}`);
  addFailure(metrics.seo.title !== "VITAIROS-M | Continuidad en salud mental digital" || !metrics.seo.description || metrics.seo.canonical !== "https://www.vitairos.com/vitairos-m/" || !metrics.seo.openGraph || !metrics.seo.twitter || !metrics.seo.jsonLdValid, `SEO técnico inválido ${metrics.viewport}: ${JSON.stringify(metrics.seo)}`);
  addFailure(consoleErrors.length, `Consola ${metrics.viewport}: ${consoleErrors.join(" | ")}`);
  addFailure(requestFailures.length, `Requests fallidas ${metrics.viewport}: ${requestFailures.join(" | ")}`);
  results.push({ ...metrics, consoleErrors: consoleErrors.length, requestFailures: requestFailures.length });
  await page.close();
}

for (const [width, height] of viewports) await validateViewport(width, height);

async function captureViewport(fileName, width, height, fullPage = false) {
  const { page } = await openPage(width, height);
  await stabilize(page);
  await page.screenshot({ path: path.join(outputDir, fileName), fullPage });
  await page.close();
}

async function captureSection(fileName, selector, width, height) {
  const { page } = await openPage(width, height);
  await stabilize(page);
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.addStyleTag({ content: ".site-header,.skip-link,.reading-progress{display:none!important}" });
  await page.waitForTimeout(120);
  await section.screenshot({ path: path.join(outputDir, fileName) });
  await page.close();
}

await captureViewport("01-hero-desktop-1440x900.png", 1440, 900);
await captureViewport("02-hero-mobile-390x844.png", 390, 844);
await captureSection("03-continuity-loop-desktop.png", "#continuidad", 1440, 900);
await captureSection("04-continuity-loop-mobile-430x932.png", "#continuidad", 430, 932);
await captureSection("05-continuity-loop-mobile-390x844.png", "#continuidad", 390, 844);
await captureSection("06-continuity-loop-mobile-360x800.png", "#continuidad", 360, 800);

{
  const { page } = await openPage(390, 844);
  await stabilize(page);
  const consent = page.locator(".privacy-consent");
  await consent.scrollIntoViewIfNeeded();
  await consent.screenshot({ path: path.join(outputDir, "07-consentimiento-mobile.png") });
  await page.close();
}

await captureSection("08-ayuda-inmediata-mobile.png", ".footer-help", 390, 844);
await captureSection("09-ecosistema-desktop.png", "#ecosistema", 1440, 900);
await captureSection("10-ecosistema-mobile.png", "#ecosistema", 390, 844);
await captureViewport("11-full-page-desktop-1440.png", 1440, 900, true);
await captureViewport("12-full-page-mobile-390.png", 390, 844, true);

{
  const { page } = await openPage(390, 844);
  await stabilize(page);
  await page.locator(".menu-toggle").click();
  addFailure(await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "true", "El menú móvil no se abrió");
  await page.waitForTimeout(100);
  await page.keyboard.press("Escape");
  addFailure(await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "false", "Escape no cerró el menú móvil");
  addFailure(!await page.locator(".menu-toggle").evaluate((element) => document.activeElement === element), "El menú móvil no restauró el foco");
  await page.close();
}

{
  const { page } = await openPage(1440, 900);
  await stabilize(page);
  await page.getByRole("tab", { name: /Profesional/ }).click();
  addFailure(await page.getByRole("tab", { name: /Profesional/ }).getAttribute("aria-selected") !== "true", "El tab Profesional no se activó");
  await page.getByRole("tab", { name: /Profesional/ }).focus();
  await page.keyboard.press("ArrowLeft");
  addFailure(await page.getByRole("tab", { name: /Persona/ }).getAttribute("aria-selected") !== "true", "La navegación por teclado de tabs falló");
  const privacyTrigger = page.getByRole("button", { name: "Política de Privacidad" });
  await privacyTrigger.scrollIntoViewIfNeeded();
  await privacyTrigger.click();
  addFailure(await page.locator("#modal-privacidad").getAttribute("aria-hidden") !== "false", "El diálogo de privacidad no se abrió");
  await page.keyboard.press("Escape");
  addFailure(await page.locator("#modal-privacidad").getAttribute("aria-hidden") !== "true", "Escape no cerró privacidad");
  addFailure(!await privacyTrigger.evaluate((element) => document.activeElement === element), "Privacidad no restauró el foco");
  await page.close();
}

{
  const { page } = await openPage(1440, 900, "reduce");
  addFailure(await page.locator("[data-reveal]:not(.is-visible)").count() > 0, "Reduced motion dejó contenido oculto");
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
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
  addFailure(!intercepted || intercepted.url !== formEndpoint || intercepted.method !== "POST", `FormSubmit no fue interceptado correctamente: ${JSON.stringify(intercepted)}`);
  if (intercepted) {
    const payload = Object.fromEntries(new URLSearchParams(intercepted.postData));
    const expected = { _subject: "Conversación sobre VITAIROS-M", _template: "table", _captcha: "false", _next: "https://www.vitairos.com/vitairos-m/?enviado=1#conversemos", proyecto: "VITAIROS-M", origen: "Landing VITAIROS-M V2.1", privacy_version: "2026-10", privacy_consent: "yes", _honey: "" };
    for (const [name, value] of Object.entries(expected)) addFailure(payload[name] !== value, `Payload FormSubmit inválido para ${name}: ${JSON.stringify(payload[name])}`);
  }
  await page.close();
}

await browser.close();
const pngFiles = (await fs.readdir(outputDir)).filter((file) => file.endsWith(".png"));
addFailure(pngFiles.length !== 12, `Se esperaban exactamente 12 capturas y existen ${pngFiles.length}`);
const report = { baseURL, viewports: results, screenshots: pngFiles.sort(), failures };
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
