import { describe, expect, it } from "vitest";

import { buildPageViewAnalyticsCommand } from "@/components/analytics/storefront-analytics-provider";
import {
  buildProductViewAnalyticsCommand,
  buildSearchAnalyticsCommand,
} from "@/components/analytics/storefront-commerce-analytics";

describe("storefront analytics traffic", () => {
  it("no envia PageView al endpoint interno de analytics", () => {
    expect(
      buildPageViewAnalyticsCommand({
        href: "https://demo.test/catalogo",
        path: "/catalogo",
        title: "Catalogo",
      }),
    ).toMatchObject({
      event: "PageView",
      serverEvent: null,
    });
  });

  it("no envia vistas de producto ni busquedas al endpoint interno de analytics", () => {
    expect(
      buildProductViewAnalyticsCommand({
        id: "prod_1",
        name: "Producto",
        price: 1000,
      }),
    ).toMatchObject({
      event: "ViewContent",
      serverEvent: null,
    });

    expect(
      buildSearchAnalyticsCommand({
        searchTerm: "aceite",
        resultsCount: 12,
      }),
    ).toMatchObject({
      event: "Search",
      serverEvent: null,
    });
  });
});
