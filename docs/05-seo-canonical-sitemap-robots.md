# SEO Canonical Sitemap Robots

Cada tenant debe tener SEO aislado.

## Reglas

- `generateMetadata()` depende del tenant actual
- `metadataBase` no puede ser global fija para todas las empresas
- `canonical` debe salir del dominio canonico del tenant
- `robots` debe depender del tenant y del entorno
- `sitemap` debe generarse por tenant
- cualquier cache de metadata o contenido debe variar por `host`

## Objetivo

Evitar que una empresa pise a otra en:

- title
- description
- canonical
- Open Graph
- sitemap
- robots

