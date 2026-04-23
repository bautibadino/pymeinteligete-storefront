import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

export function resolvePaymentStatusLabel(order: StorefrontOrderByTokenResult): string {
  if (order.isPaid) {
    return "Acreditado";
  }

  const orderStatus = order.status;

  if (!orderStatus) {
    return "Pendiente";
  }

  const normalized = orderStatus.toLowerCase();

  if (normalized === "pending" || normalized === "pendiente") {
    return "Pendiente";
  }

  if (normalized === "in_process" || normalized === "en_proceso" || normalized === "en_revision") {
    return "En revisión";
  }

  if (normalized === "rejected" || normalized === "rechazado") {
    return "Rechazado";
  }

  if (normalized === "approved" || normalized === "acreditado" || normalized === "confirmado") {
    return "Acreditado";
  }

  return orderStatus;
}

export function resolvePaymentDetail(order: StorefrontOrderByTokenResult): string {
  const parts: string[] = [];

  if (order.payment?.provider) {
    parts.push(`Proveedor: ${order.payment.provider}`);
  }

  if (order.payment?.reference) {
    parts.push(`Referencia: ${order.payment.reference}`);
  }

  return parts.join(" · ") || "Sin detalle de pago aún.";
}
