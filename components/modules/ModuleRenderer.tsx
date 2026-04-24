import Link from "next/link";
import type { Route } from "next";

import type {
  CategoryRailModule,
  FeaturedProductsModule,
  ModuleRendererProps,
  PromoBandModule,
  RichTextModule,
  StorefrontModule,
  TrustBarModule,
} from "@/lib/modules";
import type { StorefrontCatalogProduct, StorefrontCategory } from "@/lib/storefront-api";
import { resolveHeroTemplate } from "@/lib/templates/registry";

function formatPrice(product: StorefrontCatalogProduct): string {
  const amount = product.price?.amount;
  const currency = product.price?.currency ?? "ARS";

  if (typeof amount !== "number") {
    return "Precio a confirmar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderAction(action: { label: string; href: string } | undefined, className: string) {
  if (!action) {
    return null;
  }

  return (
    <Link className={className} href={action.href as Route}>
      {action.label}
    </Link>
  );
}

// Nota: el hero ya no tiene un componente propio acá. Se resuelve
// vía `resolveHeroTemplate()` del Template Registry (ver switch en
// `renderModule`). Así podemos agregar variantes nuevas sin tocar
// este archivo.

function ProductCard({ product }: { product: StorefrontCatalogProduct }) {
  const slug = product.slug ? `/producto/${product.slug}` : "/catalogo";

  return (
    <article className="sf-product-card">
      <div className="sf-product-media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name ?? "Producto"} />
        ) : (
          <span>{product.name?.slice(0, 1).toUpperCase() ?? "P"}</span>
        )}
      </div>
      <div className="sf-product-copy">
        <span>{product.brand ?? product.category ?? "Catálogo"}</span>
        <h3>{product.name ?? "Producto sin nombre"}</h3>
        <div className="sf-product-footer">
          <strong>{formatPrice(product)}</strong>
          <Link href={slug as Route}>Ver</Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedProductsModuleView({
  module,
  products,
}: {
  module: FeaturedProductsModule;
  products: StorefrontCatalogProduct[];
}) {
  const visibleProducts = products.slice(0, module.limit);

  return (
    <section className={`sf-module sf-featured sf-featured-${module.variant}`}>
      <div className="sf-module-header">
        {module.eyebrow ? <span className="eyebrow">{module.eyebrow}</span> : null}
        <h2>{module.title}</h2>
        {module.description ? <p>{module.description}</p> : null}
      </div>

      {visibleProducts.length > 0 ? (
        <div className="sf-product-list">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.slug ?? product.productId ?? `featured-${index}`} product={product} />
          ))}
        </div>
      ) : (
        <div className="sf-empty-module">
          <h3>Productos pendientes</h3>
          <p>El módulo está configurado, pero el catálogo público no devolvió ítems para mostrar.</p>
        </div>
      )}
    </section>
  );
}

function CategoryLink({ category }: { category: StorefrontCategory }) {
  const href = category.slug ? `/catalogo?category=${encodeURIComponent(category.slug)}` : "/catalogo";

  return (
    <Link className="sf-category-tile" href={href as Route}>
      {category.imageUrl ? <img src={category.imageUrl} alt="" /> : <span aria-hidden="true" />}
      <strong>{category.name ?? category.slug ?? "Categoría"}</strong>
      {category.description ? <p>{category.description}</p> : null}
    </Link>
  );
}

function CategoryRailModuleView({
  module,
  categories,
}: {
  module: CategoryRailModule;
  categories: StorefrontCategory[];
}) {
  const visibleCategories = categories.slice(0, module.limit);

  return (
    <section className={`sf-module sf-categories sf-categories-${module.variant}`}>
      <div className="sf-module-header">
        {module.eyebrow ? <span className="eyebrow">{module.eyebrow}</span> : null}
        <h2>{module.title}</h2>
        {module.description ? <p>{module.description}</p> : null}
      </div>

      {visibleCategories.length > 0 ? (
        <div className="sf-category-list">
          {visibleCategories.map((category, index) => (
            <CategoryLink key={category.slug ?? category.categoryId ?? `category-${index}`} category={category} />
          ))}
        </div>
      ) : (
        <div className="sf-empty-module">
          <h3>Categorías pendientes</h3>
          <p>El módulo queda listo para la respuesta real de `GET /api/storefront/v1/categories`.</p>
        </div>
      )}
    </section>
  );
}

function PromoBandModuleView({ module }: { module: PromoBandModule }) {
  return (
    <section className={`sf-module sf-promo sf-promo-${module.variant}`}>
      <div>
        {module.eyebrow ? <span className="eyebrow">{module.eyebrow}</span> : null}
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </div>
      {renderAction(module.action, "primary-action")}
    </section>
  );
}

function TrustBarModuleView({ module }: { module: TrustBarModule }) {
  if (module.items.length === 0) {
    return null;
  }

  return (
    <section className={`sf-module sf-trust sf-trust-${module.variant}`}>
      {module.title || module.eyebrow ? (
        <div className="sf-module-header sf-module-header-compact">
          {module.eyebrow ? <span className="eyebrow">{module.eyebrow}</span> : null}
          {module.title ? <h2>{module.title}</h2> : null}
        </div>
      ) : null}
      <div className="sf-trust-list">
        {module.items.map((item, index) => (
          <article key={`${item.title}-${index}`} className="sf-trust-item">
            <strong>{item.title}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function RichTextModuleView({ module }: { module: RichTextModule }) {
  return (
    <section className={`sf-module sf-rich-text sf-rich-text-${module.variant}`}>
      {module.eyebrow ? <span className="eyebrow">{module.eyebrow}</span> : null}
      <h2>{module.title}</h2>
      <p>{module.body}</p>
      {renderAction(module.action, "secondary-action")}
    </section>
  );
}

// TODO: wire builder types via PresentationRenderer in Ola 3.
// New builder module types (trustBar, categoryTile, productGrid, testimonials,
// faq, richText builder, productDetail, catalogLayout, announcementBar,
// header, footer) are not yet connected to this legacy renderer.
function renderModule(module: StorefrontModule, props: ModuleRendererProps) {
  switch (module.type) {
    case "hero": {
      const HeroTemplate = resolveHeroTemplate(module.variant);
      return <HeroTemplate module={module} />;
    }
    case "featuredProducts":
      return <FeaturedProductsModuleView module={module} products={props.products ?? []} />;
    case "categoryRail":
      return <CategoryRailModuleView module={module} categories={props.categories ?? []} />;
    case "promoBand":
      return <PromoBandModuleView module={module} />;
    case "trustBar":
      return <TrustBarModuleView module={module} />;
    case "richText":
      return <RichTextModuleView module={module} />;
  }
}

export function ModuleRenderer(props: ModuleRendererProps) {
  return (
    <div className="sf-module-stack" data-theme-preset={props.theme.preset}>
      {props.modules.map((module) => (
        <div key={module.id}>{renderModule(module, props)}</div>
      ))}
    </div>
  );
}
