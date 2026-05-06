import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Route } from "next";

import {
  canAccessCheckout,
  loadCheckoutExperience,
  resolveTenantDisplayName,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";
import { SurfaceStateCard } from "@/components/storefront/surface-state";
import { parseCheckoutItemsFromSearchParams } from "@/lib/cart/storefront-cart";
import {
  getStorefrontInstallmentsCount,
  getStorefrontInstallmentsLabel,
} from "@/lib/commerce/installments";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout",
    title: `${snapshot.title} | Checkout`,
    noIndex: true,
  });
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams;
  const experience = await loadCheckoutExperience();
  const host = experience.runtime.context.host;
  const displayName = resolveTenantDisplayName(experience.bootstrap, host);
  const initialItems = parseCheckoutItemsFromSearchParams(resolvedSearchParams);
  const canCheckout = canAccessCheckout(experience.bootstrap?.tenant.status ?? null);
  const publicKey = experience.bootstrap?.commerce.payment.publicKey;
  const installmentsLabel = getStorefrontInstallmentsLabel(experience.bootstrap);
  const installmentsCount = getStorefrontInstallmentsCount(experience.bootstrap);

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href={"/carrito" as Route}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al carrito
      </Link>
      <header className="max-w-3xl space-y-3">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
          {`Finalizá tu compra en ${displayName}`}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Revisá tu pedido, completá los datos de entrega y elegí cómo querés pagar.
        </p>
      </header>
      <SurfaceStateCard
        shopStatus={experience.bootstrap?.tenant.status ?? null}
        surface="checkout"
        title="El checkout sólo está habilitado cuando la tienda está activa."
        description="Si la tienda está en pausa, borrador o deshabilitada, frenamos la compra antes de crear una orden inconsistente."
      />

      {canCheckout ? (
        <section className="pb-8">
          <CheckoutForm
            paymentMethods={experience.paymentMethods}
            initialItems={initialItems}
            {...(publicKey ? { publicKey } : {})}
            {...(installmentsLabel ? { installmentsLabel } : {})}
            {...(installmentsCount ? { installmentsCount } : {})}
          />
        </section>
      ) : null}
    </main>
  );
}
