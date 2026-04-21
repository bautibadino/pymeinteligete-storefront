import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

type ConfirmationSummaryProps = {
  order: StorefrontOrderByTokenResult | null;
  issue?: string | undefined;
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

export function ConfirmationSummary({
  order,
  issue,
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

  return (
    <section className="confirmation-summary">
      <div className="confirmation-hero">
        <span className="eyebrow">Orden oficial creada</span>
        <h3>La orden ya existe en PyMEInteligente.</h3>
        <p>
          Esta confirmación consulta el estado actual del pedido usando el token firmado devuelto por
          `postCheckout()`.
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
          <strong>{order.isPaid ? "Acreditado" : "Pendiente"}</strong>
        </article>
      </div>
    </section>
  );
}
