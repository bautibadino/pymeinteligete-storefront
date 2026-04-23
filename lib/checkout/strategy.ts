export function resolveCheckoutStrategy(
  paymentStrategy: string,
): { allowed: true } | { allowed: false; message: string } {
  // Todas las estrategias documentadas están habilitadas.
  // "auto" requiere campos de pago adicionales que se validan en buildFieldErrors.
  if (paymentStrategy === "auto") {
    return { allowed: true };
  }

  return { allowed: true };
}
