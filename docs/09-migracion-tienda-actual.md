# Migracion De La Tienda Actual

Este documento define como migrar la unica tienda embebida hoy en `PyMEInteligente` hacia este repo externo sin cortar ventas ni romper SEO.

## Punto de partida

El shop actual vive en:

- `/Users/bautistabadino/Desktop/repositorios/pymeinteligente/app/(shop)`

Superficies actuales detectadas:

- home
- catalogo
- producto
- carrito
- checkout
- confirmaciones de checkout
- paginas institucionales: contacto, sobre nosotros, garantia, privacidad, terminos, preguntas frecuentes, envios, medios de pago, mayoristas, sucursales, trabajos

## Regla De Migracion

No se borra el shop legacy al principio.

Primero se levanta el storefront externo en paralelo, se valida contra el backend real, y recien despues se decide el cambio de dominio/canonical.

## Fase 1: espejo funcional minimo

Objetivo:

- home por host
- catalogo
- producto
- SEO base
- checkout con `postCheckout`
- confirmacion por `orderToken`

Criterio de salida:

- `npm run typecheck`
- `npm run build`
- tests unitarios de policy/SEO/fetch helpers
- smoke test manual contra `PYME_API_BASE_URL`

## Fase 2: migrar contenido institucional

Crear equivalentes externos para:

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

Estas paginas deben tomar contenido desde `bootstrap`, modulos publicos o configuracion de tenant. Si el backend todavia no expone un bloque, se deja fallback seguro y TODO.

## Fase 3: comparacion con legacy

Comparar legacy vs externo:

- rutas disponibles
- metadata
- canonical
- sitemap
- robots
- productos visibles
- metodos de pago visibles
- checkout y confirmacion

No se cambia dominio hasta que catalogo, producto y checkout pasen el smoke test.

## Fase 4: corte controlado

Orden recomendado:

1. apuntar dominio o subdominio staging al storefront externo
2. validar `x-storefront-host` contra el tenant real
3. generar sitemap externo
4. revisar canonical
5. hacer prueba de checkout real en DEV
6. cambiar dominio publico
7. monitorear errores de backend y conversiones

## Fase 5: limpieza del shop legacy

Solo despues del corte estable:

- congelar `app/(shop)` en modo mantenimiento
- dejar redirects si corresponde
- remover UI legacy por etapas
- mantener endpoints backend `/api/storefront/v1/*`

## Riesgos

- carrito legacy no existe todavia como contrato persistente en este repo
- `processPayment` sigue pendiente hasta cerrar payload seguro de proveedor
- contenido institucional puede necesitar nuevos campos publicos en `bootstrap`
- cualquier cambio de canonical debe hacerse una sola vez y con validacion SEO

