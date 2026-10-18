const fs = require('node:fs');
const { chromium } = require('playwright');

const baseUrl = process.env.VITAIROS_PREVIEW_URL || 'http://127.0.0.1:4173/?preview=release-candidate';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const expectedRoutes = ['/vitairos-m/', '/vitairos-industrial-ai/', '/agro-intelligence/', '/conecta/'];

async function pageReady(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => sessionStorage.setItem('vitairos_intro_seen', '1'));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  return page;
}

async function interceptPayload(page) {
  await page.evaluate(() => {
    window.__diagnosticPayload = null;
    window.__diagnosticRequest = null;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.startsWith('https://formsubmit.co/ajax/')) {
        window.__diagnosticRequest = { url, method: init.method, headers: init.headers };
        window.__diagnosticPayload = JSON.parse(init.body);
        return new Response(JSON.stringify({ success: 'true', message: 'The form was submitted successfully.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(input, init);
    };
  });
}

async function fillContact(page, suffix) {
  await page.locator('#nombre').fill(`QA ${suffix}`);
  await page.locator('#empresa').fill(`VITAIROS QA ${suffix}`);
  await page.locator('#email').fill(`qa.${suffix.toLowerCase()}@example.com`);
  await page.locator('#telefono').fill('+56 9 1111 2222');
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath });
  const failures = [];

  const commercial = await pageReady(browser);
  await commercial.locator('label:has(input[value="Un proceso manual"])').click();
  await commercial.locator('[data-step="1"] [data-next-step]').click();
  await commercial.locator('#contexto').fill('Validación controlada de oportunidad comercial sin envío externo.');
  await commercial.locator('[data-step="2"] [data-next-step]').click();
  await commercial.locator('label:has(input[value="Explorando"])').click();
  await commercial.locator('[data-step="3"] [data-next-step]').click();
  await fillContact(commercial, 'Commercial');
  await interceptPayload(commercial);
  const consentContract = await commercial.evaluate(() => {
    const input = document.getElementById('privacyConsent');
    const normalize = (value) => value.replace(/\s+/g, ' ').trim();
    const labelText = input.getAttribute('aria-labelledby').split(' ').map((id) => document.getElementById(id)?.textContent || '').join(' ');
    return {
      name: input.name,
      value: input.value,
      required: input.required,
      checkedAttribute: input.hasAttribute('checked'),
      labelText: normalize(labelText),
      labelTargets: [...document.querySelectorAll('label[for="privacyConsent"]')].every((label) => label.htmlFor === input.id),
      infoText: normalize(document.querySelector('.privacy-consent > p').textContent),
      version: document.querySelector('input[name="privacy_version"]')?.value,
      modalText: normalize(document.querySelector('#modal-privacidad .modal-body').textContent)
    };
  });
  const exactConsentText = 'He leído la Política de Privacidad y autorizo a VITAIROS SpA a tratar mis datos personales para gestionar y responder mi solicitud, postulación o interés de colaboración.';
  const exactInfoText = 'Los datos serán utilizados para gestionar esta solicitud. El formulario es procesado mediante FormSubmit. Puedes contactarnos en contacto@vitairos.com.';
  if (consentContract.name !== 'privacy_consent' || consentContract.value !== 'yes' || !consentContract.required || consentContract.checkedAttribute || consentContract.labelText !== exactConsentText || !consentContract.labelTargets || consentContract.infoText !== exactInfoText || consentContract.version !== '2026-10') failures.push('Contrato explícito de consentimiento incompleto');
  for (const privacyTerm of ['Responsable:', 'VITAIROS SpA', 'Datos tratados:', 'Finalidad:', 'FormSubmit', 'marketing', 'Conservación:', 'Derechos y contacto:', 'contacto@vitairos.com']) if (!consentContract.modalText.includes(privacyTerm)) failures.push(`Política de Privacidad sin ${privacyTerm}`);
  const commercialConsentDefault = await commercial.locator('#privacyConsent').isChecked();
  await commercial.locator('#diagnosticForm button[type="submit"]').click();
  const commercialBlocked = await commercial.evaluate(() => ({
    payload: window.__diagnosticPayload,
    visibleStep: document.querySelector('.diagnostic-step:not([hidden])')?.dataset.step,
    focused: document.activeElement?.id,
    valid: document.getElementById('diagnosticForm').checkValidity()
  }));
  if (commercialConsentDefault || commercialBlocked.payload || commercialBlocked.visibleStep !== '4' || commercialBlocked.focused !== 'privacyConsent' || commercialBlocked.valid) failures.push('Commercial no bloquea y enfoca el consentimiento pendiente');
  const policyButton = commercial.locator('#privacyConsentPolicy');
  await policyButton.press('Enter');
  await commercial.waitForFunction(() => document.activeElement?.getAttribute('data-modal-close') === 'privacidad', undefined, { timeout: 1000 });
  const privacyOpen = await commercial.evaluate(() => ({ open: document.getElementById('modal-privacidad').classList.contains('open'), hidden: document.getElementById('modal-privacidad').getAttribute('aria-hidden'), focused: document.activeElement?.getAttribute('data-modal-close'), focusedTag: document.activeElement?.tagName, focusedId: document.activeElement?.id }));
  await commercial.keyboard.press('Shift+Tab');
  const focusWrappedBackward = await commercial.evaluate(() => document.activeElement?.getAttribute('href') === 'mailto:contacto@vitairos.com');
  await commercial.keyboard.press('Tab');
  const focusWrappedForward = await commercial.evaluate(() => document.activeElement?.getAttribute('data-modal-close') === 'privacidad');
  await commercial.keyboard.press('Escape');
  const privacyClosed = await commercial.evaluate(() => ({ hidden: document.getElementById('modal-privacidad').getAttribute('aria-hidden'), restored: document.activeElement?.id === 'privacyConsentPolicy' }));
  if (!privacyOpen.open || privacyOpen.hidden !== 'false' || privacyOpen.focused !== 'privacidad' || !focusWrappedBackward || !focusWrappedForward || privacyClosed.hidden !== 'true' || !privacyClosed.restored) failures.push('Política de Privacidad no conserva apertura, focus trap, Escape o focus restore');
  await commercial.locator('#privacyConsent').check();
  await commercial.locator('#diagnosticForm button[type="submit"]').click();
  await commercial.waitForFunction(() => window.__diagnosticPayload && document.getElementById('diagnosticForm').hidden);
  const commercialResult = await commercial.evaluate(() => ({ payload: window.__diagnosticPayload, request: window.__diagnosticRequest, formHidden: document.getElementById('diagnosticForm').hidden, thanksVisible: getComputedStyle(document.getElementById('gracias')).display !== 'none' }));
  const commercialPayload = commercialResult.payload;
  const commercialExpected = {
    lead_type: 'commercial', oportunidad: 'Un proceso manual', etapa: 'Explorando', nombre: 'QA Commercial',
    empresa: 'VITAIROS QA Commercial', email: 'qa.commercial@example.com', telefono: '+56 9 1111 2222',
    privacy_consent: 'yes', privacy_version: '2026-10', _subject: 'Nuevo diagnóstico de oportunidad VITAIROS'
  };
  for (const [key, value] of Object.entries(commercialExpected)) if (commercialPayload?.[key] !== value) failures.push(`Commercial payload ${key}: ${commercialPayload?.[key]}`);
  if (!commercialPayload?.contexto?.includes('oportunidad comercial')) failures.push('Commercial payload contexto ausente');
  if (commercialPayload?._next || commercialResult.request?.method !== 'POST' || !commercialResult.request?.url.startsWith('https://formsubmit.co/ajax/') || !commercialResult.formHidden || !commercialResult.thanksVisible) failures.push('Commercial no usa FormSubmit AJAX o no muestra confirmación interna');
  await commercial.close();

  const careers = await pageReady(browser);
  await careers.locator('label:has(input[value="Trabaja con nosotros"])').click();
  await careers.locator('[data-step="1"] [data-next-step]').click();
  await careers.locator('#contexto').fill('Validación controlada de interés laboral sin envío externo.');
  await careers.locator('[data-step="2"] [data-next-step]').click();
  const careerStep = await careers.evaluate(() => ({ step3Hidden: document.querySelector('[data-step="3"]').hidden, step4Hidden: document.querySelector('[data-step="4"]').hidden }));
  if (!careerStep.step3Hidden || careerStep.step4Hidden) failures.push('Careers no omite inequívocamente la etapa comercial');
  await fillContact(careers, 'Careers');
  await interceptPayload(careers);
  const careersConsentDefault = await careers.locator('#privacyConsent').isChecked();
  await careers.locator('#diagnosticForm button[type="submit"]').click();
  const careersBlocked = await careers.evaluate(() => ({ payload: window.__diagnosticPayload, visibleStep: document.querySelector('.diagnostic-step:not([hidden])')?.dataset.step, focused: document.activeElement?.id, valid: document.getElementById('diagnosticForm').checkValidity() }));
  if (careersConsentDefault || careersBlocked.payload || careersBlocked.visibleStep !== '4' || careersBlocked.focused !== 'privacyConsent' || careersBlocked.valid) failures.push('Careers no bloquea y enfoca el consentimiento pendiente');
  await careers.locator('#privacyConsent').check();
  await careers.locator('#diagnosticForm button[type="submit"]').click();
  await careers.waitForFunction(() => window.__diagnosticPayload && document.getElementById('diagnosticForm').hidden);
  const careersResult = await careers.evaluate(() => ({ payload: window.__diagnosticPayload, request: window.__diagnosticRequest, formHidden: document.getElementById('diagnosticForm').hidden, thanksVisible: getComputedStyle(document.getElementById('gracias')).display !== 'none' }));
  const careersPayload = careersResult.payload;
  const careersExpected = {
    lead_type: 'careers', oportunidad: 'Trabaja con nosotros', nombre: 'QA Careers',
    empresa: 'VITAIROS QA Careers', email: 'qa.careers@example.com', telefono: '+56 9 1111 2222',
    privacy_consent: 'yes', privacy_version: '2026-10', _subject: 'Interés laboral o de colaboración VITAIROS'
  };
  for (const [key, value] of Object.entries(careersExpected)) if (careersPayload?.[key] !== value) failures.push(`Careers payload ${key}: ${careersPayload?.[key]}`);
  if ('etapa' in (careersPayload || {})) failures.push('Careers payload incluye etapa comercial');
  if (!careersPayload?.contexto?.includes('interés laboral')) failures.push('Careers payload contexto ausente');
  if (careersPayload?._next || careersResult.request?.method !== 'POST' || !careersResult.request?.url.startsWith('https://formsubmit.co/ajax/') || !careersResult.formHidden || !careersResult.thanksVisible) failures.push('Careers no usa FormSubmit AJAX o no muestra confirmación interna');
  await careers.close();

  const errorsPage = await pageReady(browser);
  await errorsPage.locator('[data-step="1"] [data-next-step]').click();
  const invalidState = await errorsPage.evaluate(() => ({ visibleStep: document.querySelector('.diagnostic-step:not([hidden])')?.dataset.step, valid: document.getElementById('diagnosticForm').checkValidity() }));
  if (invalidState.visibleStep !== '1' || invalidState.valid) failures.push('Validación de error no retiene el primer paso');
  await errorsPage.goto(new URL('?preview=release-candidate&sent=1#gracias', baseUrl).toString(), { waitUntil: 'networkidle' });
  const successState = await errorsPage.evaluate(() => ({ formHidden: document.getElementById('diagnosticForm').hidden, thanksVisible: getComputedStyle(document.getElementById('gracias')).display !== 'none' }));
  if (!successState.formHidden || !successState.thanksVisible) failures.push('UX posterior al envío no muestra confirmación');
  await errorsPage.close();

  const auditPage = await pageReady(browser);
  const consoleErrors = [];
  auditPage.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  const audit = await auditPage.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]')).map((node) => node.id);
    const links = Array.from(document.querySelectorAll('a[href]'));
    const schemaRoots = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).flatMap((node) => { try { const parsed = JSON.parse(node.textContent); return Array.isArray(parsed) ? parsed : [parsed]; } catch { return []; } });
    const schema = schemaRoots.flatMap((entry) => Array.isArray(entry['@graph']) ? [entry, ...entry['@graph']] : [entry]);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((node) => ({ level: Number(node.tagName.slice(1)), text: node.textContent.trim() }));
    return {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      robots: document.querySelector('meta[name="robots"]')?.content || '',
      og: ['og:title', 'og:description', 'og:url', 'og:image'].every((property) => document.querySelector(`meta[property="${property}"]`)?.content),
      h1: headings.filter((heading) => heading.level === 1).length,
      headingSkips: headings.filter((heading, index) => index && heading.level - headings[index - 1].level > 1),
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      emptyLinks: links.filter((link) => !link.getAttribute('href')?.trim()).length,
      placeholderLinks: links.filter((link) => ['#', 'javascript:void(0)', 'javascript:;'].includes(link.getAttribute('href')?.trim().toLowerCase())).length,
      brokenAnchors: links.filter((link) => { const href = link.getAttribute('href') || ''; return href.startsWith('#') && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))); }).map((link) => link.getAttribute('href')),
      organizationSchema: schema.some((entry) => entry['@type'] === 'Organization'),
      schemaInstagram: JSON.stringify(schema).includes('https://www.instagram.com/vitairos_com'),
      routes: Array.from(document.querySelectorAll('.ecosystem-signature__project')).map((link) => new URL(link.href).pathname),
      instagram: document.querySelector('a[href="https://www.instagram.com/vitairos_com"]')?.rel || '',
      linkedin: document.querySelector('a[href="https://www.linkedin.com/company/vitairos/"]')?.rel || '',
      landmarks: { main: document.querySelectorAll('main').length, nav: document.querySelectorAll('nav').length, footer: document.querySelectorAll('footer').length },
      unlabeledControls: Array.from(document.querySelectorAll('button,input,textarea')).filter((control) => { if (control.type === 'hidden' || control.getAttribute('aria-hidden') === 'true') return false; if (control.matches('input[type="radio"]')) return !control.closest('label'); return !(control.getAttribute('aria-label') || control.getAttribute('aria-labelledby') || control.labels?.length || control.textContent.trim()); }).length
    };
  });
  if (!audit.title || !audit.description || audit.canonical !== 'https://www.vitairos.com/' || !audit.robots.includes('index') || !audit.og) failures.push('SEO metadata incompleta');
  if (audit.h1 !== 1 || audit.headingSkips.length) failures.push('Jerarquía de headings inválida');
  if (audit.duplicateIds.length || audit.emptyLinks || audit.placeholderLinks || audit.brokenAnchors.length) failures.push('IDs o links inválidos');
  if (!audit.organizationSchema || !audit.schemaInstagram) failures.push('JSON-LD incompleto');
  if (audit.routes.join('|') !== expectedRoutes.join('|')) failures.push('Rutas de proyectos incorrectas');
  if (!audit.instagram.includes('noopener') || !audit.instagram.includes('noreferrer') || !audit.linkedin.includes('noopener') || !audit.linkedin.includes('noreferrer')) failures.push('Rel social incompleto');
  if (audit.landmarks.main !== 1 || !audit.landmarks.nav || audit.landmarks.footer !== 1 || audit.unlabeledControls) failures.push('Landmarks o controles sin etiqueta');
  if (consoleErrors.length) failures.push(`Consola: ${consoleErrors.join(' | ')}`);
  await auditPage.close();

  const routeStatuses = {};
  for (const route of expectedRoutes) {
    const page = await browser.newPage(); const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' }); routeStatuses[route] = response?.status() || 0; await page.close();
    if (routeStatuses[route] !== 200) failures.push(`${route}: HTTP ${routeStatuses[route]}`);
  }

  await browser.close();
  const result = { consentContract, commercialBlocked, commercialResult, privacyOpen, privacyClosed, focusWrappedBackward, focusWrappedForward, careersBlocked, careersResult, careerStep, invalidState, successState, audit, routeStatuses, failures };
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = failures.length ? 1 : 0;
})().catch((error) => { console.error(error); process.exit(1); });
