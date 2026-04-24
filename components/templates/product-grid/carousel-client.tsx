"use client";

import { useRef, useState, useCallback } from "react";

import {
  resolveProductCardTemplate,
} from "@/lib/templates/product-card-registry";
import { MOCK_PRODUCTS } from "./shared";
import type { ProductGridModule } from "@/lib/modules/product-grid";

export function useCarouselScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  }, [checkScroll]);

  return { scrollRef, canScrollLeft, canScrollRight, scrollBy, checkScroll };
}

export function CarouselGridList({ module }: { module: ProductGridModule }) {
  const { cardVariant, cardDisplayOptions } = module.content;
  const ProductCard = resolveProductCardTemplate(cardVariant);

  // En V1 usamos mock data. TODO: reemplazar por datos reales del source.
  const products = MOCK_PRODUCTS.slice(0, module.content.limit ?? 12);

  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-[30vw] lg:w-[22vw]"
        >
          <ProductCard product={product} displayOptions={cardDisplayOptions} />
        </div>
      ))}
    </>
  );
}
