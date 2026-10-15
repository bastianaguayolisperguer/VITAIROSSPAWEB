import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2");

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
    missingAreas: ["#inicio", "#continuidad", "#experiencia", "#seguridad", "#estado", "#conversemos", ".site-footer"].filter((selector) => !document.querySelector(selector)),
    editorialNumbers: Array.from(document.querySelectorAll(".section-kicker")).map((element) => element.textContent.trim()).filter((text) => /^\d{2}\s*·/.test(text)),
    form: {
      action: document.querySelector("#contactForm")?.getAttribute("action"),
      consentRequired: document.querySelector("#privacyConsent")?.required,
      consentChecked: document.querySelector("#privacyConsent")?.checked,
      privacyVersion: document.querySelector('input[name="privacy_version"]')?.value,
      privacyDialog: Boolean(document.querySelector("#modal-privacidad")),
      termsDialog: Boolean(document.querySelector("#modal-terminos"))
    }
  }));

  if (metrics.scrollWidth > metrics.clientWidth) failures.push(`Overflow horizontal ${width}x${height}: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
  if (metrics.h1Count !== 1) failures.push(`H1 inválidos ${width}x${height}: ${metrics.h1Count}`);
  if (metrics.missingLabels.length) failures.push(`Controles sin etiqueta ${width}x${height}: ${metrics.missingLabels.join(", ")}`);
  if (metrics.emptyLinks) failures.push(`Enlaces sin href ${width}x${height}: ${metrics.emptyLinks}`);
  if (metrics.invalidButtons) failures.push(`Botones sin type ${width}x${height}: ${metrics.invalidButtons}`);
  if (metrics.hiddenLeaks.length) failures.push(`Elementos hidden visibles ${width}x${height}: ${metrics.hiddenLeaks.join(", ")}`);
  if (metrics.duplicateIds.length) failures.push(`IDs duplicados ${width}x${height}: ${metrics.duplicateIds.join(", ")}`);
  if (metrics.missingAriaReferences.length) failures.push(`Referencias ARIA inexistentes ${width}x${height}: ${metrics.missingAriaReferences.join(", ")}`);
  if (metrics.brokenImages.length) failures.push(`Imágenes rotas ${width}x${height}: ${metrics.brokenImages.join(", ")}`);
  if (metrics.missingAreas.length) failures.push(`Áreas faltantes ${width}x${height}: ${metrics.missingAreas.join(", ")}`);
  if (metrics.editorialNumbers.length) failures.push(`Numeración editorial visible ${width}x${height}: ${metrics.editorialNumbers.join(", ")}`);
  if (metrics.form.action !== "https://formsubmit.co/bastianaguayolisperguer@gmail.com") failures.push(`Endpoint de formulario alterado ${width}x${height}`);
  if (!metrics.form.consentRequired || metrics.form.consentChecked) failures.push(`Consentimiento inválido ${width}x${height}`);
  if (metrics.form.privacyVersion !== "2026-10") failures.push(`Versión de privacidad inválida ${width}x${height}`);
  if (!metrics.form.privacyDialog || !metrics.form.termsDialog) failures.push(`Diálogos legales faltantes ${width}x${height}`);
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
  await page.evaluate(() => window.scrollTo(0, window.scrollY));
  await page.waitForTimeout(500);
  const professionalWidth = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, x: window.scrollX }));
  if (professionalWidth.scroll > professionalWidth.client || professionalWidth.x !== 0) failures.push(`Panel Profesional desplazado: ${JSON.stringify(professionalWidth)}`);
  await page.locator("#experiencia").screenshot({ path: path.join(outputDir, "07-profesional.png") });
  await (await settleSection(page, "#seguridad")).screenshot({ path: path.join(outputDir, "08-seguridad.png") });
  await (await settleSection(page, "#estado")).screenshot({ path: path.join(outputDir, "09-estado.png") });
  await (await settleSection(page, "#ecosistema")).screenshot({ path: path.join(outputDir, "10-ecosistema.png") });
  await (await settleSection(page, "#conversemos")).screenshot({ path: path.join(outputDir, "11-contacto.png") });

  await page.getByRole("button", { name: "Política de Privacidad" }).click();
  const privacy = page.locator("#modal-privacidad");
  if (await privacy.getAttribute("aria-hidden") !== "false") failures.push("El diálogo de privacidad no se abrió");
  await page.keyboard.press("Escape");
  if (await privacy.getAttribute("aria-hidden") !== "true") failures.push("Escape no cerró el diálogo de privacidad");
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
  await page.close();
}

{
  const { page } = await openPage({ width: 1440, height: 900 }, "reduce");
  const hiddenReveals = await page.locator("[data-reveal]:not(.is-visible)").count();
  if (hiddenReveals) failures.push(`Reduced motion dejó ${hiddenReveals} elementos ocultos`);
  await page.close();
}

await browser.close();

console.log(JSON.stringify({ baseURL, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
