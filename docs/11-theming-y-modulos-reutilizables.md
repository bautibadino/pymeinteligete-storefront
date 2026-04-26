# Theming Y Módulos Reutilizables

## Objetivo

Una empresa obtiene una experiencia visual distinta combinando:

- `presentation.theme` en el `bootstrap` como fuente visual principal
- `branding + theme legacy` como fallback de compatibilidad
- `bootstrap.modules`
- datos públicos ya existentes: catálogo, categorías, contacto, SEO y métodos de pago

La app no debe crear componentes por empresa. BYM, o cualquier otro tenant, entra como configuración.

## Theme

El theme efectivo se resuelve en `lib/theme/resolve-tenant-theme.ts`.

Precedencia:

1. Preview con token: el backend debe devolver `bootstrap.presentation.theme` correspondiente a `presentation.draft`.
2. Producción: el backend debe devolver `bootstrap.presentation.theme` correspondiente a `presentation.published`.
3. Si no hay `presentation`, el storefront usa `bootstrap.theme.preset` si coincide con presets conocidos y aplica overrides desde `bootstrap.branding.colors.primary/accent` y `bootstrap.branding.typography.heading/body`.
4. Si el preset falta o es desconocido, el fallback seguro es `industrialWarm`.

El backend puede enviar:

```json
{
  "presentation": {
    "theme": {
      "preset": "industrialWarm",
      "overrides": {
        "accent": "#8c4319",
        "moduleAccent": "#1f5967",
        "fontHeading": "\"Iowan Old Style\", serif",
        "radiusMd": "18px"
      }
    }
  }
}
```

Presets iniciales:

- `industrialWarm`: talleres, ferretería, industria liviana, servicios técnicos.
- `minimalClean`: tiendas sobrias, catálogo limpio y navegación directa.
- `editorialDark`: marcas con estética más curada, premium o editorial.

El preview con `?preview=<token>` se promueve a `__preview_token` y se envía al bootstrap sin cache usando `x-preview-token` para no mezclar borradores con producción.

## Módulos

El schema interno vive en `lib/modules/module-schema.ts`.

Módulos iniciales:

- `hero`
- `featuredProducts`
- `categoryRail`
- `promoBand`
- `trustBar`
- `richText`

Cada módulo soporta variantes explícitas. Por ejemplo:

- `hero`: `split`, `workshop`, `editorial`
- `featuredProducts`: `grid`, `spotlight`
- `categoryRail`: `rail`, `tiles`
- `promoBand`: `solid`, `split`
- `trustBar`: `inline`, `cards`
- `richText`: `editorial`, `compact`

`lib/modules/normalize-modules.ts` acepta aliases razonables desde el backend, normaliza a tipos estrictos y descarta módulos desconocidos. Si no hay módulos, crea una composición fallback según el preset.

## Agregar Un Módulo Nuevo

1. Agregar el tipo en `StorefrontModuleType`.
2. Definir su interfaz en `lib/modules/module-schema.ts`.
3. Agregar aliases, variante default y variantes permitidas en `normalize-modules.ts`.
4. Implementar el render en `components/modules/ModuleRenderer.tsx`.
5. Agregar estilos usando tokens CSS, no colores hardcodeados.
6. Documentar el payload público esperado.

El módulo no debe recalcular precio, stock, disponibilidad, reglas de checkout ni decisiones comerciales. Si necesita datos nuevos, primero debe existir contrato backend documentado.

## Overrides Por Tenant

Un override específico por tenant sólo debería aceptarse cuando:

- existe una necesidad comercial no representable con theme + módulos;
- la capacidad puede convertirse en variante reusable después;
- queda documentado por qué no aplica al resto de tenants.

No se permite crear `components/BYMHome.tsx`, condicionales `tenantSlug === "bym"` ni layouts duplicados por empresa en runtime productivo.

## BYM Como Ejemplo

El fixture de ejemplo vive en:

- `fixtures/dev/bym-storefront-config.example.json`

Ese archivo es documentación ejecutable para desarrollo. No es fuente productiva y no se importa desde runtime.
