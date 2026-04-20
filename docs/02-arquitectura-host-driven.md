# Arquitectura Host-Driven

## Modelo

Una sola app storefront sirve a muchas empresas.

El tenant se resuelve por dominio o subdominio:

`host -> tenantSlug -> empresaId -> shopStatus -> bootstrap -> render`

## Flujo base

1. entra una request con un `host`
2. el storefront lee ese `host`
3. llama al backend con `x-storefront-host`
4. el backend devuelve bootstrap y datos del tenant
5. la UI renderiza branding, SEO, catalogo y navegacion para ese tenant

## Consecuencias

- no hay configuracion global hardcodeada por empresa
- no se usa `EMPRESA_ID` local para decidir tenant publico
- los caches deben variar por `host`
- `canonical`, `robots` y `sitemap` deben depender del tenant actual

