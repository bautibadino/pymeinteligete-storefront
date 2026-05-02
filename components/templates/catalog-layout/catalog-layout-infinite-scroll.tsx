"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { CatalogLayoutModule } from "@/lib/modules/catalog-layout";
import type { ProductCardData } from "@/lib/templates/product-card-catalog";
import {
  CatalogToolbar,
  EmptyCatalogState,
  FilterBar,
  ProductGrid,
} from "./catalog-layout-shared";

type InfiniteCatalogResponse = {
  products: ProductCardData[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function mergeProducts(
  currentProducts: ProductCardData[],
  incomingProducts: ProductCardData[],
): ProductCardData[] {
  const byId = new Map(currentProducts.map((product) => [product.id, product]));

  for (const product of incomingProducts) {
    byId.set(product.id, product);
  }

  return Array.from(byId.values());
}

function resolveRouteCategorySlug(pathname: string): string | undefined {
  const normalizedPath = pathname.trim();

  if (!normalizedPath.startsWith("/catalogo/")) {
    return undefined;
  }

  const slug = normalizedPath.slice("/catalogo/".length).split("/")[0];
  return slug ? decodeURIComponent(slug) : undefined;
}

function InfiniteScrollStatus({
  errorMessage,
  hasMore,
  isLoading,
  onRetry,
  renderedCount,
  sentinelRef,
}: {
  errorMessage: string | null;
  hasMore: boolean;
  isLoading: boolean;
  onRetry: () => void;
  renderedCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center" aria-live="polite">
      <span className="text-sm text-muted">
        {renderedCount} productos visibles
      </span>

      {errorMessage ? (
        <>
          <p className="text-sm text-foreground">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-8 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 py-1 text-[11px] font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-raised)]"
          >
            Reintentar carga
          </button>
        </>
      ) : isLoading ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <span className="size-2 animate-pulse rounded-full bg-[color:var(--accent)]" aria-hidden="true" />
          Cargando más productos
        </div>
      ) : hasMore ? (
        <p className="text-sm text-muted">Seguí bajando para cargar más productos.</p>
      ) : (
        <p className="text-sm text-muted">Llegaste al final del catálogo.</p>
      )}

      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
    </div>
  );
}

/**
 * CatalogLayout — Scroll infinito.
 * Filtros arriba + grilla de productos con carga incremental real.
 */
export function CatalogLayoutInfiniteScroll({ module }: { module: CatalogLayoutModule }) {
  const { content } = module;
  const { cardVariant, cardDisplayOptions, density, filters, sort, perPage } = content;
  const initialProducts = useMemo(
    () => (module.products ?? []).slice(0, perPage ?? 12),
    [module.products, perPage],
  );
  const resolvedDensity = density ?? "compact";
  const pathname = usePathname() || "/catalogo";
  const searchParams = useSearchParams();
  const routeCategorySlug = resolveRouteCategorySlug(pathname);
  const pageSize = parsePositiveInteger(searchParams.get("pageSize")) ?? perPage ?? Math.max(initialProducts.length, 1);
  const initialPage = parsePositiveInteger(searchParams.get("page")) ?? 1;
  const queryKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams],
  );
  const [visibleProducts, setVisibleProducts] = useState(initialProducts);
  const [nextPage, setNextPage] = useState(initialPage + 1);
  const [hasMore, setHasMore] = useState(initialProducts.length >= pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleProducts(initialProducts);
    setNextPage(initialPage + 1);
    setHasMore(initialProducts.length >= pageSize);
    setIsLoading(false);
    setErrorMessage(null);
  }, [initialPage, initialProducts, pageSize, queryKey]);

  async function loadMore() {
    if (isLoading || !hasMore) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.set("page", String(nextPage));
      nextSearchParams.set("pageSize", String(pageSize));

      if (routeCategorySlug) {
        nextSearchParams.set("routeCategorySlug", routeCategorySlug);
      }

      const response = await fetch(`/api/catalog/infinite?${nextSearchParams.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudo cargar la siguiente página del catálogo.");
      }

      const payload = (await response.json()) as InfiniteCatalogResponse;
      const incomingProducts = payload.products ?? [];

      setVisibleProducts((currentProducts) => mergeProducts(currentProducts, incomingProducts));
      setNextPage((payload.pagination?.page ?? nextPage) + 1);
      setHasMore(
        Boolean(payload.pagination) &&
          payload.pagination.page < payload.pagination.totalPages &&
          incomingProducts.length > 0,
      );
    } catch {
      setErrorMessage("Hubo un problema al cargar más productos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, nextPage, pageSize, queryKey, routeCategorySlug, searchParams]);

  return (
    <section
      className={resolvedDensity === "comfortable" ? "py-8" : "py-6"}
      data-template="catalog-layout-infinite-scroll"
    >
      <div className={resolvedDensity === "comfortable" ? "mx-auto max-w-7xl space-y-6 px-4" : "mx-auto max-w-7xl space-y-5 px-4"}>
        <FilterBar
          activeFilters={filters}
          categories={module.categories}
          density={resolvedDensity}
          products={visibleProducts}
        />

        <CatalogToolbar
          count={visibleProducts.length}
          density={resolvedDensity}
          sortOptions={sort?.options}
          defaultSort={sort?.default}
        />

        {visibleProducts.length > 0 ? (
          <>
            <ProductGrid
              products={visibleProducts}
              cardVariant={cardVariant}
              cardDisplayOptions={cardDisplayOptions}
              columns={3}
              density={resolvedDensity}
            />
            <InfiniteScrollStatus
              errorMessage={errorMessage}
              hasMore={hasMore}
              isLoading={isLoading}
              onRetry={() => {
                void loadMore();
              }}
              renderedCount={visibleProducts.length}
              sentinelRef={sentinelRef}
            />
          </>
        ) : (
          <EmptyCatalogState />
        )}
      </div>
    </section>
  );
}
