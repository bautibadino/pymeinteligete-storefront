import type { ProductGridModule } from "@/lib/modules/product-grid";
import { ProductGridHeader } from "./shared";
import { SpotlightCarouselClient } from "./spotlight-carousel-client";

export function ProductGridSpotlightCarousel({ module }: { module: ProductGridModule }) {
  return (
    <section
      className="py-12"
      data-template="product-grid-spotlight-carousel"
      aria-label={module.content.title}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] px-5 py-6 shadow-[0_32px_120px_-64px_rgba(15,23,42,0.7)] sm:px-6 sm:py-8 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-10 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl"
          />

          <ProductGridHeader module={module} />
          <SpotlightCarouselClient module={module} />
        </div>
      </div>
    </section>
  );
}
