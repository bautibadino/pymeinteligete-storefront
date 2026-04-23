export function resolvePaymentMethodOptionValue(method: {
  methodId?: string | null;
}): string {
  return method.methodId ?? "";
}
