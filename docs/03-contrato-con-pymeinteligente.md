# Contrato Con PyMEInteligente

## Base URL

El frontend externo consume el backend principal por HTTP.

Variable esperada:

- `PYME_API_BASE_URL`

## Headers base

- `x-storefront-host`
- `x-storefront-version`
- `x-request-id`

## Rutas publicas storefront

- `GET /`
- `GET /catalogo`
- `GET /catalogo/:slug`
- `GET /producto/:slug`
- `GET /checkout`
- `GET /orden/:token`

## Endpoints API esperados

- `GET /api/storefront/v1/bootstrap`
- `GET /api/storefront/v1/catalog`
- `GET /api/storefront/v1/categories`
- `GET /api/storefront/v1/products/:slug`
- `GET /api/storefront/v1/payment-methods`
- `POST /api/storefront/v1/cart/validate`
- `POST /api/storefront/v1/shipping/quote`
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

## Validación de carrito previa al checkout

`POST /api/storefront/v1/cart/validate` es la fuente efectiva de precio y consistencia antes de crear la orden.

Request canónico:

```json
{
  "items": [
    {
      "productId": "prod_1",
      "quantity": 2
    }
  ]
}
```

Response canónico:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "prod_1",
        "name": "Mate Imperial",
        "price": 10000,
        "priceWithTax": 12100,
        "requestedQuantity": 2,
        "availableStock": 10,
        "isValid": true
      }
    ],
    "isValid": true,
    "warnings": [],
    "summary": {
      "itemCount": 1,
      "subtotal": 20000,
      "taxAmount": 4200,
      "total": 24200
    }
  }
}
```

Boundary operativo en el storefront externo:

- el frontend no recalcula pricing de negocio ni recompone `summary`
- `items[].price` y `items[].priceWithTax` sólo se usan como datos ya resueltos por backend
- `summary.total` es el monto efectivo de productos previo a envío/descuentos de checkout
- `summary.subtotal` y `summary.taxAmount` pueden mostrarse en UI como desglose, pero no se recomputan
- el checkout puede hacer una validación server-side puntual al render y debe revalidar al submit
- no se agrega polling para refrescar precios o stock
- si `isValid=false`, el storefront frena la continuación y muestra `warnings`

## Cotización de envíos en producto

La PDP del storefront externo consume `POST /api/storefront/v1/shipping/quote` contra esta misma app externa. Esa ruta local proxya al backend principal y mantiene los headers obligatorios de tenancy: `x-storefront-host`, `x-storefront-version` y `x-request-id`.

El código postal del comprador se persiste únicamente en `localStorage` con la key `pymeinteligente.storefront.shipping.postalCode.v1`. No se escribe en la base del ERP desde el storefront.

Request canónico:

```json
{
  "destinationPostalCode": "5800",
  "packages": [
    {
      "declaredValue": 120000,
      "volumeCm3": 9000,
      "weightKg": 5
    }
  ]
}
```

Response canónico:

```json
{
  "success": true,
  "data": {
    "contractVersion": "storefront.shipping.quote.v1",
    "provider": "andreani",
    "available": true,
    "currency": "ARS",
    "destinationPostalCode": "5800",
    "originPostalCode": "5000",
    "quotedAt": "2026-05-06T12:00:00.000Z",
    "expiresAt": "2026-05-06T12:30:00.000Z",
    "options": [
      {
        "optionId": "andreani:400000000:standard",
        "carrierName": "Andreani",
        "serviceName": "Estándar",
        "priceWithTax": 15971.25,
        "priceWithoutTax": 13200,
        "billableWeightKg": 5,
        "checkoutSnapshot": {
          "provider": "andreani",
          "optionId": "andreani:400000000:standard",
          "carrierName": "Andreani",
          "serviceName": "Estándar",
          "priceWithTax": 15971.25,
          "priceWithoutTax": 13200,
          "currency": "ARS",
          "destinationPostalCode": "5800",
          "originPostalCode": "5000",
          "quotedAt": "2026-05-06T12:00:00.000Z",
          "expiresAt": "2026-05-06T12:30:00.000Z"
        }
      }
    ]
  }
}
```

Campos canónicos para el storefront externo:

- `options[].optionId`: identificador estable de la opción cotizada.
- `options[].carrierName`: transportista visible para el comprador.
- `options[].serviceName`: servicio/opción visible para el comprador.
- `options[].priceWithTax`: costo final que se muestra en UI.
- `currency`: moneda de todas las opciones.
- `checkoutSnapshot`: snapshot inmutable que deberá viajar al checkout en una fase siguiente cuando se implemente selección de envío.

Alcance actual:

- La PDP solo muestra opciones y costos.
- El carrito permite cotizar por código postal, seleccionar una opción y sumar el costo al total estimado.
- La opción elegida se guarda en `localStorage` como snapshot bajo `pymeinteligente.storefront.shipping.selectedOption.v1`.
- El envío del snapshot seleccionado al checkout/backend de orden queda preparado por contrato, pero todavía no está implementado en `POST /api/storefront/v1/checkout`.
- La creación de envío, etiquetas y tracking siguen siendo responsabilidad del ERP.
