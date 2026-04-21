import { describe, expect, it } from "vitest";

import {
  canAccessCheckout,
  canBrowseCatalog,
  canFetchPaymentMethods,
  canRenderBootstrap,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import type { ShopStatus } from "@/lib/storefront-api";

const statuses: Array<ShopStatus | null> = ["active", "paused", "draft", "disabled", null];

describe("storefront surface policy", () => {
  it.each(statuses)("aplica bootstrap para %s", (status) => {
    expect(canRenderBootstrap(status)).toBe(
      status === "active" || status === "paused" || status === "draft",
    );
  });

  it.each(statuses)("aplica catalogo/producto para %s", (status) => {
    expect(canBrowseCatalog(status)).toBe(status === "active" || status === "paused");
  });

  it.each(statuses)("aplica payment-methods para %s", (status) => {
    expect(canFetchPaymentMethods(status)).toBe(status === "active" || status === "paused");
  });

  it.each(statuses)("aplica checkout para %s", (status) => {
    expect(canAccessCheckout(status)).toBe(status === "active");
  });
});

