import type { ProductCardStock } from "@/lib/templates/product-card-catalog";

type ProductPurchaseStateInput = {
  productId?: string | undefined;
  stock?: ProductCardStock | undefined;
};

export function resolveProductPurchaseState({ productId, stock }: ProductPurchaseStateInput) {
  const hasExplicitAvailability = stock !== undefined;
  const canPurchase = Boolean(productId && hasExplicitAvailability && stock?.available);
  const stockLabel = stock?.label ?? "Disponibilidad a confirmar";

  return {
    canPurchase,
    stockLabel,
  };
}
