# Contrato Con PyMEInteligente

## Base URL

El frontend externo consume el backend principal por HTTP.

Variable esperada:

- `PYME_API_BASE_URL`

## Headers base

- `x-storefront-host`
- `x-storefront-version`
- `x-request-id`

## Rutas publicas esperadas

- `GET /api/storefront/v1/bootstrap`
- `GET /api/storefront/v1/catalog`
- `GET /api/storefront/v1/categories`
- `GET /api/storefront/v1/products/:slug`
- `GET /api/storefront/v1/payment-methods`
- `POST /api/storefront/v1/checkout`
- `POST /api/storefront/v1/payments/process`
- `GET /api/storefront/v1/orders/:token`
- `POST /api/storefront/v1/orders/:token/payment/manual`

## Regla de seguridad

El header `x-storefront-host` no es autenticacion. Es contexto de tenant.

La autenticacion cambia segun el caso:

- lectura publica: host
- recursos puntuales: token firmado
- admin ERP: sesion/JWT del backend principal

