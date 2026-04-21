"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialCheckoutActionState, submitCheckoutAction, type CheckoutActionState } from "@/app/(storefront)/checkout/actions";
import type { StorefrontPaymentMethods } from "@/lib/storefront-api";

type CheckoutItemDraft = {
  key: string;
  productId: string;
  quantity: string;
};

type CheckoutFormProps = {
  paymentMethods: StorefrontPaymentMethods | null;
  initialItems?: Array<{
    productId: string;
    quantity?: number;
  }>;
};

function buildInitialItems(
  initialItems: CheckoutFormProps["initialItems"],
): CheckoutItemDraft[] {
  if (!initialItems || initialItems.length === 0) {
    return [
      {
        key: crypto.randomUUID(),
        productId: "",
        quantity: "1",
      },
    ];
  }

  return initialItems.map((item) => ({
    key: crypto.randomUUID(),
    productId: item.productId,
    quantity: String(item.quantity ?? 1),
  }));
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="checkout-submit" type="submit" disabled={pending}>
      {pending ? "Creando orden..." : "Crear orden oficial"}
    </button>
  );
}

function FieldError({ state, field }: { state: CheckoutActionState; field: keyof NonNullable<CheckoutActionState["fieldErrors"]> }) {
  const message = state.fieldErrors?.[field];

  if (!message) {
    return null;
  }

  return <span className="field-error">{message}</span>;
}

export function CheckoutForm({ paymentMethods, initialItems }: CheckoutFormProps) {
  const [state, formAction] = useActionState(submitCheckoutAction, initialCheckoutActionState);
  const [items, setItems] = useState<CheckoutItemDraft[]>(() => buildInitialItems(initialItems));
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const paymentOptions = paymentMethods?.items ?? [];

  function updateItem(index: number, patch: Partial<CheckoutItemDraft>) {
    setItems((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        productId: "",
        quantity: "1",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => (current.length > 1 ? current.filter((_, currentIndex) => currentIndex !== index) : current));
  }

  return (
    <form className="checkout-form" action={formAction}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKeyRef.current} />

      <div className="checkout-grid">
        <section className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Cliente</span>
            <h3>Datos mínimos del pedido</h3>
            <p>La validación comercial final sigue en el backend. Acá sólo pedimos lo necesario para UX.</p>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Nombre</span>
              <input name="customerName" placeholder="Juan Perez" />
              <FieldError field="customerName" state={state} />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input name="customerEmail" type="email" placeholder="juan@mail.com" />
              <FieldError field="customerEmail" state={state} />
            </label>
            <label className="form-field">
              <span>Teléfono</span>
              <input name="customerPhone" placeholder="3468555555" />
            </label>
            <label className="form-field">
              <span>DNI</span>
              <input name="customerDni" placeholder="30111222" />
            </label>
          </div>
        </section>

        <section className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Entrega</span>
            <h3>Dirección de envío</h3>
            <p>La dirección de facturación sigue opcional y pendiente de una UX más completa.</p>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Calle</span>
              <input name="shippingStreet" placeholder="Belgrano" />
              <FieldError field="shippingStreet" state={state} />
            </label>
            <label className="form-field">
              <span>Número</span>
              <input name="shippingNumber" placeholder="123" />
              <FieldError field="shippingNumber" state={state} />
            </label>
            <label className="form-field">
              <span>Ciudad</span>
              <input name="shippingCity" placeholder="Corral de Bustos" />
              <FieldError field="shippingCity" state={state} />
            </label>
            <label className="form-field">
              <span>Provincia</span>
              <input name="shippingProvince" placeholder="Cordoba" />
              <FieldError field="shippingProvince" state={state} />
            </label>
            <label className="form-field">
              <span>Código postal</span>
              <input name="shippingPostalCode" placeholder="2645" />
              <FieldError field="shippingPostalCode" state={state} />
            </label>
            <label className="form-field form-field-full">
              <span>Notas de envío</span>
              <textarea name="shippingNotes" rows={3} placeholder="Entregar por la tarde" />
            </label>
          </div>
        </section>
      </div>

      <section className="checkout-section">
        <div className="checkout-section-header checkout-section-header-inline">
          <div>
            <span className="eyebrow">Items</span>
            <h3>Líneas del pedido</h3>
            <p>
              Hasta que exista carrito persistente, esta superficie crea órdenes con líneas explícitas por
              `productId` y cantidad.
            </p>
          </div>

          <button className="line-action" type="button" onClick={addItem}>
            Agregar línea
          </button>
        </div>

        <div className="checkout-lines">
          {items.map((item, index) => (
            <div key={item.key} className="checkout-line">
              <label className="form-field form-field-grow">
                <span>Product ID</span>
                <input
                  name="itemProductId"
                  placeholder="67f123abc456def789012345"
                  value={item.productId}
                  onChange={(event) => updateItem(index, { productId: event.target.value })}
                />
              </label>

              <label className="form-field form-field-compact">
                <span>Cantidad</span>
                <input
                  name="itemQuantity"
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, { quantity: event.target.value })}
                />
              </label>

              <button
                className="line-action line-action-muted"
                type="button"
                onClick={() => removeItem(index)}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <FieldError field="items" state={state} />
      </section>

      <div className="checkout-grid">
        <section className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Pago visible</span>
            <h3>Métodos expuestos por el tenant</h3>
            <p>
              Se muestran desde `GET /payment-methods`. El procesamiento automático todavía no se activa
              porque esta fase no genera `paymentData` seguro de proveedor.
            </p>
          </div>

          {paymentOptions.length > 0 ? (
            <div className="checkout-methods">
              {paymentOptions.map((method, index) => (
                <article key={method.id ?? method.code ?? `method-${index}`} className="checkout-method">
                  <span>{method.provider ?? "provider"}</span>
                  <strong>{method.name ?? method.code ?? "Método activo"}</strong>
                  <p>{method.discountLabel ?? "Disponibilidad operativa sujeta a backend."}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="checkout-note">
              El backend no devolvió métodos visibles o todavía no congeló esta parte del payload.
            </div>
          )}
        </section>

        <section className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Notas</span>
            <h3>Contexto del pedido</h3>
            <p>
              Podés sumar una nota general. No se envían datos analíticos ni billing address extra en esta
              fase.
            </p>
          </div>

          <label className="form-field form-field-full">
            <span>Notas del pedido</span>
            <textarea name="orderNotes" rows={5} placeholder="Llamar antes de despachar" />
          </label>

          <div className="checkout-note">
            La orden oficial se crea primero. El tramo `processPayment()` queda pendiente hasta que la UI
            tenga un payload de proveedor válido.
          </div>
        </section>
      </div>

      {state.status === "error" && state.message ? (
        <div className="checkout-error-banner">{state.message}</div>
      ) : null}

      <div className="checkout-footer">
        <p>
          Al enviar este formulario se llama al backend real por `POST /api/storefront/v1/checkout` usando
          el `host` actual como contexto de tenant.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
