"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialManualPaymentActionState,
  submitManualPaymentAction,
  type ManualPaymentActionState,
} from "@/app/(storefront)/checkout/actions";
import { buildManualPaymentSuccessDetails } from "@/lib/checkout/manual-payment";
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

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ManualPaymentSuccessCard({ state }: { state: ManualPaymentActionState }) {
  if (
    state.status !== "success" ||
    !state.paymentAttemptId ||
    !state.orderId ||
    !state.orderToken ||
    state.amount === undefined ||
    !state.methodDisplayName
  ) {
    return null;
  }

  const details = buildManualPaymentSuccessDetails({
    paymentAttemptId: state.paymentAttemptId,
    orderId: state.orderId,
    orderToken: state.orderToken,
    amount: state.amount,
    methodDisplayName: state.methodDisplayName,
    ...(state.instructions ? { instructions: state.instructions } : {}),
    ...(state.bankAccounts ? { bankAccounts: state.bankAccounts } : {}),
    ...(state.contactInfo ? { contactInfo: state.contactInfo } : {}),
  });

  return (
    <section className="empty-state-card">
      <h3>Pago manual iniciado</h3>
      <p>{state.message}</p>

      <div className="confirmation-grid">
        <article className="confirmation-card">
          <span>Método</span>
          <strong>{details.methodDisplayName}</strong>
        </article>
        <article className="confirmation-card">
          <span>Importe</span>
          <strong>{formatAmount(details.amount)}</strong>
        </article>
        <article className="confirmation-card">
          <span>Orden</span>
          <strong>{details.orderId}</strong>
        </article>
      </div>

      {details.instructions ? (
        <div className="confirmation-detail">
          <p>{details.instructions}</p>
        </div>
      ) : null}

      {details.bankAccounts.length > 0 ? (
        <div className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Datos para transferir</span>
            <h3>Cuentas habilitadas</h3>
          </div>

          <div className="confirmation-grid">
            {details.bankAccounts.map((account) => (
              <article
                className="confirmation-card"
                key={`${account.bank}-${account.cbu}-${account.alias ?? "sin-alias"}`}
              >
                <span>{account.bank}</span>
                <strong>{account.cbu}</strong>
                {account.alias ? <p>Alias: {account.alias}</p> : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {details.contactItems.length > 0 ? (
        <div className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Contacto</span>
            <h3>Canales para enviar tu comprobante</h3>
          </div>

          <div className="confirmation-grid">
            {details.contactItems.map((item) => (
              <article className="confirmation-card" key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ManualPaymentForm({ orderToken, paymentMethods }: ManualPaymentFormProps) {
  const [state, formAction] = useActionState(
    submitManualPaymentAction,
    initialManualPaymentActionState,
  );

  if (state.status === "success") {
    return <ManualPaymentSuccessCard state={state} />;
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
