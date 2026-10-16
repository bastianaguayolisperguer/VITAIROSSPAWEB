import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.VITAIROS_M_URL || "http://127.0.0.1:4174/vitairos-m/";
const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const outputDir = path.resolve("preview/vitairos-m-v2-3-demand-review");
const viewports = [[1920,1080],[1440,900],[1366,768],[1024,768],[768,1024],[430,932],[390,844],[360,800]];
const failures = [];
const results = [];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: edgePath, headless: true });

function fail(condition, message) {
  if (condition) failures.push(message);
}

async function createPage(width, height, { reducedMotion = "no-preference", query = "qa=23&utm_source=qa&utm_medium=local&utm_campaign=v23&utm_content=demand&utm_term=continuidad" } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || "failed"}`));
  await page.addInitScript(() => sessionStorage.setItem("vitairosMIntroSeen", "1"));
  const response = await page.goto(`${baseURL}?${query}`, { waitUntil: "networkidle" });
  fail(!response || response.status() !== 200, `HTTP ${response?.status() || "sin respuesta"} en ${width}x${height}`);
  return { context, page, consoleErrors, requestFailures };
}

async function stabilize(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important;transition-delay:0s!important}
    [data-reveal]{opacity:1!important;transform:none!important}
    .between-session__landscape,.between-session article{opacity:1!important;filter:none!important;transform:none!important}
    .between-session__rail{transform:none!important}.between-session__flow{display:none!important}
    .loop-center,.loop-node,.loop-return-cue{opacity:1!important}.loop-path--draw{stroke-dashoffset:0!important}
    @media(min-width:1041px){.loop-center{transform:translate(-50%,-48%) scale(1)!important}.loop-node--person,.loop-node--professional{transform:translateX(-50%)!important}.loop-return-cue{transform:none!important}}
  ` });
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
    document.querySelectorAll(".hero,.hero-orbit,[data-loop]").forEach((item) => item.classList.add("is-in-view"));
  });
  await page.waitForTimeout(80);
}

for (const [width, height] of viewports) {
  const { context, page, consoleErrors, requestFailures } = await createPage(width, height);
  await stabilize(page);
  const metrics = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
    const ariaRefs = Array.from(document.querySelectorAll("[aria-controls],[aria-labelledby],[aria-describedby]")).flatMap((element) => ["aria-controls","aria-labelledby","aria-describedby"].flatMap((attribute) => (element.getAttribute(attribute) || "").split(/\s+/).filter(Boolean)));
    const controls = Array.from(document.querySelectorAll("input:not([type=hidden]):not([aria-hidden=true]),select,textarea"));
    const targetSelector = ".brand,.desktop-nav a,.menu-toggle,.button,[role=tab],.path-choice,.demand-panel__close,.demand-success button,.ecosystem-heading>a,.ecosystem-grid>a,.mobile-menu a,.privacy-consent button,.demand-form-card input:not([type=hidden]):not([type=checkbox]):not(.form-honey),.demand-form-card select";
    const undersizedTargets = Array.from(document.querySelectorAll(targetSelector)).filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).map((element) => element.className || element.id || element.tagName);
    const forms = Array.from(document.querySelectorAll("[data-demand-form]"));
    const tracking = Object.fromEntries(Array.from(forms[0].querySelectorAll("input[type=hidden]")).map((field) => [field.name, field.value]));
    return {
      viewport: `${innerWidth}x${innerHeight}`,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      duplicateIds: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
      missingAriaRefs: ariaRefs.filter((id) => !document.getElementById(id)),
      missingLabels: controls.filter((control) => !control.labels?.length && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby")).map((control) => control.id || control.name),
      undersizedTargets,
      sectionOrder: Array.from(document.querySelectorAll("main > section")).map((section) => section.id),
      stateSectionCount: document.querySelectorAll(".product-state,.state-card,#estado").length,
      stateCopyFound: /Estado del producto|Base actual|Próxima etapa/.test(document.querySelector("main").innerText),
      heroMoments: Array.from(document.querySelectorAll(".hero-orbit .orbit-node strong")).map((node) => node.textContent.trim()),
      heroConnectorClosed: /Z\s*$/i.test(document.querySelector(".orbit-connector")?.getAttribute("d") || ""),
      loopMoments: Array.from(document.querySelectorAll(".continuity-loop .loop-node h3")).map((node) => node.textContent.trim()),
      choiceCount: document.querySelectorAll("[data-lead-select]").length,
      formCount: forms.length,
      formActions: forms.map((form) => form.getAttribute("action")),
      leadTypes: forms.map((form) => form.querySelector('[name="lead_type"]')?.value),
      consentPurposes: forms.map((form) => form.querySelector('[name="consent_purpose"]')?.value),
      privacyVersions: forms.map((form) => form.querySelector('[name="privacy_version"]')?.value),
      consents: forms.map((form) => ({ required: form.querySelector('[name="privacy_consent"]')?.required, value: form.querySelector('[name="privacy_consent"]')?.value })),
      prohibitedFields: forms.flatMap((form) => Array.from(form.elements).map((field) => field.name).filter((name) => /diagnost|sintom|salud|medic|tratamiento/i.test(name))),
      personFields: Array.from(forms[0].elements).map((field) => field.name).filter(Boolean),
      professionalFields: Array.from(forms[1].elements).map((field) => field.name).filter(Boolean),
      institutionFields: Array.from(forms[2].elements).map((field) => field.name).filter(Boolean),
      tracking,
      pathColumns: getComputedStyle(document.querySelector(".participation-paths")).gridTemplateColumns,
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1Count: document.querySelectorAll("h1").length
    };
  });
  fail(metrics.scrollWidth > metrics.clientWidth + 1, `Overflow ${metrics.viewport}: ${metrics.scrollWidth}>${metrics.clientWidth}`);
  fail(metrics.brokenImages.length, `Imágenes rotas ${metrics.viewport}: ${metrics.brokenImages.join(",")}`);
  fail(metrics.duplicateIds.length || metrics.missingAriaRefs.length || metrics.missingLabels.length, `Regresión semántica ${metrics.viewport}`);
  fail(metrics.undersizedTargets.length, `Targets menores a 44px ${metrics.viewport}: ${metrics.undersizedTargets.join(",")}`);
  fail(metrics.sectionOrder.slice(-3).join(",") !== "seguridad,participa,ecosistema", `Cierre narrativo alterado ${metrics.viewport}: ${metrics.sectionOrder.join(",")}`);
  fail(metrics.stateSectionCount || metrics.stateCopyFound, `Estado del producto sigue en DOM ${metrics.viewport}`);
  fail(metrics.heroMoments.join("|") !== "Persona|Contexto|Profesional|Recontextualización" || !metrics.heroConnectorClosed, `Hero sin circuito cerrado ${metrics.viewport}`);
  fail(metrics.loopMoments.join("|") !== "Persona|Contexto|Información autorizada|Atención profesional|Recontextualización|Retorno a la persona", `Loop principal alterado ${metrics.viewport}`);
  fail(metrics.choiceCount !== 3 || metrics.formCount !== 3, `Rutas de demanda incompletas ${metrics.viewport}`);
  fail(metrics.formActions.some((action) => action !== "https://formsubmit.co/contacto@vitairos.com"), `Destino FormSubmit alterado ${metrics.viewport}`);
  fail(metrics.leadTypes.join("|") !== "person|professional|institution", `lead_type incorrecto ${metrics.viewport}`);
  fail(metrics.consentPurposes.join("|") !== "early_access|professional_network|institutional_contact", `consent_purpose incorrecto ${metrics.viewport}`);
  fail(metrics.privacyVersions.some((value) => value !== "2026-10") || metrics.consents.some((item) => !item.required || item.value !== "yes"), `Consentimiento incompleto ${metrics.viewport}`);
  fail(metrics.prohibitedFields.length, `Campos clínicos no permitidos ${metrics.viewport}: ${metrics.prohibitedFields.join(",")}`);
  fail(!["nombre","correo","region_ciudad","privacy_consent"].every((name) => metrics.personFields.includes(name)), `Formulario persona incompleto ${metrics.viewport}`);
  fail(!["nombre","correo","ciudad_region","profesion","especialidades","anos_experiencia","interes_pruebas_pilotos","privacy_consent"].every((name) => metrics.professionalFields.includes(name)), `Formulario profesional incompleto ${metrics.viewport}`);
  fail(!["nombre","organizacion","cargo","correo_corporativo","telefono","tamano_comunidad","interes","privacy_consent"].every((name) => metrics.institutionFields.includes(name)), `Formulario institución incompleto ${metrics.viewport}`);
  fail(metrics.tracking.utm_source !== "qa" || metrics.tracking.utm_medium !== "local" || metrics.tracking.utm_campaign !== "v23" || metrics.tracking.utm_content !== "demand" || metrics.tracking.utm_term !== "continuidad" || metrics.tracking.landing_path !== "/vitairos-m/" || !metrics.tracking.referrer, `Tracking incompleto ${metrics.viewport}`);
  fail(width > 1040 ? metrics.pathColumns.split(" ").length !== 3 : metrics.pathColumns.split(" ").length !== 1, `Rutas responsive incorrectas ${metrics.viewport}: ${metrics.pathColumns}`);
  fail(metrics.title !== "VITAIROS-M | Continuidad en salud mental digital" || metrics.canonical !== "https://www.vitairos.com/vitairos-m/" || metrics.h1Count !== 1, `SEO/estructura alterados ${metrics.viewport}`);
  fail(consoleErrors.length, `Consola ${metrics.viewport}: ${consoleErrors.join(" | ")}`);
  fail(requestFailures.length, `Requests fallidas ${metrics.viewport}: ${requestFailures.join(" | ")}`);
  results.push({ ...metrics, consoleErrors, requestFailures });
  await context.close();
}

let interactionChecks;
{
  const { context, page, consoleErrors, requestFailures } = await createPage(1440, 900);
  await stabilize(page);
  const choices = page.locator("[data-lead-select]");
  await choices.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  const arrowFocus = await choices.nth(1).evaluate((element) => document.activeElement === element);
  await page.keyboard.press("Enter");
  const professionalOpen = await page.locator('[data-lead-view="professional"]').isVisible();
  const professionalExpanded = await choices.nth(1).getAttribute("aria-expanded");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(360);
  const closed = await page.locator("[data-demand-panel]").isHidden();
  const focusRestored = await choices.nth(1).evaluate((element) => document.activeElement === element);
  await choices.nth(0).click();
  await page.locator('[data-lead-view="person"] .form-submit').click();
  const errorVisible = await page.locator('[data-lead-view="person"] [data-form-error]').isVisible();
  await page.getByRole("button", { name: "Política de Privacidad" }).click();
  const privacyOpen = await page.locator("#modal-privacidad").getAttribute("aria-hidden");
  await page.keyboard.press("Escape");
  interactionChecks = { arrowFocus, professionalOpen, professionalExpanded, closed, focusRestored, errorVisible, privacyOpen, consoleErrors, requestFailures };
  fail(!arrowFocus || !professionalOpen || professionalExpanded !== "true", "Selección de ruta por teclado incorrecta");
  fail(!closed || !focusRestored, "Escape no cierra la ruta y restaura foco");
  fail(!errorVisible, "El error accesible del formulario no aparece");
  fail(privacyOpen !== "false", "La política de privacidad no abre desde el formulario");
  fail(consoleErrors.length || requestFailures.length, "Errores durante interacciones de demanda");
  await context.close();
}

let successCheck;
{
  const { context, page, consoleErrors, requestFailures } = await createPage(390, 844, { query: "qa=23&lead=person&enviado=1" });
  await page.waitForTimeout(120);
  successCheck = {
    panelVisible: await page.locator("[data-demand-panel]").isVisible(),
    successVisible: await page.locator('[data-demand-success="person"]').isVisible(),
    formHidden: await page.locator('[data-lead-view="person"] [data-demand-form]').isHidden(),
    selected: await page.locator('[data-lead-select="person"]').getAttribute("aria-expanded"),
    consoleErrors,
    requestFailures
  };
  fail(!successCheck.panelVisible || !successCheck.successVisible || !successCheck.formHidden || successCheck.selected !== "true", `Confirmación FormSubmit incorrecta: ${JSON.stringify(successCheck)}`);
  fail(consoleErrors.length || requestFailures.length, "Errores en confirmación de envío");
  await context.close();
}

let reducedMotion;
{
  const { context, page, consoleErrors, requestFailures } = await createPage(390, 844, { reducedMotion: "reduce" });
  reducedMotion = await page.evaluate(() => ({
    introDisplay: getComputedStyle(document.querySelector("[data-site-intro]")).display,
    pulseDisplay: getComputedStyle(document.querySelector(".orbit-travel-pulse")).display,
    hiddenReveals: Array.from(document.querySelectorAll("[data-reveal]")).filter((element) => Number.parseFloat(getComputedStyle(element).opacity) < 0.99).length
  }));
  fail(reducedMotion.introDisplay !== "none" || reducedMotion.pulseDisplay !== "none" || reducedMotion.hiddenReveals, `Reduced motion inválido: ${JSON.stringify(reducedMotion)}`);
  fail(consoleErrors.length || requestFailures.length, "Errores con reduced motion");
  await context.close();
}

async function captureSection(file, selector, width = 1440, height = 900, lead = null) {
  const { context, page } = await createPage(width, height);
  await stabilize(page);
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}.site-header,.skip-link,.reading-progress{display:none!important}" });
  if (lead) await page.locator(`[data-lead-select="${lead}"]`).click();
  await page.locator(selector).screenshot({ path: path.join(outputDir, file) });
  await context.close();
}

async function captureTransition() {
  const { context, page } = await createPage(1440, 1000);
  await stabilize(page);
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}.site-header,.skip-link,.reading-progress{display:none!important}" });
  await page.evaluate(() => {
    const safety = document.querySelector("#seguridad");
    window.scrollTo(0, safety.offsetTop + safety.offsetHeight - 320);
  });
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(outputDir, "04-seguridad-a-participacion.png") });
  await context.close();
}

async function captureFull(file, width, height) {
  const { context, page } = await createPage(width, height);
  await stabilize(page);
  await page.screenshot({ path: path.join(outputDir, file), fullPage: true });
  await context.close();
}

await captureSection("01-hero-circuito-completo.png", ".hero-orbit");
await captureSection("02-continuidad-recontextualizacion.png", "#continuidad");
await captureSection("03-retorno-a-la-persona.png", ".continuity-loop");
await captureTransition();
await captureSection("05-participacion-desktop.png", "#participa");
await captureSection("06-participacion-mobile.png", "#participa", 390, 844);
await captureSection("07-ruta-persona-seleccionada.png", ".participation-paths", 1440, 900, "person");
await captureSection("08-ruta-profesional-seleccionada.png", ".participation-paths", 1440, 900, "professional");
await captureSection("09-ruta-institucion-seleccionada.png", ".participation-paths", 1440, 900, "institution");
await captureSection("10-formulario-persona.png", ".demand-panel", 1440, 900, "person");
await captureSection("11-formulario-profesional.png", ".demand-panel", 1440, 900, "professional");
await captureSection("12-formulario-institucion.png", ".demand-panel", 1440, 900, "institution");
await captureSection("13-ecosistema-final.png", "#ecosistema");
await captureFull("14-pagina-completa-desktop.png", 1440, 900);
await captureFull("15-pagina-completa-mobile.png", 390, 844);

await browser.close();
const screenshots = (await fs.readdir(outputDir)).filter((file) => file.endsWith(".png")).sort();
fail(screenshots.length !== 15, `Se esperaban 15 capturas y existen ${screenshots.length}`);
const report = { baseURL, viewports: results, interactions: interactionChecks, success: successCheck, reducedMotion, screenshots, failures };
await fs.writeFile(path.join(outputDir, "qa-results.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ viewports: results.map((item) => item.viewport), interactions: interactionChecks, success: successCheck, reducedMotion, screenshots, failures }, null, 2));
if (failures.length) process.exitCode = 1;
