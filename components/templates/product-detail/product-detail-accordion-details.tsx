import type { ProductDetailModule } from "@/lib/modules/product-detail";
import { ProductImageGallery } from "@/components/templates/product-detail/product-detail-showcase-client";
import {
  ProductDetailBreadcrumbs,
  ProductDetailEmptyState,
  ProductDetailPurchaseCard,
  ProductDetailShell,
  productDetailCardClassName,
  productDetailInnerPanelClassName,
  resolveProductDetailCommercialData,
} from "@/components/templates/product-detail/product-detail-primitives";
import { cn } from "@/lib/utils/cn";

/**
 * ProductDetail Accordion Details — galería izquierda + descripción + acordeones.
 * Ideal para productos con políticas extensas o múltiples secciones de información.
 *
 * Los datos del producto vienen de `module.product` (mock o fetch real).
 * TODO: reemplazar por fetch server-side desde la API del producto.
 */
export function ProductDetailAccordionDetails({ module }: { module: ProductDetailModule }) {
  const { content, product } = module;
  const { accordionSections = [], showBreadcrumbs = true } = content;

  if (!product) {
    return <ProductDetailEmptyState />;
  }

  const mainImage = product.images[0];
  const commercialData = resolveProductDetailCommercialData(content);

  return (
    <ProductDetailShell>
      <div data-template="product-detail-accordion-details" className="grid gap-6">
        {showBreadcrumbs ? <ProductDetailBreadcrumbs productName={product.name} /> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:items-start">
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <ProductDetailPurchaseCard
              product={product}
              mainImage={mainImage}
              description={product.description}
              commercialData={commercialData}
            />
          </div>

          <div className="order-2 lg:order-1">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
              aspectClassName="aspect-[4/5] md:aspect-square"
            />
          </div>
        </div>

        {accordionSections.length > 0 ? (
          <div className={productDetailCardClassName("grid gap-2 p-4 md:p-5")}>
            {accordionSections.map((section, index) => (
              <details
                key={`${section.title}-${index}`}
                name={`accordion-${module.id}`}
                className={cn(
                  productDetailInnerPanelClassName("group px-4 py-4"),
                  "open:bg-white/[0.06]",
                )}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-white/86 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                  <span>{section.title}</span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-white/44 transition-transform duration-200 group-open:rotate-180"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-[68ch] text-sm leading-7 text-white/68 md:text-base">
                  {section.body}
                </p>
              </details>
            ))}
          </div>
        ) : null}
      </div>
    </ProductDetailShell>
  );
}
