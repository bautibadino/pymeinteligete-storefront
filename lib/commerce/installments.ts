import type { StorefrontBootstrap } from "@/lib/types/storefront";

type CommerceBootstrap = Pick<StorefrontBootstrap, "commerce"> | null | undefined;

export function getStorefrontInstallmentsCount(
  bootstrap: CommerceBootstrap,
): number | undefined {
  const installmentsConfig = bootstrap?.commerce?.payment.installments;
  const visibleMethods = bootstrap?.commerce?.payment.visibleMethods ?? [];
  const mercadoPagoEnabled =
    visibleMethods.includes("mercadopago");
  const count =
    mercadoPagoEnabled &&
    installmentsConfig?.enabled &&
    typeof installmentsConfig.count === "number"
      ? installmentsConfig.count
      : undefined;

  return count && count >= 2 ? count : undefined;
}

export function getStorefrontInstallmentsLabel(
  bootstrap: CommerceBootstrap,
): string | undefined {
  const count = getStorefrontInstallmentsCount(bootstrap);

  if (!count) {
    return undefined;
  }

  const configuredLabel = bootstrap?.commerce?.payment.installments?.label?.trim();

  return configuredLabel || `Hasta ${count} cuotas sin interés`;
}
