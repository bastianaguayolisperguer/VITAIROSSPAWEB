import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(path.join(root, "assets", "homepage-v2.css"), "utf8");
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function matches(pattern) {
  return pattern.test(html);
}

check(matches(/<html[^>]+lang="es-CL"/i), "El documento debe declarar lang=es-CL.");
check((html.match(/<h1\b/gi) || []).length === 1, "Debe existir exactamente un H1.");
check(matches(/<main\s+id="contenido"/i), "Falta el landmark <main>.");
check(matches(/class="skip-link"[^>]+href="#contenido"/i), "Falta el skip link al contenido.");
check(matches(/rel="canonical"\s+href="https:\/\/www\.vitairos\.com\/"/i), "Canonical incorrecto.");
check(matches(/property="og:image"/i) && matches(/name="twitter:image"/i), "Faltan imágenes sociales.");
check(/prefers-reduced-motion/.test(css), "El CSS debe contemplar prefers-reduced-motion.");
check(!matches(/data:image\//i), "La homepage no debe volver a incrustar imágenes base64.");

const bannedClaims = [
  /100%\s+entregas/i,
  /respuesta garantizada/i,
  /clientes en chile,?\s*arg/i,
  /españa y ee\.?\s*uu/i,
  /\+10 años/i,
  /propuesta en 48h/i,
  /tel(?:ephone)?"?\s*:\s*"\+56 9 0000 0000/i
];

for (const claim of bannedClaims) {
  check(!claim.test(html), `Claim no respaldado detectado: ${claim}`);
}

for (const route of ["/vitairos-m/", "/vitairos-industrial-ai/", "/agro-intelligence/", "/conecta/"]) {
  check(html.includes(`href="${route}"`), `Falta enlace editorial a ${route}`);
}

const ids = new Set(Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));
const duplicateIds = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1])
  .filter((id, index, all) => all.indexOf(id) !== index);
check(duplicateIds.length === 0, `IDs duplicados: ${[...new Set(duplicateIds)].join(", ")}`);

for (const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
  check(ids.has(match[1]), `Anchor sin destino: #${match[1]}`);
}

for (const match of html.matchAll(/\b(?:src|href)="(\/[^"]+)"/g)) {
  const reference = match[1].split(/[?#]/)[0];
  if (reference === "/" || reference.endsWith("/")) continue;
  const candidate = path.join(root, reference.replace(/^\//, ""));
  check(fs.existsSync(candidate), `Asset local inexistente: ${reference}`);
}

const jsonLdBlocks = Array.from(html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi));
check(jsonLdBlocks.length > 0, "Falta JSON-LD.");
for (const [, raw] of jsonLdBlocks) {
  try {
    JSON.parse(raw);
  } catch (error) {
    errors.push(`JSON-LD inválido: ${error.message}`);
  }
}

const faqVisible = (html.match(/<details>/g) || []).length;
const faqStructured = (html.match(/"@type":\s*"Question"/g) || []).length;
check(faqVisible === faqStructured, `FAQ visible (${faqVisible}) y estructurado (${faqStructured}) no coinciden.`);

if (errors.length) {
  console.error(`Homepage smoke test: ${errors.length} error(es)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const size = fs.statSync(htmlPath).size;
console.log(`Homepage smoke test: OK (${size} bytes, ${ids.size} IDs, ${faqVisible} FAQs).`);
