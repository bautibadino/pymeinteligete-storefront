# ShopStatus Y Superficies

La politica operativa ya esta fijada en el backend y este repo debe respetarla.

## Comportamiento por superficie

- `bootstrap`: `active`, `paused`, `draft`
- `catalog`: `active`, `paused`
- `categories`: `active`, `paused`
- `product`: `active`, `paused`
- `payment-methods`: `active`, `paused`
- `checkout`: solo `active`
- `payments/process`: solo `active`
- `disabled`: bloqueado publicamente

## Implicancias de UI

- `paused` puede renderizar tienda pero no vender
- `draft` puede servir para preview o bootstrap controlado, no para checkout
- `disabled` debe comportarse como no disponible publicamente

