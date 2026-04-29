import {
  resolvePaymentDetail,
  resolvePaymentStatusLabel,
} from "@/lib/checkout/confirmation";
import type { StorefrontOrderByTokenResult, StorefrontPaymentMethod } from "@/lib/storefront-api";

import { ManualPaymentForm } from "./manual-payment-form";

type ConfirmationSummaryProps = {
  order: StorefrontOrderByTokenResult | null;
  issue?: string | undefined;
  orderToken: string;
  paymentMethods: StorefrontPaymentMethod[];
};

function formatTotal(total: number | null | undefined): string {
  if (total === null || total === undefined) {
    return "Pendiente de backend";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(total);
}

function formatCreatedAt(createdAt: string | null | undefined): string {
  if (!createdAt) {
    return "Sin fecha informada";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

export function ConfirmationSummary({
  order,
  issue,
  orderToken,
  paymentMethods,
}: ConfirmationSummaryProps) {
  if (!order) {
    return (
      <section className="empty-state-card">
        <h3>No pudimos confirmar el pedido</h3>
        <p>
          {issue ??
            "La confirmación necesita un token firmado válido para consultar el estado real del pedido."}
        </p>
      </section>
    );
  }

  const showManualPayment = !order.isPaid && paymentMethods.length > 0;

  return (
    <section className="confirmation-summary">
      <div className="confirmation-hero">
        <span className="eyebrow">{order.isPaid ? "Pago registrado" : "Orden registrada"}</span>
        <h3>
          {order.isPaid
            ? "Tu pago ya figura acreditado para esta orden."
            : "La orden quedó creada y ya podés seguir el estado desde esta confirmación."}
        </h3>
        <p>
          {order.isPaid
            ? "Esta vista refleja el estado actual informado por PyMEInteligente para tu pedido."
            : "Si todavía falta acreditar el pago, desde acá vas a ver el método disponible y las instrucciones reales devueltas por el backend."}
        </p>
      </div>

      <div className="confirmation-grid">
        <article className="confirmation-card">
          <span>Número</span>
          <strong>{order.orderNumber ?? "No devuelto"}</strong>
        </article>
        <article className="confirmation-card">
          <span>Estado</span>
          <strong>{order.status ?? "Pendiente"}</strong>
        </article>
        <article className="confirmation-card">
          <span>Total</span>
          <strong>{formatTotal(order.total)}</strong>
        </article>
        <article className="confirmation-card">
          <span>Pago</span>
          <strong>{resolvePaymentStatusLabel(order)}</strong>
        </article>
        <article className="confirmation-card">
          <span>Creada</span>
          <strong>{formatCreatedAt(order.createdAt)}</strong>
        </article>
        <article className="confirmation-card">
          <span>Contacto</span>
          <strong>{order.customer.email}</strong>
        </article>
      </div>

      <div className="confirmation-detail">
        <p>{resolvePaymentDetail(order)}</p>
      </div>

      {showManualPayment ? (
        <div className="checkout-section">
          <div className="checkout-section-header">
            <span className="eyebrow">Pago manual</span>
            <h3>Completar el pago con un método disponible</h3>
            <p>
              La orden todavía no figura como pagada. Elegí un método habilitado y, si el backend devuelve
              instrucciones, las vas a ver acá mismo para completar la operación.
            </p>
          </div>
          <ManualPaymentForm
            orderToken={orderToken}
            paymentMethods={paymentMethods}
          />
        </div>
      ) : null}
    </section>
  );
}
