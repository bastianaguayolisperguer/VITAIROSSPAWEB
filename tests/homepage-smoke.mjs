import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'assets/homepage.css'), 'utf8');
const js = readFileSync(resolve(root, 'assets/homepage.js'), 'utf8');
const news = JSON.parse(readFileSync(resolve(root, 'data/news.json'), 'utf8'));
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
const jsonLdMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
let jsonLd;
try { jsonLd = JSON.parse(jsonLdMatch?.[1] || ''); }
catch (error) { failures.push(`JSON-LD inválido: ${error.message}`); }

const expectedRoutes = ['/vitairos-m/', '/vitairos-industrial-ai/', '/agro-intelligence/', '/conecta/'];
const expectedSections = ['inicio', 'brecha', 'soluciones', 'metodo', 'ecosistema', 'actualidad', 'nosotros', 'diagnostico', 'contacto'];

expect(html.includes('<main id="main-content">'), 'Falta el landmark main.');
expect((html.match(/<h1\b/g) || []).length === 1, 'Debe existir un único h1.');
expect(duplicates.length === 0, `IDs duplicados: ${duplicates.join(', ')}`);
expect(html.includes('/assets/homepage.css') && html.includes('/assets/homepage.js'), 'Los assets modulares no están enlazados.');
expect(!html.includes('fonts.googleapis.com'), 'La tipografía todavía depende de Google Fonts.');
expect((html.match(/class="orbit-project(?:\s|")/g) || []).length === 4, 'La esfera debe contener cuatro nodos de proyecto.');
expect((html.match(/data-ecosystem-item=/g) || []).length === 4, 'El ecosistema debe contener cuatro iniciativas.');
expect((html.match(/class="method-node"/g) || []).length === 4, 'La metodología debe contener exactamente cuatro etapas.');
expect((html.match(/class="diagnostic-step/g) || []).length === 4, 'El diagnóstico debe contener cuatro pasos.');
expect((html.match(/name="oportunidad"/g) || []).length === 6, 'El paso 1 debe conservar seis opciones.');
expect((html.match(/name="etapa"/g) || []).length === 5, 'El paso 3 debe conservar cinco estados.');
expect(html.includes('Enviar mi caso para revisión') && html.includes('Revisaremos el contexto antes de responderte.'), 'Falta el cierre honesto del diagnóstico.');
expect(html.includes('Revisión humana del contexto') && html.includes('Alcance proporcional al problema') && html.includes('Contexto antes de proponer'), 'Faltan los compromisos positivos del diagnóstico.');
expect((html.match(/data-progress-node=/g) || []).length === 4, 'El progreso del diagnóstico debe contener cuatro nodos.');
expect(html.includes('id="telefono"') && html.includes('(opcional)'), 'El teléfono debe existir solo como campo opcional.');
expect(!html.includes('light-region') && !html.includes('capability-rail') && !html.includes('project-card'), 'Persisten patrones visuales retirados de V2.');
expect(!html.includes('id="precios"') && !html.includes('pricing-card'), 'Persisten secciones obsoletas.');
expect(!/(\+10 años|100% Entregas|Respuesta en 24h|Propuesta en 48h|España y EE\.UU\.)/i.test(html), 'Persisten afirmaciones comerciales no verificadas.');
expectedRoutes.forEach((route) => expect(html.includes(`href="${route}"`), `Falta el enlace ${route}.`));
expectedSections.forEach((id) => expect(html.includes(`id="${id}"`), `Falta #${id}.`));
expect(jsonLd?.['@graph']?.some((item) => item['@type'] === 'Organization'), 'Falta Organization en JSON-LD.');
expect(!jsonLd?.['@graph']?.some((item) => item['@type'] === 'FAQPage'), 'Existe FAQPage sin FAQ visible.');
expect(Array.isArray(news) && news.length > 0 && news.every((item) => item.verified === true && item.link), 'news.json contiene entradas sin verificación o fuente.');
expect(css.includes('@font-face') && css.includes('project-node-layer') && css.includes('VITAIROS HOME V3'), 'Faltan tipografía local, esfera o sistema visual V3.');
expect(css.includes('V3.1 / one continuous dark scene') && css.includes('.method-network.is-complete+.method-release'), 'Falta la continuidad cromática o la expansión de metodología V3.1.');
expect(css.includes('@media (max-width:1099px)') && js.includes("matchMedia('(min-width: 1100px)')"), 'El breakpoint desktop de 1100 px no está alineado.');
expect(css.includes('@media (prefers-reduced-motion:reduce)'), 'Falta la salvaguarda CSS de movimiento reducido.');
expect(js.includes('prefersReducedMotion') && js.includes('vitairos_intro_seen') && js.includes('revealVisibleItems'), 'Faltan salvaguardas de movimiento, intro o reveals.');
expect(js.includes("fetch('/data/news.json'") && js.includes('.slice(0,2)'), 'Actualidad no está limitada a dos historias verificadas.');
expect(js.includes('activateValue') && js.includes('activateEcosystem') && js.includes('showStep'), 'Faltan interacciones principales de la V3.');
expect(js.includes("labels:['Documentos','Operación','Datos','Trazabilidad']") && js.includes("labels:['Personas','Aprendizaje','Conexión','Oportunidad']"), 'Las microvisualizaciones del ecosistema no conservan su semántica propia.');
expect(statSync(resolve(root, 'index.html')).size < 60000, 'El HTML supera 60 KB.');

if (failures.length) {
  console.error('Homepage V3.1 smoke test failures:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Homepage V3.1 smoke test: OK (${statSync(resolve(root, 'index.html')).size} bytes, ${ids.length} IDs, ${news.length} noticias verificadas).`);
