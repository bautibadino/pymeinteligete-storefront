import type { Metadata } from "next";

import { StorefrontCartPageContent } from "@/components/storefront/cart/storefront-cart-page-content";
import { loadCheckoutExperience } from "@/app/(storefront)/_lib/storefront-shell-data";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/carrito",
    title: `${snapshot.title} | Carrito`,
    noIndex: true,
  });
}

export default async function CartPage() {
  const experience = await loadCheckoutExperience();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          Tu carrito
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Revisá los productos antes de avanzar al checkout.
        </p>
      </header>

      <StorefrontCartPageContent paymentMethods={experience.paymentMethods} />
    </main>
  );
}
