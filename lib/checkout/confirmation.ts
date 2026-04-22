import type { StorefrontOrderByTokenResult } from "@/lib/storefront-api";

export function resolvePaymentStatusLabel(order: StorefrontOrderByTokenResult): string {
  if (order.isPaid) {
    return "Acreditado";
  }

  const paymentStatus = order.payment?.status;

  if (!paymentStatus) {
    return "Pendiente";
  }

  const normalized = paymentStatus.toLowerCase();

  if (normalized === "pending" || normalized === "pendiente") {
    return "Pendiente";
  }

  if (normalized === "in_process" || normalized === "en_proceso" || normalized === "en_revision") {
    return "En revisión";
  }

  if (normalized === "rejected" || normalized === "rechazado") {
    return "Rechazado";
  }

  if (normalized === "approved" || normalized === "acreditado") {
    return "Acreditado";
  }

  return paymentStatus;
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
