# Contexto Y Objetivo

Este repo va a reemplazar gradualmente al shop embebido en el repo principal.

La idea no es migrar logica de negocio fuera de `PyMEInteligente`, sino separar la app publica para ganar:

- despliegue independiente
- SEO independiente por tenant
- mejor velocidad de iteracion del frontend
- menor acoplamiento con la UI interna del ERP

## Regla madre

`PyMEInteligente` sigue siendo la fuente de verdad.

El storefront externo:

- consume bootstrap
- muestra catalogo
- arma la intencion de compra
- delega checkout, pagos y estado de pedido en el backend

## Meta inicial

Levantar una primera version funcional que cubra:

- home
- catalogo
- detalle de producto
- checkout
- confirmacion/seguimiento por token

