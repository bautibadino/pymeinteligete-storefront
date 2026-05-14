# Blueprint De Rutas Y Fetchers

## Estructura sugerida

- `app/`
- `app/(storefront)/`
- `app/api/` solo si hiciera falta algun proxy local muy puntual
- `lib/api/`
- `lib/storefront/`
- `components/storefront/`
- `components/seo/`
- `tests/`

## Fetchers minimos

- `getBootstrap(host)`
- `getCatalog(host, searchParams)`
- `getCategories(host)`
- `getProduct(host, slug)`
- `getPaymentMethods(host)`
- `postCheckout(host, payload)`
- `getOrderByToken(host, token)`
- `postManualPayment(host, token, payload)`

## Reglas de implementacion

- preferir fetch server-side
- centralizar headers comunes
- keyar cache por `host`
- no dispersar el contrato por toda la app
- en `catalog v2`, usar una revalidación alineada al índice materializado, no al cache genérico diario
- si cambia la semántica de stock/disponibilidad del índice, cortar el namespace de cache de `catalog v2` para evitar snapshots stale persistidos
