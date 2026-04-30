import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import type { StorefrontCategory, StorefrontFetchInput } from "@/lib/types/storefront";

import { requestStorefrontApi } from "@/lib/api/client";
import { buildStorefrontGetNextOptions } from "@/lib/fetchers/cache";
import { resolveStorefrontRequestContext } from "@/lib/fetchers/context";

type CategoryNodeResponse =
  | StorefrontCategory
  | {
      _id?: string;
      id?: string;
      categoryId?: string;
      slug?: string;
      name?: string;
      description?: string;
      imageUrl?: string;
      children?: CategoryNodeResponse[];
    };

type CategoriesResponse =
  | StorefrontCategory[]
  | {
      categories?: CategoryNodeResponse[];
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeCategoryNode(node: CategoryNodeResponse): StorefrontCategory | null {
  if (!isRecord(node)) {
    return null;
  }

  const categoryId =
    readString(node.categoryId) ??
    readString(node._id) ??
    readString(node.id);
  const slug = readString(node.slug);
  const name = readString(node.name);
  const description = readString(node.description);
  const imageUrl = readString(node.imageUrl);

  if (!categoryId || !slug || !name) {
    return null;
  }

  const children = Array.isArray(node.children)
    ? node.children
        .map((child) => normalizeCategoryNode(child))
        .filter((child): child is StorefrontCategory => child !== null)
    : undefined;

  return {
    categoryId,
    slug,
    name,
    ...(description ? { description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(children && children.length > 0 ? { children } : {}),
  };
}

function unwrapCategories(response: CategoriesResponse): StorefrontCategory[] {
  const nodes = Array.isArray(response)
    ? response
    : Array.isArray(response.categories)
      ? response.categories
      : [];

  return nodes
    .map((node) => normalizeCategoryNode(node))
    .filter((node): node is StorefrontCategory => node !== null);
}

export async function getCategories(input: StorefrontFetchInput): Promise<StorefrontCategory[]> {
  const context = resolveStorefrontRequestContext(input);
  const response = await requestStorefrontApi<CategoriesResponse>({
    path: STOREFRONT_API_PATHS.categories,
    context,
    method: "GET",
    next: buildStorefrontGetNextOptions("categories", context.host),
  });

  return unwrapCategories(response);
}
