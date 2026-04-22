export function resolvePaymentMethodOptionValue(method: {
  id?: string | null;
  code?: string | null;
}): string {
  return method.id ?? method.code ?? "";
}
