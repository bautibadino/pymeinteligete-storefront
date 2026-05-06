import { SocialProofMini } from "@/components/social-proof/social-proof-mini";
import type { ProductGridModule } from "@/lib/modules/product-grid";

import { ProductGridHeader } from "./shared";
import { SpotlightCarouselClient } from "./spotlight-carousel-client";

export function ProductGridSpotlightCarousel({ module }: { module: ProductGridModule }) {
  const empresaId = module.carouselMeta?.empresaId;
  const tenantSlug = module.carouselMeta?.tenantSlug;

  return (
    <section
      className="py-10 sm:py-12"
      data-template="product-grid-spotlight-carousel"
      aria-label={module.content.title}
    >
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        <div className="rounded-[1.75rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.9))] px-4 py-5 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)] sm:px-6 sm:py-7 lg:px-8">
          <ProductGridHeader
            module={module}
            mobileAccessory={
              <SocialProofMini
                empresaId={empresaId}
                tenantSlug={tenantSlug}
                className="max-w-full sm:hidden"
              />
            }
          />
          <SpotlightCarouselClient module={module} />
        </div>
      </div>
    </section>
  );
}
