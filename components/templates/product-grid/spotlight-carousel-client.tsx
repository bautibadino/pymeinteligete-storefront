"use client";

import { CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { OffsetCarousel } from "@/components/ui/offset-carousel";
import { SocialProofMini } from "@/components/social-proof/social-proof-mini";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import { resolveProductCardTemplate } from "@/lib/templates/product-card-registry";

import { ProductGridEmptyState } from "./shared";

export function SpotlightCarouselClient({ module }: { module: ProductGridModule }) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);
  const products = module.products ?? [];
  const installmentsLabel = module.carouselMeta?.installmentsLabel;
  const empresaId = module.carouselMeta?.empresaId;
  const tenantSlug = module.carouselMeta?.tenantSlug;

  if (products.length === 0) {
    return <ProductGridEmptyState />;
  }

  return (
    <div className="relative">
      <OffsetCarousel
        ariaLabel="Productos destacados"
        items={products}
        getItemKey={(product) => product.id}
        itemWidth="clamp(16rem, 26vw, 23rem)"
        peek="1.25rem"
        gap="1rem"
        scaleStep={0.08}
        opacityStep={0.45}
        maxVisibleOffset={2}
        showDots
        dotsLabel="Posición de productos destacados"
        footerStart={
          <SocialProofMini
            empresaId={empresaId}
            tenantSlug={tenantSlug}
            className="hidden max-w-full sm:inline-flex"
          />
        }
        footerEnd={
          installmentsLabel ? (
            <Badge
              variant="success"
              className="w-full justify-center text-center leading-tight whitespace-normal border border-emerald-200/80 bg-emerald-50/90 px-3 py-1 text-[11px] font-medium normal-case tracking-normal text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:w-auto"
            >
              <CreditCard className="size-3.5 text-emerald-700" aria-hidden="true" />
              {installmentsLabel}
            </Badge>
          ) : null
        }
        footerClassName="gap-4"
        viewportClassName="pb-0"
        trackClassName="pb-2"
        renderItem={({ item, index, offset, isActive }) => (
          <div
            className={isActive ? "rounded-[1.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.13)]" : "rounded-[1.5rem] shadow-none"}
            data-carousel-index={index}
            data-carousel-offset={offset}
          >
            <ProductCard product={item} displayOptions={cardDisplayOptions} />
          </div>
        )}
      />
    </div>
  );
}
