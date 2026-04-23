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
  paymentMethods: StorefrontPaymentMethod[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="checkout-submit" type="submit" disabled={pending}>
      {pending ? "Iniciando pago manual..." : "Iniciar pago manual"}
    </button>
  );
}

export function ManualPaymentForm({ orderToken, paymentMethods }: ManualPaymentFormProps) {
  const [state, formAction] = useActionState(
    submitManualPaymentAction,
    initialManualPaymentActionState,
  );

  if (state.status === "success") {
    return (
      <section className="empty-state-card">
        <h3>Pago manual iniciado</h3>
        <p>{state.message}</p>
      </section>
    );
  }

  return (
    <form className="checkout-form" action={formAction}>
      <input type="hidden" name="orderToken" value={orderToken} />

      <div className="form-grid">
        <label className="form-field form-field-full">
          <span>Método de pago</span>
          <select name="methodId" defaultValue="">
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
