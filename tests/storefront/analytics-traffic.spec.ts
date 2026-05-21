import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  StorefrontAnalyticsProvider,
  buildPageViewAnalyticsCommand,
} from "@/components/analytics/storefront-analytics-provider";
import {
  buildProductViewAnalyticsCommand,
  buildSearchAnalyticsCommand,
} from "@/components/analytics/storefront-commerce-analytics";
import type { StorefrontBootstrap } from "@/lib/storefront-api";

vi.mock("next/navigation", () => ({
  usePathname: () => "/catalogo",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/script", () => ({
  default: ({
    children,
    id,
    src,
  }: {
    children?: string;
    id: string;
    src?: string;
  }) => createElement("script", { id, src }, children ?? null),
}));

function renderHtml(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(element).replaceAll("&amp;", "&");
}

function extractScriptContent(html: string, scriptId: string): string {
  const pattern = new RegExp(`<script id="${scriptId}">([\\s\\S]*?)<\\/script>`);
  const match = html.match(pattern);

  if (!match?.[1]) {
    throw new Error(`No se encontró el script ${scriptId}.`);
  }

  return match[1];
}

function createAnalyticsBootstrap(): StorefrontBootstrap {
  return {
    analytics: {
      pixel: {
        enabled: true,
        pixelId: "px_bootstrap",
      },
    },
  } as StorefrontBootstrap;
}

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

  it("genera un bootstrap de Meta que encola init y track sobre la cola estándar del pixel", () => {
    const html = renderHtml(
      createElement(
        StorefrontAnalyticsProvider,
        {
          bootstrap: createAnalyticsBootstrap(),
          children: createElement("div", null, "child"),
          host: "demo.test",
        },
      ),
    );
    const scriptContent = extractScriptContent(html, "storefront-meta-pixel-init");
    const runtimeWindow: Record<string, unknown> = {};

    new Function("window", scriptContent)(runtimeWindow);
    (runtimeWindow.fbq as (...args: unknown[]) => void)("track", "PageView", {
      page_path: "/catalogo",
    });

    expect((runtimeWindow.fbq as { queue?: unknown[] }).queue).toEqual([
      ["init", "px_bootstrap"],
      ["track", "PageView", { page_path: "/catalogo" }],
    ]);
  });
});
