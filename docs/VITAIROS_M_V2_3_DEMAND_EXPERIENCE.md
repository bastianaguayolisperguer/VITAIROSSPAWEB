# VITAIROS-M V2.3 — Continuidad y experiencia de demanda

## Estado

Implementación terminada y validada localmente sobre la base `57d7311cbfb911091d361378e73d14690e89ea74`. Esta iteración no modifica producción, Cloudflare, D1 remoto ni Turnstile productivo.

## Modelo de continuidad

El hero ahora comunica un circuito cerrado de cuatro momentos: Persona → Contexto → Atención profesional → Recontextualización → Persona. El pulso recorre la órbita completa y el isotipo alcanza su estado final de crecimiento al cerrar el retorno.

El loop principal mantiene el detalle de información autorizada, pero conserva la misma macroestructura y termina explícitamente en recontextualización y retorno a la persona.

## Recontextualización

La fase se presenta con terminología segura: nuevo contexto autorizado, continuidad ajustada y retorno a la persona. No se atribuyen decisiones clínicas autónomas a la tecnología.

## Product State

La sección pública “Estado del producto / Base actual / Próxima etapa” fue eliminada del DOM. La página pasa directamente desde Seguridad y criterio hacia Participación inicial, sin espacio residual.

## Experiencia de demanda

La sección genérica de contacto fue reemplazada por tres decisiones previas al formulario:

1. Persona — acceso anticipado.
2. Psicólogos / profesionales — red inicial.
3. Universidades, empresas y organizaciones — evaluación de piloto.

Cada selección abre un panel integrado con beneficios, campos, consentimiento, CTA y mensaje de éxito propios. No se utiliza urgencia falsa ni FOMO.

## Formularios y privacidad

- Persona: nombre, correo y región/ciudad opcional. No solicita información clínica ni sensible de salud.
- Profesional: nombre, correo, ciudad/región, profesión, especialidades, años de experiencia opcional e interés en pruebas o pilotos.
- Institución: nombre, organización, cargo, correo corporativo, teléfono opcional, tamaño aproximado de comunidad opcional e interés.
- Los tres formularios mantienen FormSubmit hacia `contacto@vitairos.com`.
- Payloads: `lead_type=person|professional|institution`.
- Consentimiento: `privacy_consent=yes`, `privacy_version=2026-10` y propósito diferenciado por segmento.
- Tracking preparado en frontend: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer` y `landing_path`.

## QA

Suite: `tests/vitairos-m-v2-3-demand-qa.mjs`.

Se validaron sin fallas los viewports 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844 y 360×800.

Cobertura:

- circuito cerrado y recontextualización;
- eliminación completa de Product State;
- estructura, labels, referencias ARIA, imágenes y overflow;
- tres rutas, formularios y payloads;
- tracking y consentimiento;
- teclado, foco, Escape y modal de privacidad;
- estados de error y confirmación posterior a FormSubmit;
- `prefers-reduced-motion`;
- consola y requests locales sin errores.

Resultado completo: `preview/vitairos-m-v2-3-demand-review/qa-results.json`.

## Lighthouse

Auditoría local con Lighthouse 13.5.0:

- Performance: 95.
- Accessibility: 100.
- Best Practices: 100.
- SEO: 100.
- FCP: 2.0 s.
- LCP: 2.6 s.
- TBT: 0 ms.
- CLS: 0.

Reporte: `preview/vitairos-m-v2-3-demand-review/lighthouse-report.json`.

## Capturas

Se generaron exactamente 15 capturas en `preview/vitairos-m-v2-3-demand-review/`, desde el hero y el circuito hasta las tres rutas, los tres formularios, el ecosistema y las páginas completas desktop/mobile.

## Pendientes

No quedan incidencias funcionales o visuales detectadas en el alcance V2.3. El envío real no se ejecutó durante QA para evitar transmitir datos; FormSubmit permanece como fallback configurado. Cualquier base de datos, antiabuso productivo, despliegue o cambio de infraestructura queda fuera de esta iteración.
