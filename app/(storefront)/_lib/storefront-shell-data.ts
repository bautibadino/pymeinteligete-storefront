import { cache } from "react";

import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import {
  getBootstrap,
  getCatalog,
  getCategories,
  getPaymentMethods,
  getProduct,
  StorefrontApiError,
  type ShopStatus,
  type StorefrontBootstrap,
  type StorefrontCatalog,
  type StorefrontCatalogQuery,
  type StorefrontCategory,
  type StorefrontPaymentMethods,
  type StorefrontProductDetail,
} from "@/lib/storefront-api";

export type SurfaceKind = "home" | "catalog" | "product" | "checkout" | "order";

export type FetchIssue = {
  surface: SurfaceKind | "bootstrap" | "categories" | "payment-methods";
  message: string;
  code?: string;
  status?: number;
};

export type BootstrapExperience = {
  runtime: Awaited<ReturnType<typeof getStorefrontRuntimeSnapshot>>;
  bootstrap: StorefrontBootstrap | null;
  categories: StorefrontCategory[];
  issues: FetchIssue[];
};

type CatalogExperience = BootstrapExperience & {
  catalog: StorefrontCatalog | null;
};

type ProductExperience = BootstrapExperience & {
  product: StorefrontProductDetail | null;
  relatedProducts: StorefrontCatalog["products"];
  paymentMethods: StorefrontPaymentMethods | null;
};

type CheckoutExperience = BootstrapExperience & {
  paymentMethods: StorefrontPaymentMethods | null;
};

type HomeExperience = BootstrapExperience & {
  catalog: StorefrontCatalog | null;
  categories: StorefrontCategory[];
  paymentMethods: StorefrontPaymentMethods | null;
};

function normalizeApiError(
  error: unknown,
  surface: FetchIssue["surface"],
  fallbackMessage: string,
): FetchIssue {
  if (error instanceof StorefrontApiError) {
    return {
      surface,
      message: error.message,
      code: error.code,
      ...(error.status !== undefined ? { status: error.status } : {}),
    };
  }

  return {
    surface,
    message: fallbackMessage,
  };
}

export function canRenderBootstrap(shopStatus: ShopStatus | null): boolean {
  return shopStatus === "active" || shopStatus === "paused" || shopStatus === "draft";
}

export function canBrowseCatalog(shopStatus: ShopStatus | null): boolean {
  return shopStatus === "active" || shopStatus === "paused";
}

export function canAccessCheckout(shopStatus: ShopStatus | null): boolean {
  return shopStatus === "active";
}

export function canFetchPaymentMethods(shopStatus: ShopStatus | null): boolean {
  return shopStatus === "active" || shopStatus === "paused";
}

export function resolveTenantDisplayName(bootstrap: StorefrontBootstrap | null, host: string): string {
  return (
    bootstrap?.branding?.storeName ??
    bootstrap?.tenant?.tenantSlug ??
    host
  );
}

export function resolveTenantDescription(bootstrap: StorefrontBootstrap | null): string | null {
  return bootstrap?.seo?.defaultDescription ?? bootstrap?.contact?.address ?? null;
}

export function resolveTenantLogoUrl(bootstrap: StorefrontBootstrap | null): string | null {
  return bootstrap?.branding?.logoUrl ?? null;
}

export function resolveModules(bootstrap: StorefrontBootstrap | null) {
  return bootstrap?.home?.modules ?? [];
}

export function resolveStatusTone(shopStatus: ShopStatus | null): "live" | "paused" | "draft" | "disabled" {
  switch (shopStatus) {
    case "active":
      return "live";
    case "paused":
      return "paused";
    case "draft":
      return "draft";
    default:
      return "disabled";
  }
}

export function resolveStatusMessage(shopStatus: ShopStatus | null): string {
  switch (shopStatus) {
    case "active":
      return "Tienda activa para navegar y comprar.";
    case "paused":
      return "Tienda visible pero temporalmente no disponible para comprar.";
    case "draft":
      return "Tienda en preparación. Solo bootstrap y preview controlado.";
    case "disabled":
      return "Tienda no disponible públicamente.";
    default:
      return "Estado de tienda todavía no resuelto.";
  }
}

export function normalizeCatalogExperienceQuery(
  query?: StorefrontCatalogQuery,
): StorefrontCatalogQuery | undefined {
  if (!query) {
    return undefined;
  }

  const shouldCollapseToCanonicalQuery =
    (query.page ?? 1) > 1 ||
    Boolean(query.search || query.brand || query.family || query.sortBy || query.sortOrder);

  if (!shouldCollapseToCanonicalQuery) {
    return query;
  }

  // SSR e infinite scroll deben pegar al mismo query liviano para no reabrir
  // el hot path caro del catálogo público cuando se activa el source v2.
  return query.categoryId ? { categoryId: query.categoryId } : {};
}

export const loadBootstrapExperience = cache(async (): Promise<BootstrapExperience> => {
  const runtime = await getStorefrontRuntimeSnapshot();
  const issues: FetchIssue[] = [];
  let bootstrap: StorefrontBootstrap | null = null;
  let categories: StorefrontCategory[] = [];

  if (!runtime.hasApiBaseUrl) {
    issues.push({
      surface: "bootstrap",
      message: "Falta configurar PYME_API_BASE_URL para consumir bootstrap real.",
      code: "MISSING_API_BASE_URL",
    });
  } else {
    try {
      bootstrap = await getBootstrap(runtime.context);
    } catch (error) {
      issues.push(
        normalizeApiError(
          error,
          "bootstrap",
          "No se pudo recuperar el bootstrap del tenant actual.",
        ),
      );
    }
  }

  if (canBrowseCatalog(bootstrap?.tenant.status ?? null)) {
    try {
      categories = await getCategories(runtime.context);
    } catch (error) {
      issues.push(
        normalizeApiError(
          error,
          "categories",
          "No se pudieron recuperar las categorías públicas del tenant actual.",
        ),
      );
    }
  }

  return {
    runtime,
    bootstrap,
    categories,
    issues,
  };
});

export async function loadCatalogExperience(
  query?: StorefrontCatalogQuery,
  origin: "catalog-page" | "home" = "catalog-page",
): Promise<CatalogExperience> {
  const base = await loadBootstrapExperience();
  const normalizedQuery = normalizeCatalogExperienceQuery(query);

  if (!canBrowseCatalog(base.bootstrap?.tenant.status ?? null)) {
    return {
      ...base,
      catalog: null,
    };
  }

  try {
    const catalog = await getCatalog(base.runtime.context, normalizedQuery, { origin });

    return {
      ...base,
      catalog,
    };
  } catch (error) {
    return {
      ...base,
      catalog: null,
      issues: [
        ...base.issues,
        normalizeApiError(error, "catalog", "No se pudo recuperar el catálogo del tenant actual."),
      ],
    };
  }
}

export async function loadProductExperience(slug: string): Promise<ProductExperience> {
  const base = await loadBootstrapExperience();

  if (!canBrowseCatalog(base.bootstrap?.tenant.status ?? null)) {
    return {
      ...base,
      product: null,
      relatedProducts: [],
      paymentMethods: null,
    };
  }

  const paymentMethodsPromise = (async (): Promise<{
    paymentMethods: StorefrontPaymentMethods | null;
    issues: FetchIssue[];
  }> => {
    if (!canFetchPaymentMethods(base.bootstrap?.tenant.status ?? null)) {
      return {
        paymentMethods: null,
        issues: [],
      };
    }

    try {
      const paymentMethods = await getPaymentMethods(base.runtime.context);

      return {
        paymentMethods,
        issues: [],
      };
    } catch (error) {
      return {
        paymentMethods: null,
        issues: [
          normalizeApiError(
            error,
            "payment-methods",
            "No se pudieron recuperar los métodos de pago visibles.",
          ),
        ],
      };
    }
  })();

  try {
    const product = await getProduct(base.runtime.context, slug);
    let relatedProducts: StorefrontCatalog["products"] = [];

    if (product.category) {
      try {
        const categories = await getCategories(base.runtime.context);
        const normalizedCategory = product.category.trim().toLowerCase().replace(/\s+/g, "-");
        const matchingCategory = categories.find((category) => {
          const normalizedSlug = category.slug.trim().toLowerCase();
          const normalizedName = category.name.trim().toLowerCase().replace(/\s+/g, "-");

          return normalizedSlug === normalizedCategory || normalizedName === normalizedCategory;
        });

        if (matchingCategory) {
          const catalog = await getCatalog(base.runtime.context, {
            categoryId: matchingCategory.categoryId,
            pageSize: 13,
          }, { origin: "product-related" });
          relatedProducts = catalog.products.filter((candidate) => candidate.slug !== product.slug);
        }
      } catch {
        relatedProducts = [];
      }
    }

    if (relatedProducts.length === 0 && product.brand) {
      try {
        const catalog = await getCatalog(base.runtime.context, {
          brand: product.brand,
          pageSize: 13,
        }, { origin: "product-related" });
        relatedProducts = catalog.products.filter((candidate) => candidate.slug !== product.slug);
      } catch {
        relatedProducts = [];
      }
    }

    const paymentMethodsResult = await paymentMethodsPromise;

    return {
      ...base,
      product,
      relatedProducts,
      paymentMethods: paymentMethodsResult.paymentMethods,
      issues: [...base.issues, ...paymentMethodsResult.issues],
    };
  } catch (error) {
    const paymentMethodsResult = await paymentMethodsPromise;

    return {
      ...base,
      product: null,
      relatedProducts: [],
      paymentMethods: paymentMethodsResult.paymentMethods,
      issues: [
        ...base.issues,
        ...paymentMethodsResult.issues,
        normalizeApiError(error, "product", "No se pudo recuperar el detalle del producto."),
      ],
    };
  }
}

export async function loadCheckoutExperience(): Promise<CheckoutExperience> {
  const base = await loadBootstrapExperience();

  if (!canFetchPaymentMethods(base.bootstrap?.tenant.status ?? null)) {
    return {
      ...base,
      paymentMethods: null,
    };
  }

  try {
    const paymentMethods = await getPaymentMethods(base.runtime.context);

    return {
      ...base,
      paymentMethods,
    };
  } catch (error) {
    return {
      ...base,
      paymentMethods: null,
      issues: [
        ...base.issues,
        normalizeApiError(
          error,
          "payment-methods",
          "No se pudieron recuperar los métodos de pago visibles.",
        ),
      ],
    };
  }
}

export async function loadHomeExperience(): Promise<HomeExperience> {
  const [catalogExperience, checkoutExperience] = await Promise.all([
    loadCatalogExperience({ pageSize: 8 }, "home"),
    loadCheckoutExperience(),
  ]);

  return {
    ...catalogExperience,
    categories: catalogExperience.categories,
    paymentMethods: checkoutExperience.paymentMethods,
    issues: [...catalogExperience.issues, ...checkoutExperience.issues],
  };
}
