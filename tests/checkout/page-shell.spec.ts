import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const checkoutFormMock = vi.hoisted(() => vi.fn());
const postCartValidateMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  canAccessCheckout: vi.fn(() => true),
  loadCheckoutExperience: vi.fn(async () => ({
    runtime: {
      context: {
        host: "demo.tienda.test",
      },
    },
    bootstrap: {
      tenant: {
        status: "active",
      },
      commerce: {
        payment: {
          publicKey: "pk_test_123",
        },
      },
    },
    paymentMethods: {
      paymentMethods: [
        {
          methodId: "mp_card",
          methodType: "automatic",
          displayName: "Tarjetas",
          description: "Pagá online en el momento.",
          icon: null,
          color: null,
          discount: null,
        },
        {
          methodId: "transfer",
          methodType: "manual",
          displayName: "Transferencia",
          description: "Coordinás el pago con el comercio.",
          icon: null,
          color: null,
          discount: null,
        },
      ],
    },
  })),
  resolveTenantDisplayName: vi.fn(() => "Demo Store"),
}));

vi.mock("@/components/storefront/checkout/checkout-form", () => ({
  CheckoutForm: (props: unknown) => {
    checkoutFormMock(props);
    return createElement("div", { "data-checkout-form": "true" }, "checkout-form");
  },
}));

vi.mock("@/components/storefront/surface-state", () => ({
  SurfaceStateCard: ({ title, description }: { title: string; description: string }) =>
    createElement("section", { "data-surface-state": "true" }, `${title} ${description}`),
}));

vi.mock("@/lib/storefront-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storefront-api")>("@/lib/storefront-api");

  return {
    ...actual,
    postCartValidate: postCartValidateMock,
  };
});

function renderHtml(element: Awaited<ReturnType<typeof import("@/app/(storefront)/checkout/page").default>>): string {
  return renderToStaticMarkup(element).replaceAll("&amp;", "&");
}

describe("CheckoutPage", () => {
  it("presenta el checkout como una compra real y entrega initialItems al formulario", async () => {
    postCartValidateMock.mockResolvedValueOnce({
      items: [
        {
          productId: "prod_1",
          name: "Producto 1",
          price: 10000,
          priceWithTax: 12100,
          requestedQuantity: 2,
          availableStock: 10,
          isValid: true,
        },
        {
          productId: "prod_2",
          name: "Producto 2",
          price: 5000,
          priceWithTax: 6050,
          requestedQuantity: 1,
          availableStock: 8,
          isValid: true,
        },
      ],
      isValid: true,
      warnings: [],
      summary: {
        itemCount: 2,
        subtotal: 25000,
        taxAmount: 3150,
        total: 28150,
      },
    });

    const module = await import("@/app/(storefront)/checkout/page");

    const html = renderHtml(
      await module.default({
        searchParams: Promise.resolve({
          item: ["prod_1:2", "prod_2:1"],
        }),
      }),
    );

    expect(html).toContain("Finalizá tu compra en Demo Store");
    expect(html).toContain("Revisá tu pedido, completá los datos de entrega y elegí cómo querés pagar.");
    expect(html).not.toContain("Host");
    expect(html).not.toContain("Medios disponibles");
    expect(postCartValidateMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: "demo.tienda.test" }),
      {
        items: [
          { productId: "prod_1", quantity: 2 },
          { productId: "prod_2", quantity: 1 },
        ],
      },
    );
    expect(checkoutFormMock).toHaveBeenCalled();
    expect(checkoutFormMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        initialItems: [
          { productId: "prod_1", quantity: 2 },
          { productId: "prod_2", quantity: 1 },
        ],
        initialCartValidation: expect.objectContaining({
          isValid: true,
          summary: expect.objectContaining({
            total: 28150,
          }),
        }),
        publicKey: "pk_test_123",
      }),
    );
  });
});
