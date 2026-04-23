"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialManualPaymentActionState,
  submitManualPaymentAction,
  type ManualPaymentActionState,
} from "@/app/(storefront)/checkout/actions";
import { resolvePaymentMethodOptionValue } from "@/lib/checkout/payment-method-option";
import type { StorefrontPaymentMethod } from "@/lib/storefront-api";

type ManualPaymentFormProps = {
  orderToken: string;
  defaultAmount?: number | null | undefined;
  paymentMethods: StorefrontPaymentMethod[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="checkout-submit" type="submit" disabled={pending}>
      {pending ? "Registrando pago..." : "Registrar pago manual"}
    </button>
  );
}

export function ManualPaymentForm({ orderToken, defaultAmount, paymentMethods }: ManualPaymentFormProps) {
  const [state, formAction] = useActionState(
    submitManualPaymentAction,
    initialManualPaymentActionState,
  );

  if (state.status === "success") {
    return (
      <section className="empty-state-card">
        <h3>Pago registrado</h3>
        <p>{state.message}</p>
      </section>
    );
  }

  return (
    <form className="checkout-form" action={formAction}>
      <input type="hidden" name="orderToken" value={orderToken} />

      <div className="form-grid">
        <label className="form-field">
          <span>Monto</span>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={defaultAmount ?? ""}
            placeholder="15000"
          />
        </label>

        <label className="form-field">
          <span>Método de pago</span>
          <select name="paymentMethodId" defaultValue="">
            <option value="" disabled>
              Seleccionar...
            </option>
            {paymentMethods.map((method: import("@/lib/storefront-api").StorefrontPaymentMethod) => (
              <option key={method.methodId} value={resolvePaymentMethodOptionValue(method)}>
                {method.displayName ?? "Método"}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Referencia / comprobante</span>
          <input name="reference" placeholder="Transferencia #12345" />
        </label>

        <label className="form-field form-field-full">
          <span>Notas</span>
          <textarea name="notes" rows={3} placeholder="Observaciones para el operador" />
        </label>
      </div>

      {state.status === "error" && state.message ? (
        <div className="checkout-error-banner">{state.message}</div>
      ) : null}

      <div className="checkout-footer">
        <SubmitButton />
      </div>
    </form>
  );
}
