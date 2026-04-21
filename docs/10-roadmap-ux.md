# Roadmap UX

La base visual actual ya es usable como shell, pero todavia no debe considerarse experiencia final de tienda.

## Direccion Visual

Mantener una estetica editorial, sobria y comercial:

- tono calido
- composicion espaciosa
- foco en confianza, claridad y velocidad
- evitar templates genericos de ecommerce

## Prioridad 1: Navegacion Y Contenido

Completar rutas equivalentes al shop legacy:

- contacto
- sobre nosotros
- envios y entregas
- medios de pago
- garantia
- preguntas frecuentes
- terminos
- privacidad
- sucursales

Criterio:

- cada pagina debe depender del tenant actual
- no hardcodear contenido definitivo si el backend debe exponerlo
- usar fallback seguro y visible mientras falten modulos publicos

## Prioridad 2: Catalogo

Mejorar:

- filtros visibles
- estado vacio
- loading/error states
- tarjetas con imagen/precio/disponibilidad
- navegacion a producto

No implementar logica de disponibilidad fuera del backend.

## Prioridad 3: Producto

Mejorar:

- galeria
- ficha tecnica
- precio y disponibilidad
- CTA hacia checkout con `productId` y `quantity`
- metadata especifica por producto

## Prioridad 4: Checkout

El checkout actual crea orden oficial, pero falta:

- UX de carrito o seleccion persistente
- validaciones de formulario mas amables
- estados de carga/error mas claros
- integracion de pago cuando el contrato de `paymentData` quede cerrado

## Prioridad 5: QA Visual

Validar:

- mobile
- desktop ancho
- tiendas `active`, `paused`, `draft`, `disabled`
- ausencia de backend
- bootstrap incompleto
- productos sin imagen
- catalogo vacio

## No Hacer Todavia

- borrar el shop legacy
- inventar carrito persistente sin contrato
- inventar pagos del lado del frontend
- fijar canonical publico sin validarlo contra el dominio final

