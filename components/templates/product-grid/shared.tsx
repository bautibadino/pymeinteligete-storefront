import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";
import type { ProductGridModule } from "@/lib/modules/product-grid";
import {
  resolveProductCardTemplate,
} from "@/lib/templates/product-card-registry";
import type { ProductCardData } from "@/lib/templates/product-card-catalog";

/**
 * TODO (V1 — mock data):
 * Reemplazar por fetch real a `/api/storefront/v1/products` cuando la capa
 * de datos esté cableada. El source del módulo (`collection`, `category`,
 * `handpicked`, `featured`, `newest`) debe resolverse en el server y pasarse
 * como `products[]` al componente, o hacerse un fetch client-side con SWR.
 */
export const MOCK_PRODUCTS: ProductCardData[] = [
  {
    id: "mock-prod-1",
    name: "Lubricante Sintético 5W-30 SN Plus",
    slug: "lubricante-sintetico-5w30",
    brand: "Shell",
    price: { amount: 28500, currency: "ARS", formatted: "$28.500" },
    compareAtPrice: { amount: 32000, formatted: "$32.000" },
    installments: { count: 6, amount: 4750, formatted: "$4.750", interestFree: true },
    cashDiscount: { percent: 20, formatted: "20% OFF" },
    badges: [{ label: "Top", tone: "accent" }, { label: "Despacho Inmediato", tone: "success" }],
    stock: { available: true, label: "Despacho Inmediato" },
    href: "/product/lubricante-sintetico-5w30",
  },
  {
    id: "mock-prod-2",
    name: "Filtro de Aceite Mahle Original",
    slug: "filtro-aceite-mahle",
    brand: "Mahle",
    price: { amount: 8900, currency: "ARS", formatted: "$8.900" },
    stock: { available: true, label: "En stock" },
    href: "/product/filtro-aceite-mahle",
  },
  {
    id: "mock-prod-3",
    name: "Neumático Michelin Primacy 4 205/55 R16",
    slug: "neumatico-michelin-primacy-4",
    brand: "Michelin",
    price: { amount: 124500, currency: "ARS", formatted: "$124.500" },
    installments: { count: 12, amount: 10375, formatted: "$10.375", interestFree: false },
    badges: [{ label: "Nuevo", tone: "info" }],
    stock: { available: true, label: "Despacho Inmediato" },
    href: "/product/neumatico-michelin-primacy-4",
  },
  {
    id: "mock-prod-4",
    name: "Batería Bosch S4 12V 60Ah",
    slug: "bateria-bosch-s4",
    brand: "Bosch",
    price: { amount: 78500, currency: "ARS", formatted: "$78.500" },
    compareAtPrice: { amount: 92000, formatted: "$92.000" },
    cashDiscount: { percent: 15, formatted: "15% OFF" },
    stock: { available: false, label: "Sin stock" },
    href: "/product/bateria-bosch-s4",
  },
  {
    id: "mock-prod-5",
    name: "Pastillas de Freno Brembo Delanteras",
    slug: "pastillas-freno-brembo",
    brand: "Brembo",
    price: { amount: 45600, currency: "ARS", formatted: "$45.600" },
    installments: { count: 3, amount: 15200, formatted: "$15.200", interestFree: true },
    badges: [{ label: "Oferta", tone: "warning" }],
    stock: { available: true, label: "En stock" },
    href: "/product/pastillas-freno-brembo",
  },
  {
    id: "mock-prod-6",
    name: "Amortiguador Monroe OESpectrum",
    slug: "amortiguador-monroe",
    brand: "Monroe",
    price: { amount: 38900, currency: "ARS", formatted: "$38.900" },
    stock: { available: true, label: "Despacho Inmediato" },
    href: "/product/amortiguador-monroe",
  },
];

export interface ProductGridHeaderProps {
  module: ProductGridModule;
}

export function ProductGridHeader({ module }: ProductGridHeaderProps) {
  const { title, subtitle, showViewAllLink, viewAllHref, viewAllLabel } = module.content;

  if (!title && !subtitle) return null;

  return (
    <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        {title ? (
          <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="mt-1 text-base text-muted md:text-lg">{subtitle}</p>
        ) : null}
      </div>

      {showViewAllLink && viewAllHref ? (
        <Button asChild variant="link" className="self-start md:self-auto">
          <Link href={viewAllHref as Route}>{viewAllLabel || "Ver todo"}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export interface ProductGridListProps {
  module: ProductGridModule;
}

export function ProductGridList({ module }: ProductGridListProps) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);

  // En V1 usamos mock data. TODO: reemplazar por datos reales del source.
  const products = MOCK_PRODUCTS.slice(0, module.content.limit ?? 12);

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} displayOptions={cardDisplayOptions} />
      ))}
    </>
  );
}
