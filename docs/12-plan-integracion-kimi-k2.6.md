# Plan De Integracion Operativa Para Kimi K2.6

Fecha de corte del analisis: 2026-04-22

## 1) Estado actual (resumen real)

El repo ya tiene base host-driven funcional:

- tenancy por `host` resuelto en runtime;
- fetchers base de `bootstrap`, `catalog`, `categories`, `product`, `payment-methods`, `checkout`, `order-by-token`;
- superficies publicas base: home, catalogo, producto, checkout, confirmacion por token;
- SEO tenant-aware: `generateMetadata`, `robots`, `sitemap`, canonical;
- theming por tenant + modulos reutilizables;
- politicas de `shopStatus` implementadas y testeadas.

Lo que todavia no esta cerrado:

- integracion de `processPayment()` en flujo real de checkout;
- pago manual por token firmado en superficie publica;
- sitemap con productos/categorias reales (hoy es estatico);
- paginas institucionales equivalentes al legacy;
- resolucion final de `not-found`/errores segun politica;
- cobertura de tests de checkout/pagos/confirmacion.

## 2) Evidencia tecnica de pendientes

### 2.1 Pagos

- `processPayment` existe como fetcher, pero no se invoca en la action de checkout.
- `StorefrontManualPaymentRequest` y `StorefrontManualPaymentResult` siguen como `Record<string, unknown>`.
- checkout actual crea orden y redirige a confirmacion por token; no hay tramo de pago integrado.

### 2.2 SEO

- `sitemap` solo publica `/` y `/catalogo`.
- hay TODO explicito para incluir URLs reales de categorias/productos.

### 2.3 UX/rutas

- faltan rutas institucionales del legacy (`/contacto`, `/sobre-nosotros`, etc.).
- `app/not-found.tsx` tiene TODO para conectar con politica real de tenant/shopStatus.

### 2.4 QA

- hay tests de policy/seo-reglas/headers/host/theme-modules;
- faltan tests de server actions de checkout, confirmacion, manual payment y sitemap dinamico.

## 3) Objetivo de esta integracion

Dejar el storefront en estado "listo para validacion pre-corte", sin inventar contratos backend:

1. checkout completo hasta pago (automatico o manual por token) cuando el contrato lo permita;
2. confirmacion final consistente con estado de pago real;
3. SEO/sitemap con rutas indexables reales por tenant;
4. rutas institucionales minimas para equiparar legacy;
5. cobertura de tests de los flujos nuevos.

## 4) Reglas no negociables

- NO inventar contratos backend.
- NO recalcular reglas comerciales del ERP (stock, precio, disponibilidad).
- tenancy siempre por `host`; cache keyada por `host`.
- respetar politica `shopStatus` documentada.
- checkout/confirmacion fuera de indexacion.
- si falta contrato, dejar TODO explicito + fallback seguro, sin suposiciones ocultas.

## 5) Backlog priorizado para Kimi

## P0 - Cerrar contrato y flujo de pagos

1. Verificar contrato fuente de verdad en backend (`/docs/storefront-platform` del repo principal) para:
- `POST /api/storefront/v1/payments/process`
- `POST /api/storefront/v1/orders/:token/payment/manual`
- shape final de `paymentData`, request/response y estados de pago.

2. Reemplazar tipos `unknown`/`Record<string, unknown>` por interfaces estrictas donde ya haya contrato confirmado.

3. Extender checkout action para soportar estrategia de pago:
- crear orden (`postCheckout`);
- si corresponde pago automatico: ejecutar `processPayment` con payload validado;
- si corresponde pago manual: usar token firmado + endpoint manual documentado;
- manejar errores funcionales con mensajes de usuario claros, sin exponer internals.

4. Actualizar UI de checkout/confirmacion para mostrar:
- estado de orden;
- estado de pago (pendiente/acreditado/rechazado/en_revision, etc. segun contrato real);
- siguiente accion segura cuando aplique (ejemplo: iniciar pago manual por token).

Archivos esperables (orientativo):
- `app/(storefront)/checkout/actions.ts`
- `components/storefront/checkout/checkout-form.tsx`
- `components/storefront/checkout/confirmation-summary.tsx`
- `lib/types/storefront.ts`
- `lib/fetchers/checkout.ts`
- `lib/fetchers/orders.ts`

## P1 - SEO indexable real

1. Implementar sitemap tenant-aware con URLs reales:
- base (`/`, `/catalogo`);
- categorias publicas indexables;
- productos publicos indexables por slug.

2. Mantener guardas:
- solo si `snapshot.indexable && snapshot.sitemapEnabled`;
- excluir checkout/confirmacion;
- no indexar superficies bloqueadas por `shopStatus`.

3. Agregar tests para reglas de inclusion/exclusion del sitemap.

Archivos esperables:
- `lib/seo/sitemap.ts`
- `app/sitemap.ts`
- `tests/seo/*`

## P1 - Rutas institucionales minimas (paridad legacy inicial)

Crear rutas App Router con fallback seguro y metadata tenant-aware:

- `/contacto`
- `/sobre-nosotros`
- `/envios-y-entregas`
- `/medios-de-pago`
- `/garantia`
- `/preguntas-frecuentes`
- `/privacidad`
- `/terminos`
- `/sucursales`
- `/mayoristas`
- `/trabajos`

Regla de contenido:
- usar datos de `bootstrap`/modulos si existen;
- si no existe bloque backend: fallback visible + TODO documentado.

Archivos esperables:
- `app/(storefront)/*/page.tsx`
- componentes reutilizables para paginas institucionales;
- actualización de navegación si corresponde.

## P2 - Hardening de errores / not-found

1. Reemplazar TODO de `app/not-found.tsx` conectando:
- tenant inexistente;
- `shopStatus=disabled`;
- errores de backend mapeables a superficie no publica.

2. Definir politica consistente:
- cuando mostrar state card;
- cuando devolver `notFound()`;
- cuando mostrar error recuperable.

3. Agregar tests unitarios de politica de errores/superficies.

## P2 - QA y validacion

Agregar o ampliar tests para:

- action de checkout (validaciones, errores API, redireccion por token);
- flujos de pago (`processPayment` y manual) segun contrato;
- confirmacion por token;
- sitemap dinamico;
- metadata `noIndex` en checkout/confirmacion;
- tenancy/cache tags por host en nuevos fetchers.

## 6) Criterios de aceptacion (Definition Of Done)

Se considera completado cuando:

1. `npm run typecheck` pasa.
2. `npm run build` pasa.
3. `npm test` pasa.
4. No quedan TODOs criticos en flujo de pago (excepto bloqueos reales de contrato no disponible).
5. Checkout puede finalizar en confirmacion con estado de pago real o estado pendiente claramente informado.
6. Pago manual usa token firmado y endpoint documentado.
7. Sitemap incluye URLs reales permitidas por politica SEO.
8. Checkout/confirmacion siguen en noindex.
9. Rutas institucionales minimas existen y renderizan por tenant.
10. No se viola ninguna regla del AGENTS.md.

## 7) Entregables que debe devolver Kimi

1. Diff completo con archivos modificados.
2. Resumen por bloque (P0/P1/P2) indicando:
- que se completo;
- que quedo bloqueado por contrato faltante;
- TODOs remanentes con razon.
3. Resultado de `typecheck`, `build`, `test`.
4. Lista de riesgos abiertos y proximos pasos recomendados.

## 8) Nota operativa importante

En este entorno local puede fallar `npm ci` por conectividad al registry. Si ocurre, no ocultar el problema: reportarlo y continuar con analisis estatico + cambios de codigo verificables por inspeccion.
