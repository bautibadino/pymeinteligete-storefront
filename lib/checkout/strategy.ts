export function resolveCheckoutStrategy(
  paymentStrategy: string,
): { allowed: true } | { allowed: false; message: string } {
  if (paymentStrategy === "auto") {
    return {
      allowed: false,
      message:
        "La estrategia de pago automático todavía no está habilitada porque falta la integración con el proveedor de pagos. Usá 'Pago manual' o 'Solo crear orden'.",
    };
  }

  return { allowed: true };
}
