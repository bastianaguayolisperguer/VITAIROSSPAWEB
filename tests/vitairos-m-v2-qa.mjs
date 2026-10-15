import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2");
const formEndpoint = "https://formsubmit.co/contacto@vitairos.com";
const logoPath = "assets/vitairos-m-logo.png";

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ executablePath: edgePath, headless: true });
const failures = [];
const results = [];

async function openPage(viewport, reducedMotion = "no-preference") {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion });
  const errors = [];
  const failedRequests = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || "failed"}`));
  const response = await page.goto(baseURL, { waitUntil: "networkidle" });
  if (!response || response.status() !== 200) failures.push(`HTTP ${response?.status() || "sin respuesta"} en ${viewport.width}x${viewport.height}`);
  return { page, errors, failedRequests };
}

async function revealAll(page) {
  const items = page.locator("[data-reveal]");
  const count = await items.count();
  for (let index = 0; index < count; index += 1) {
    await items.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(90);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(750);
}

async function settleSection(page, selector) {
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(850);
  return section;
}

async function validateViewport(width, height) {
  const { page, errors, failedRequests } = await openPage({ width, height });
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1Count: document.querySelectorAll("h1").length,
    title: document.title,
    headingSkips: (() => {
      const levels = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((heading) => Number(heading.tagName.slice(1)));
      return levels.flatMap((level, index) => index > 0 && level > levels[index - 1] + 1 ? [`h${levels[index - 1]}→h${level}`] : []);
    })(),
    landmarks: {
      header: document.querySelectorAll("header").length,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      nav: document.querySelectorAll("nav").length
    },
    missingLabels: Array.from(document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]), select, textarea")).filter((control) => {
      return !control.labels?.length && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby");
    }).map((control) => control.id || control.name || control.tagName),
    emptyLinks: Array.from(document.querySelectorAll("a")).filter((link) => !link.getAttribute("href")).length,
    invalidButtons: Array.from(document.querySelectorAll("button")).filter((button) => !button.getAttribute("type")).length,
    hiddenLeaks: Array.from(document.querySelectorAll("[hidden]")).filter((element) => getComputedStyle(element).display !== "none").map((element) => element.id || element.className || element.tagName),
    duplicateIds: (() => {
      const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
      return Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index)));
    })(),
    missingAriaReferences: (() => {
      const references = Array.from(document.querySelectorAll("[aria-controls], [aria-labelledby], [aria-describedby]")).flatMap((element) => {
        return ["aria-controls", "aria-labelledby", "aria-describedby"].flatMap((attribute) => (element.getAttribute(attribute) || "").split(/\s+/).filter(Boolean));
      });
      return Array.from(new Set(references.filter((id) => !document.getElementById(id))));
    })(),
    brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.getAttribute("src")),
    logos: Array.from(document.querySelectorAll("img[src*='vitairos-m-logo']")).map((image) => ({
      src: image.getAttribute("src"),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight
    })),
    undersizedPrimaryTargets: Array.from(document.querySelectorAll(".brand, .desktop-nav a, .menu-toggle, .button, [role='tab'], .ecosystem-heading > a, .ecosystem-grid > a, .contact-card input:not([type='hidden']):not([type='checkbox']), .contact-card select, .contact-card textarea, .mobile-menu a")).filter((element) => element.getAttribute("aria-hidden") !== "true").filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).map((element) => `${element.tagName.toLowerCase()}.${element.className || element.id || "sin-id"}`),
    missingAreas: ["#inicio", "#continuidad", "#experiencia", "#seguridad", "#estado", "#conversemos", ".site-footer"].filter((selector) => !document.querySelector(selector)),
    editorialNumbers: Array.from(document.querySelectorAll(".section-kicker")).map((element) => element.textContent.trim()).filter((text) => /^\d{2}\s*·/.test(text)),
    form: {
      action: document.querySelector("#contactForm")?.getAttribute("action"),
      consentRequired: document.querySelector("#privacyConsent")?.required,
      consentChecked: document.querySelector("#privacyConsent")?.checked,
      privacyVersion: document.querySelector('input[name="privacy_version"]')?.value,
      privacyDialog: Boolean(document.querySelector("#modal-privacidad")),
      termsDialog: Boolean(document.querySelector("#modal-terminos"))
    },
    seo: {
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      openGraph: ["og:title", "og:description", "og:url", "og:image", "og:image:width", "og:image:height", "og:image:alt"].every((property) => document.querySelector(`meta[property="${property}"]`)?.content),
      twitter: ["twitter:card", "twitter:title", "twitter:description", "twitter:image"].every((name) => document.querySelector(`meta[name="${name}"]`)?.content),
      jsonLdValid: (() => {
        try {
          return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).length > 0 && Array.from(document.querySelectorAll('script[type="application/ld+json"]')).every((script) => Boolean(JSON.parse(script.textContent)));
        } catch {
          return false;
        }
      })()
    }
  }));

  if (metrics.scrollWidth > metrics.clientWidth) failures.push(`Overflow horizontal ${width}x${height}: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
  if (metrics.h1Count !== 1) failures.push(`H1 inválidos ${width}x${height}: ${metrics.h1Count}`);
  if (metrics.headingSkips.length) failures.push(`Saltos de jerarquía ${width}x${height}: ${metrics.headingSkips.join(", ")}`);
  if (metrics.missingLabels.length) failures.push(`Controles sin etiqueta ${width}x${height}: ${metrics.missingLabels.join(", ")}`);
  if (metrics.emptyLinks) failures.push(`Enlaces sin href ${width}x${height}: ${metrics.emptyLinks}`);
  if (metrics.invalidButtons) failures.push(`Botones sin type ${width}x${height}: ${metrics.invalidButtons}`);
  if (metrics.hiddenLeaks.length) failures.push(`Elementos hidden visibles ${width}x${height}: ${metrics.hiddenLeaks.join(", ")}`);
  if (metrics.duplicateIds.length) failures.push(`IDs duplicados ${width}x${height}: ${metrics.duplicateIds.join(", ")}`);
  if (metrics.missingAriaReferences.length) failures.push(`Referencias ARIA inexistentes ${width}x${height}: ${metrics.missingAriaReferences.join(", ")}`);
  if (metrics.brokenImages.length) failures.push(`Imágenes rotas ${width}x${height}: ${metrics.brokenImages.join(", ")}`);
  if (metrics.logos.length !== 4 || metrics.logos.some((logo) => logo.src !== logoPath || logo.naturalWidth !== 574 || logo.naturalHeight !== 166)) failures.push(`Logo final inválido ${width}x${height}: ${JSON.stringify(metrics.logos)}`);
  if (metrics.undersizedPrimaryTargets.length) failures.push(`Objetivos principales menores a 44 px ${width}x${height}: ${metrics.undersizedPrimaryTargets.join(", ")}`);
  if (metrics.missingAreas.length) failures.push(`Áreas faltantes ${width}x${height}: ${metrics.missingAreas.join(", ")}`);
  if (metrics.editorialNumbers.length) failures.push(`Numeración editorial visible ${width}x${height}: ${metrics.editorialNumbers.join(", ")}`);
  if (metrics.form.action !== formEndpoint) failures.push(`Endpoint de formulario alterado ${width}x${height}`);
  if (!metrics.form.consentRequired || metrics.form.consentChecked) failures.push(`Consentimiento inválido ${width}x${height}`);
  if (metrics.form.privacyVersion !== "2026-10") failures.push(`Versión de privacidad inválida ${width}x${height}`);
  if (!metrics.form.privacyDialog || !metrics.form.termsDialog) failures.push(`Diálogos legales faltantes ${width}x${height}`);
  if (metrics.title !== "VITAIROS-M | Continuidad en salud mental digital" || !metrics.seo.description || metrics.seo.canonical !== "https://www.vitairos.com/vitairos-m/" || !metrics.seo.openGraph || !metrics.seo.twitter || !metrics.seo.jsonLdValid) failures.push(`SEO técnico inválido ${width}x${height}: ${JSON.stringify(metrics.seo)}`);
  if (errors.length) failures.push(`Consola ${width}x${height}: ${errors.join(" | ")}`);
  if (failedRequests.length) failures.push(`Requests fallidas ${width}x${height}: ${failedRequests.join(" | ")}`);

  results.push({ viewport: `${width}x${height}`, ...metrics, consoleErrors: errors.length, requestFailures: failedRequests.length });
  await page.close();
}

for (const [width, height] of [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[360,800]]) {
  await validateViewport(width, height);
}

{
  const { page } = await openPage({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(outputDir, "01-hero-desktop.png") });
  await revealAll(page);
  await page.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}.loop-node{opacity:1!important}.loop-node--person,.loop-node--professional{transform:translateX(-50%)!important}.loop-path--draw{stroke-dashoffset:0!important}@media(max-width:1040px){.loop-node,.loop-node--person,.loop-node--professional{transform:none!important}}" });
  await page.screenshot({ path: path.join(outputDir, "03-full-desktop.png"), fullPage: true });
  await page.addStyleTag({ content: ".site-header,.skip-link,.reading-progress{display:none!important}" });
  await (await settleSection(page, "#continuidad")).screenshot({ path: path.join(outputDir, "05-continuity-loop.png") });
  await (await settleSection(page, "#experiencia")).screenshot({ path: path.join(outputDir, "06-persona.png") });
  await page.getByRole("tab", { name: /Profesional/ }).click();
  if (await page.getByRole("tab", { name: /Profesional/ }).getAttribute("aria-selected") !== "true") failures.push("El tab Profesional no se activó");
  await page.getByRole("tab", { name: /Profesional/ }).focus();
  await page.keyboard.press("ArrowLeft");
  if (await page.getByRole("tab", { name: /Persona/ }).getAttribute("aria-selected") !== "true") failures.push("La navegación por teclado no activó el tab Persona");
  await page.getByRole("tab", { name: /Profesional/ }).click();
  await page.evaluate(() => window.scrollTo(0, window.scrollY));
  await page.waitForTimeout(500);
  const professionalWidth = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, x: window.scrollX }));
  if (professionalWidth.scroll > professionalWidth.client || professionalWidth.x !== 0) failures.push(`Panel Profesional desplazado: ${JSON.stringify(professionalWidth)}`);
  await page.locator("#experiencia").screenshot({ path: path.join(outputDir, "07-profesional.png") });
  await (await settleSection(page, "#seguridad")).screenshot({ path: path.join(outputDir, "08-seguridad.png") });
  await (await settleSection(page, "#estado")).screenshot({ path: path.join(outputDir, "09-estado.png") });
  await (await settleSection(page, "#ecosistema")).screenshot({ path: path.join(outputDir, "10-ecosistema.png") });
  await (await settleSection(page, "#conversemos")).screenshot({ path: path.join(outputDir, "11-contacto.png") });

  const privacyTrigger = page.getByRole("button", { name: "Política de Privacidad" });
  await privacyTrigger.click();
  const privacy = page.locator("#modal-privacidad");
  if (await privacy.getAttribute("aria-hidden") !== "false") failures.push("El diálogo de privacidad no se abrió");
  await page.keyboard.press("Escape");
  if (await privacy.getAttribute("aria-hidden") !== "true") failures.push("Escape no cerró el diálogo de privacidad");
  if (!await privacyTrigger.evaluate((element) => document.activeElement === element)) failures.push("El diálogo de privacidad no restauró el foco");
  await page.close();
}

{
  const { page } = await openPage({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(outputDir, "02-hero-mobile.png") });
  await revealAll(page);
  await page.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}.loop-node{opacity:1!important;transform:none!important}.loop-path--draw{stroke-dashoffset:0!important}" });
  await page.screenshot({ path: path.join(outputDir, "04-full-mobile.png"), fullPage: true });
  await page.locator(".menu-toggle").click();
  if (await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "true") failures.push("El menú móvil no se abrió");
  await page.waitForTimeout(400);
  const mobileEntries = await page.locator("#mobileMenu nav a").allTextContents();
  if (mobileEntries.some((entry) => /^\s*\d/.test(entry))) failures.push("El menú móvil conserva numeración editorial");
  await page.keyboard.press("Escape");
  if (await page.locator(".menu-toggle").getAttribute("aria-expanded") !== "false") failures.push("Escape no cerró el menú móvil");
  if (!await page.locator(".menu-toggle").evaluate((element) => document.activeElement === element)) failures.push("El menú móvil no restauró el foco");
  await page.close();
}

{
  const { page } = await openPage({ width: 1440, height: 900 }, "reduce");
  const hiddenReveals = await page.locator("[data-reveal]:not(.is-visible)").count();
  if (hiddenReveals) failures.push(`Reduced motion dejó ${hiddenReveals} elementos ocultos`);
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  let interceptedRequest = null;
  await page.route("https://formsubmit.co/**", async (route) => {
    const request = route.request();
    interceptedRequest = { url: request.url(), method: request.method(), postData: request.postData() || "" };
    await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Intercepción QA</title><p>Solicitud interceptada localmente.</p>" });
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.locator("#nombre").fill("Persona QA");
  await page.locator("#correo").fill("qa@example.test");
  await page.locator("#perfil").selectOption("colaboracion");
  await page.locator("#mensaje").fill("Validación automatizada interceptada; no enviada.");
  await page.locator("#privacyConsent").check();
  const requestObserved = page.waitForRequest((request) => request.url().startsWith("https://formsubmit.co/") && request.method() === "POST");
  await page.locator(".form-submit").click();
  await requestObserved;
  await page.waitForTimeout(100);

  if (!interceptedRequest) {
    failures.push("No se interceptó el payload de FormSubmit");
  } else {
    const payload = Object.fromEntries(new URLSearchParams(interceptedRequest.postData));
    const expectedPayload = {
      _subject: "Conversación sobre VITAIROS-M",
      _template: "table",
      _captcha: "false",
      _next: "https://www.vitairos.com/vitairos-m/?enviado=1#conversemos",
      proyecto: "VITAIROS-M",
      origen: "Landing VITAIROS-M V2.1",
      privacy_version: "2026-10",
      privacy_consent: "yes",
      _honey: ""
    };
    if (interceptedRequest.url !== formEndpoint || interceptedRequest.method !== "POST") failures.push(`Solicitud FormSubmit inválida: ${JSON.stringify(interceptedRequest)}`);
    for (const [name, value] of Object.entries(expectedPayload)) {
      if (payload[name] !== value) failures.push(`Payload FormSubmit inválido para ${name}: ${JSON.stringify(payload[name])}`);
    }
    results.push({ formPayload: { endpoint: interceptedRequest.url, method: interceptedRequest.method, intercepted: true, fields: payload } });
  }
  await page.close();
}

await browser.close();

console.log(JSON.stringify({ baseURL, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
