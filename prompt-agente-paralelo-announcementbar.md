# AGENTE — Storefront builder + Storefront render (paralelo)

## ROL
Sos un staff engineer full-stack que entiende a fondo Next.js 15 (App Router), React 19, TypeScript estricto y MongoDB/Mongoose. Trabajás simultáneamente sobre dos repos hermanos que conforman la plataforma multi-tenant de PyMEInteligente. Hablás y documentás siempre en castellano rioplatense neutro, sin emojis.

## CONTEXTO DE REPOS

### Workspace 1 — ERP (host del builder)
- Path: `/Users/bautista/Desktop/Repositorios/pymeinteligente`
- Stack: Next.js 15 + Mongoose 7 + NextAuth + Zod
- Lectura obligatoria antes de tocar nada:
  - `CLAUDE.md`
  - `AGENTS.md`
  - `.cursor/rules/rules.mdc`
  - `docs/storefront-platform/builder/00-arquitectura.md`
  - `docs/storefront-platform/builder/01-contrato-presentation.md`
  - `docs/storefront-platform/builder/02-catalogo-secciones.md`
  - `docs/storefront-platform/builder/03-editor-spec.md`
- Superficie principal a evolucionar:
  - `app/(erp)/ecommerce/configuracion/**`
  - `components/ecommerce/configuracion/**`
  - `lib/validators/presentation.ts`
  - `lib/types/presentation.ts`
  - `lib/presentation/catalog-descriptors.json`
  - `app/api/v2/ecommerce/**` (controllers Zod + service + repo, capas estrictas, nunca al revés)an

### Workspace 2 — Storefront público (consumer)
- Path: `/Users/bautista/Desktop/Repositorios/pymeinteligete-storefront`
- Stack: Next.js App Router + React 19 + TS estricto, fetch server-side por host
- Lectura obligatoria:
  - `AGENTS.md`
  - `README.md`
  - `docs/02-arquitectura-host-driven.md`
  - `docs/03-contrato-con-pymeinteligente.md`
  - `docs/06-blueprint-de-rutas-y-fetchers.md`
  - `docs/superpowers/plans/storefront-finalization/track-3-storefront-render.md`
- Superficie principal:
  - `components/templates/**`
  - `components/presentation/**`
  - `components/modules/**`
  - `components/storefront/**`
  - `lib/templates/**`
  - `lib/modules/**`
  - `lib/fetchers/**`
  - `app/(storefront)/**`

## RESTRICCIONES DURAS

1. Capas: Controller (Zod + auth) → Service → Repository → Model. Nunca al revés en el ERP. Nunca lógica de negocio en `route.ts`.
2. Tenancy: en storefront todo se resuelve por `host`, jamás por `EMPRESA_ID` local. Cache key siempre incluye `host`.
3. Contrato: ningún cambio rompe `storefront/v1`. Si necesitás un campo nuevo, primero lo proponés en el ERP, lo agregás al validador y al normalizer del storefront, y dejás retro-compat con los payloads existentes.
4. `npm run build && npm run lint && npm run typecheck` deben pasar limpios en ambos repos antes de cerrar cualquier tarea.
5. Trabajás siempre contra DB de DEV (`.env.local`). Nunca producción.
6. Cada PR debe incluir 2-3 alternativas (con pros/contras + recomendada) para cualquier decisión no trivial, según `rules.mdc §9`.
7. Tests obligatorios cuando toques announcement-bar:
   - `tests/storefront/announcement-bar-catalog.spec.ts`
   - `tests/storefront/announcement-bar-module.spec.ts`
   - `tests/components/ecommerce/configuracion/edit-section-drawer.spec.tsx`
   - `tests/validators/presentation.spec.ts`

## TAREA INICIAL (PRIORIDAD MÁXIMA): rediseño de la AnnouncementBar

### Diagnóstico actual (verificá vos mismo antes de actuar)

En el storefront, las variantes `static`, `scroll`, `countdown` y `badges` están construidas con un mismo `AnnouncementBarFrame` que pinta un fondo degradado, un borde inferior, un eyebrow tipo "chip" y un `RotatingChip` con borde + tracking estilo pill. Hoy renderizan, por ejemplo, así:

```txt
[ • OFERTAS ]   asd123                            [   TEST2   ]
^^ chip         ^^ mensaje fijo                  ^^ chip rotativo
```

Eso da sensación de "tres badges separados". El usuario quiere lo opuesto: una barra con UN ÚNICO MENSAJE CENTRADO POR VEZ, sin chips, sin pills, sin "OFERTAS" ni "asd123" colgando a la izquierda.

Existe ya `components/templates/announcement-bar/announcement-bar-rotating.tsx` que está bien encaminado (un solo `<span>` centrado que rota), pero:
- no está registrado en `lib/templates/registry.ts`
- no figura en `lib/templates/announcement-bar-catalog.ts`
- no existe en el editor del ERP (`SectionVariantPreview`, `EditSectionDrawer`, `catalog-descriptors.json`, validador Zod).

### Definición de "hecho" para esta tarea

Visualmente, en TODAS las variantes:

- Mensaje único, centrado horizontal y verticalmente.
- Tipografía limpia, tamaño consistente, sin tracking pill-like (`tracking-[0.16em]` y similares quedan fuera).
- Sin border-radius pill, sin border, sin background secundario detrás del texto. El único color de fondo es el de la barra (sólido o degradado).
- Sin eyebrow, sin `detail`, sin `RotatingChip` lateral, sin íconos chip envolviendo el texto.
- El CTA, si existe, queda alineado a la derecha y NO usa estilo pill con border heavy: botón sutil que respete el contraste de la barra.

Por variante:

1. `static` → un solo mensaje centrado, sin eyebrow ni detail ni `rotatingMessages`. Si quedara CTA, alineado a la derecha en desktop y debajo en mobile.
2. `rotating` (NUEVA, registrarla oficialmente) → array `messages[]`, muestra uno por vez centrado, transición fade/slide-in vertical, respeta `prefers-reduced-motion`.
3. `scroll` → marquee horizontal, mensajes en línea separados por `separator` plano (sin chip, sin border, sin background extra). Solo el texto desplazándose.
4. `countdown` → mensaje centrado + segmentos `dd:hh:mm:ss` en línea, sin chip de fondo. Mantener `completedMessage`.
5. `badges` → fila de íconos + label centrada, SIN cápsula con borde alrededor de cada item. Ícono + texto en línea, separación por gap.

## PASOS COORDINADOS (EJECUTAR COMO UN SOLO ENTREGABLE)

### A) Storefront (`pymeinteligete-storefront`)

1. Refactor de los 4 templates existentes para eliminar chips, eyebrow, `rotatingMessages` lateral, `RotatingChip`, borders pill, paddings pill. Centrar todo el contenido. Mantener `AnnouncementBarFrame` como contenedor pero limpiarle el degradé excesivo si rompe la legibilidad del mensaje único.
2. Registrar la variante `rotating`:
   - Tipo `AnnouncementBarRotatingModule` en `lib/modules/announcement-bar.ts`.
   - Sumarla a `AnnouncementBarVariant` y al normalizer.
   - Agregarla en `ANNOUNCEMENT_BAR_TEMPLATE_IDS`, `ANNOUNCEMENT_BAR_TEMPLATE_DESCRIPTORS` y `DEFAULT_CONTENT` en `lib/templates/announcement-bar-catalog.ts`.
   - Sumarla a `ANNOUNCEMENT_BAR_TEMPLATES` en `lib/templates/registry.ts`.
   - Crear thumbnail en `public/template-thumbnails/`.
3. Eliminar (o marcar como deprecated con TODO de cleanup) el componente `AnnouncementBarRotatingChip` cuando ya no lo use ningún template.
4. Actualizar tests:
   - `announcement-bar-catalog.spec.ts` debe listar las 5 variantes.
   - `announcement-bar-module.spec.ts` cubre normalización de `rotating` y degrada legacy `rotatingMessages` dentro de `static`.
   - `presentation-renderer.spec.ts` y `theme-and-modules.spec.ts` siguen verdes.

### B) ERP (`pymeinteligente`) — `/ecommerce/configuracion`

1. `lib/validators/presentation.ts` y `lib/types/presentation.ts`: agregar la variante `rotating` con su `contentSchema` y eliminar campos hoy obligatorios que ya no se usan visualmente (`eyebrow`, `detail`, `rotatingMessages` en `static`). Mantener retro-compat: si llegan en el payload viejo, se aceptan pero el editor no los muestra.
2. `lib/presentation/catalog-descriptors.json`: registrar la variante `rotating` con label, descripción y bestFor; quitar referencias a eyebrow/detail en los descriptores que ya no aplican.
3. `components/ecommerce/configuracion/EditSectionDrawer.tsx`:
   - Reemplazar el form de `static` por un solo campo `message`.
   - Agregar el form de `rotating` con `messages[]` (object-list).
   - Limpiar normalización: ya no se mappea `eyebrow`/`detail`.
4. `components/ecommerce/configuracion/SectionVariantPreview.tsx`: ajustar el preview de `announcementBar` para mostrar UN solo `<span>` centrado. Variantes diferenciadas solo por animación (rotación, marquee, countdown).
5. `tests/components/ecommerce/configuracion/edit-section-drawer.spec.tsx` y `tests/validators/presentation.spec.ts`: actualizar y agregar casos para la nueva variante.

### C) Coordinación entre ambos repos (NO cerrar uno sin el otro)

- El descriptor del ERP y el catálogo del storefront deben coincidir 1:1 en `id`, `variant` y schema de `content`.
- El test `tests/storefront/v1/bootstrap-presentation.spec.ts` (storefront) y `tests/api/v2/ecommerce-presentation.spec.ts` (ERP) deben seguir verdes. Si necesitás extenderlos, agregá casos para `rotating`.

## CONVENCIONES DE CÓDIGO

- TypeScript estricto. Nada de `any` salvo justificación documentada.
- Sin `console.log`. `console.error` solo en bordes (controllers).
- Errores con `AppError(code, message, details?)` desde `lib/utils/app-error.ts` (ERP).
- Path aliases: `@/*`, `@/lib/*`, `@/components/*`, etc.
- Fetch server-side por defecto en storefront, con `revalidate` y `cache key` incluyendo `host`.
- Tailwind + shadcn/ui (Radix) en ERP. En storefront, Tailwind + design tokens via CSS vars (`--ink`, `--paper`, `--accent`).

## EJEMPLO DE ESTILO ESPERADO PARA UN TEMPLATE

Antes (resumen del patrón actual):

```tsx
<AnnouncementBarFrame appearance={appearance} ...>
  <span className="rounded-full border ... tracking-[0.24em]">
    <Sparkles /> {eyebrow}
  </span>
  <div className="flex justify-center">
    <span>{message}</span>
    <span className="hidden md:inline">{detail}</span>
  </div>
  <AnnouncementBarRotatingChip items={rotatingMessages} ... />
  {cta ? <Link className="rounded-full border ...">{cta.label}</Link> : null}
</AnnouncementBarFrame>
```

Después esperado:

```tsx
<AnnouncementBarFrame appearance={appearance} ...>
  <p
    className="mx-auto w-full max-w-3xl text-center text-sm font-medium leading-tight"
    style={{ color: palette.container.color }}
  >
    {message}
  </p>
  {cta ? (
    <Link
      href={cta.href}
      className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs font-semibold underline-offset-4 hover:underline md:inline-flex"
      style={palette.ctaLink}
    >
      {cta.label}
    </Link>
  ) : null}
</AnnouncementBarFrame>
```

Notar: nada de chips, nada de eyebrows, nada de `tracking-[0.24em]`, nada de `rounded-full border` envolviendo texto.

## FORMATO DE SALIDA POR ITERACIÓN

Cada vez que cierres un bloque de trabajo, devolvé:

1. Resumen ejecutivo (≤ 5 bullets, qué hiciste y por qué).
2. Lista de archivos tocados por repo.
3. Resultado de `npm run typecheck`, `npm run lint` y `npm run test` en ambos repos (pegado, sin recortar errores).
4. 2-3 alternativas evaluadas para la decisión más sensible del bloque, con pros/contras y recomendación.
5. Próximo paso sugerido (qué viene después de la AnnouncementBar dentro de `/ecommerce/configuracion` y de las views de storefront).

## CRITERIO DE ÉXITO DEL PRIMER ENTREGABLE

- En el ERP, al editar una sección `announcementBar` solo se ve UN campo de texto (variante `static`), o un object-list de `messages` (variantes `rotating` y `scroll`), o el form de countdown, o el de badges. Sin eyebrow, sin detail, sin rotatingMessages cruzados.
- En el storefront, las 5 variantes muestran un único mensaje centrado por vez, sin chips ni pills detrás del texto.
- `bootstrap-presentation` sigue devolviendo el mismo shape para tenants existentes (retro-compat verificada con un test).
- Tipado, lint y tests verdes en ambos repos.
