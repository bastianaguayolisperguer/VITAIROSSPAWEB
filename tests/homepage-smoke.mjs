import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'assets/homepage.css'), 'utf8');
const js = readFileSync(resolve(root, 'assets/homepage.js'), 'utf8');
const news = JSON.parse(readFileSync(resolve(root, 'data/news.json'), 'utf8'));
const jobs = JSON.parse(readFileSync(resolve(root, 'data/jobs.json'), 'utf8'));
const milestones = JSON.parse(readFileSync(resolve(root, 'data/milestones.json'), 'utf8'));
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
const expectedSections = ['inicio', 'brecha', 'soluciones', 'metodo', 'ecosistema', 'actualidad', 'nosotros', 'trabaja', 'contacto'];

expect(html.includes('<main id="main-content">'), 'Falta el landmark main.');
expect((html.match(/<h1\b/g) || []).length === 1, 'Debe existir un único h1.');
expect(duplicates.length === 0, `IDs duplicados: ${duplicates.join(', ')}`);
expect(html.includes('/assets/homepage.css') && html.includes('/assets/homepage.js'), 'Los assets modulares no están enlazados.');
expect(!html.includes('fonts.googleapis.com'), 'La tipografía todavía depende de Google Fonts.');
expect((html.match(/class="orbit-project(?:\s|")/g) || []).length === 4, 'La órbita debe contener cuatro proyectos.');
expect((html.match(/class="project-card__identity(?:\s|")/g) || []).length === 4, 'Cada iniciativa debe mostrar su identidad visual.');
expect(!html.includes('themeToggle') && !html.includes('cursor-glow'), 'Persisten controles visuales retirados.');
expectedRoutes.forEach((route) => expect(html.includes(`href="${route}"`), `Falta el enlace ${route}.`));
expectedSections.forEach((id) => expect(html.includes(`id="${id}"`), `Falta la sección #${id}.`));
expect(!/(\+10 años|100% Entregas|Respuesta en 24h|Propuesta en 48h|España y EE\.UU\.)/i.test(html), 'Persisten afirmaciones comerciales retiradas.');
expect(!/(id="precios"|job-card|pricing-card)/.test(html), 'Persisten secciones obsoletas en el HTML.');
expect(html.includes('id="empresa"') && !html.includes('id="telefono"'), 'El formulario no fue simplificado correctamente.');
expect(html.includes('data-news-section') && html.includes('id="jobsList"'), 'Faltan contenedores de contenido dinámico.');
expect(jsonLd?.['@graph']?.some((item) => item['@type'] === 'Organization'), 'Falta Organization en JSON-LD.');
expect(!jsonLd?.['@graph']?.some((item) => item['@type'] === 'FAQPage'), 'Existe FAQPage sin FAQ visible.');
expect(Array.isArray(news) && news.length > 0 && news.every((item) => item.verified === true && item.link && item.image), 'news.json contiene entradas no verificadas o incompletas.');
expect(Array.isArray(jobs) && jobs.every((item) => item.status === 'open' || item.status === 'closed'), 'jobs.json no es una lista de estados válidos.');
expect(Array.isArray(milestones) && milestones.every((item) => item.verified === true && item.source), 'milestones.json contiene hitos sin fuente.');
expect(css.includes('@font-face') && css.includes('project-node-layer') && css.includes('PREMIUM COMMERCIAL ITERATION'), 'Faltan tipografía local, esfera o estilos premium.');
expect(js.includes('prefersReducedMotion') && js.includes('revealVisibleItems') && js.includes('vitairos_intro_seen'), 'Faltan salvaguardas de movimiento, reveals o control de repetición.');
expect(js.includes("fetch('/data/news.json'") && js.includes("fetch('/data/jobs.json'"), 'Los datos editoriales no se cargan desde JSON.');
expect(statSync(resolve(root, 'assets/projects/vitairos-m.svg')).size > 0 && statSync(resolve(root, 'assets/projects/industrial-ai.svg')).size > 0, 'Faltan marcas vectoriales de proyecto.');
expect(statSync(resolve(root, 'index.html')).size < 60000, 'El HTML volvió a superar 60 KB.');

if (failures.length) {
  console.error('Homepage smoke test failures:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Homepage smoke test: OK (${statSync(resolve(root, 'index.html')).size} bytes, ${ids.length} IDs, ${news.length} noticias verificadas).`);
