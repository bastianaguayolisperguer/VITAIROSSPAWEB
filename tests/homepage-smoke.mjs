import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'assets/homepage.css'), 'utf8');
const js = readFileSync(resolve(root, 'assets/homepage.js'), 'utf8');
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const jsonLdMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
let jsonLd;

try {
  jsonLd = JSON.parse(jsonLdMatch?.[1] || '');
} catch (error) {
  failures.push(`JSON-LD inválido: ${error.message}`);
}

const expectedRoutes = ['/vitairos-m/', '/vitairos-industrial-ai/', '/agro-intelligence/', '/conecta/'];
const visibleFaqs = [...html.matchAll(/<details class="faq-item">[\s\S]*?<summary>\s*([^<]+)[\s\S]*?<div class="faq-body">([^<]+)<\/div>/g)];
const schemaFaq = jsonLd?.['@graph']?.find((item) => item['@type'] === 'FAQPage')?.mainEntity || [];

expect(html.includes('<main id="main-content">'), 'Falta el landmark main.');
expect((html.match(/<h1\b/g) || []).length === 1, 'Debe existir un único h1.');
expect(duplicates.length === 0, `IDs duplicados: ${duplicates.join(', ')}`);
expect(html.includes('/assets/homepage.css') && html.includes('/assets/homepage.js'), 'Los assets modulares no están enlazados.');
expect(!html.includes('fonts.googleapis.com'), 'La tipografía todavía depende de Google Fonts.');
expect((html.match(/class="orbit-project(?:\s|")/g) || []).length === 4, 'La órbita debe contener cuatro proyectos.');
expectedRoutes.forEach((route) => expect(html.includes(`href="${route}"`), `Falta el enlace ${route}.`));
expect(!/(\+10 años|100% Entregas|Respuesta en 24h|Propuesta en 48h|España y EE\.UU\.)/i.test(html), 'Persisten afirmaciones comerciales retiradas.');
expect(!/(id="precios"|id="trabaja"|job-card|pricing-card)/.test(html), 'Persisten secciones obsoletas en el HTML.');
expect(visibleFaqs.length === 4, `Se esperaban 4 preguntas visibles y hay ${visibleFaqs.length}.`);
expect(schemaFaq.length === visibleFaqs.length, 'El FAQ visible no coincide con los datos estructurados.');
expect(css.includes('@font-face') && css.includes('projectOrbit'), 'Faltan tipografía local o estilos orbitales.');
expect(js.includes('prefersReducedMotion') && js.includes('revealVisibleItems'), 'Faltan salvaguardas de movimiento o reveals.');
expect(statSync(resolve(root, 'index.html')).size < 60000, 'El HTML volvió a superar 60 KB.');

if (failures.length) {
  console.error('Homepage smoke test failures:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Homepage smoke test: OK (${statSync(resolve(root, 'index.html')).size} bytes, ${ids.length} IDs, ${visibleFaqs.length} FAQs).`);
