import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  initialCheckoutActionState,
} from "@/app/(storefront)/checkout/action-state";
import {
  processPaymentAction,
  submitCheckoutAction,
} from "@/app/(storefront)/checkout/actions";
import type {
  StorefrontCartValidateResult,
  StorefrontCheckoutResult,
} from "@/lib/storefront-api";

const {
  getBootstrapMock,
  postCartValidateMock,
  postCheckoutMock,
  processPaymentMock,
  readAnalyticsIdentityFromRequestMock,
  redirectMock,
  unstableRethrowMock,
} = vi.hoisted(() => ({
  getBootstrapMock: vi.fn(),
  postCartValidateMock: vi.fn(),
  postCheckoutMock: vi.fn(),
  processPaymentMock: vi.fn(),
  readAnalyticsIdentityFromRequestMock: vi.fn(),
  redirectMock: vi.fn(),
  unstableRethrowMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  unstable_rethrow: unstableRethrowMock,
}));

vi.mock("@/app/(storefront)/_lib/storefront-shell-data", () => ({
  canAccessCheckout: vi.fn(() => true),
}));

vi.mock("@/lib/runtime/storefront-request-context", () => ({
  getStorefrontRuntimeSnapshot: vi.fn(async () => ({
    context: {
      host: "tienda.test",
      requestId: "req_test",
      storefrontVersion: "storefront@test",
    },
  })),
}));

vi.mock("@/lib/analytics/server", () => ({
  readAnalyticsIdentityFromRequest: readAnalyticsIdentityFromRequestMock,
}));

vi.mock("@/lib/storefront-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storefront-api")>(
    "@/lib/storefront-api",
  );

  return {
    ...actual,
    getBootstrap: getBootstrapMock,
    postCartValidate: postCartValidateMock,
    postCheckout: postCheckoutMock,
    processPayment: processPaymentMock,
  };
});

function createFormData(entries: Record<string, string | string[]>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        formData.append(key, entry);
      }
      continue;
    }

    formData.set(key, value);
  }

  return formData;
}

function createShippingQuoteSnapshot(): string {
  return JSON.stringify({
    contractVersion: "storefront.shipping.quote.v1",
    provider: "andreani",
    currency: "ARS",
    optionId: "andreani-home",
    carrierName: "Andreani",
    serviceName: "Envío a domicilio",
    destinationPostalCode: "2645",
    quotedAt: "2026-05-15T12:00:00.000Z",
    expiresAt: "2026-05-15T13:00:00.000Z",
    packages: [],
    deliveryType: "home_delivery",
    priceWithTax: 5000,
    priceWithoutTax: 4132,
  });
}

function checkoutResult(
  overrides: Partial<StorefrontCheckoutResult> = {},
): StorefrontCheckoutResult {
  return {
    orderId: "ord_1",
    orderToken: "tok_1",
    orderNumber: "000123",
    total: 15200,
    payerEmail: "juan@test.com",
    ...overrides,
  };
}

function cartValidateResult(
  overrides: Partial<StorefrontCartValidateResult> = {},
): StorefrontCartValidateResult {
  return {
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
    ],
    isValid: true,
    warnings: [],
    summary: {
      itemCount: 1,
      subtotal: 20000,
      total: 24200,
      taxAmount: 4200,
    },
    ...overrides,
  };
}

describe("submitCheckoutAction analytics", () => {
  beforeEach(() => {
    getBootstrapMock.mockReset();
    postCartValidateMock.mockReset();
    postCheckoutMock.mockReset();
    processPaymentMock.mockReset();
    readAnalyticsIdentityFromRequestMock.mockReset();
    redirectMock.mockReset();
    unstableRethrowMock.mockReset();
    postCartValidateMock.mockResolvedValue(cartValidateResult());
  });

  it("adjunta identidad analytics al checkout publico sin depender del form", async () => {
    getBootstrapMock.mockResolvedValueOnce({
      tenant: { status: "active" },
    });
    postCheckoutMock.mockResolvedValueOnce(checkoutResult());
    readAnalyticsIdentityFromRequestMock.mockResolvedValueOnce({
      fbc: "fb.1.saved",
      fbp: "fbp.123",
      ga_client_id: "987654321.123456789",
      anonymous_id: "anon_1",
    });

    const result = await submitCheckoutAction(
      initialCheckoutActionState,
      createFormData({
        customerName: "Juan Perez",
        customerEmail: "juan@test.com",
        customerPhone: "3515551234",
        shippingStreet: "Belgrano",
        shippingNumber: "123",
        shippingCity: "Corral de Bustos",
        shippingProvince: "Cordoba",
        shippingPostalCode: "2645",
        shippingQuoteSnapshot: createShippingQuoteSnapshot(),
        paymentStrategy: "auto",
        itemProductId: ["prod_1"],
        itemQuantity: ["2"],
        idempotencyKey: "idem_1",
      }),
    );

    expect(postCheckoutMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: "tienda.test" }),
      expect.objectContaining({
        analytics: {
          fbc: "fb.1.saved",
          fbp: "fbp.123",
          ga_client_id: "987654321.123456789",
          anonymous_id: "anon_1",
        },
      }),
    );
    expect(postCartValidateMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: "tienda.test" }),
      {
        items: [{ productId: "prod_1", quantity: 2 }],
      },
    );
    expect(result).toEqual({
      status: "success",
      orderId: "ord_1",
      orderToken: "tok_1",
      orderNumber: "000123",
      total: 15200,
      payerEmail: "juan@test.com",
    });
  });

  it("propaga datos fiscales autocompletados cuando el checkout los envía ocultos", async () => {
    getBootstrapMock.mockResolvedValueOnce({
      tenant: { status: "active" },
    });
    postCheckoutMock.mockResolvedValueOnce(checkoutResult());
    readAnalyticsIdentityFromRequestMock.mockResolvedValueOnce(null);

    await submitCheckoutAction(
      initialCheckoutActionState,
      createFormData({
        customerName: "BYM SRL",
        customerEmail: "compras@bym.test",
        customerPhone: "3515551234",
        customerDni: "30712345678",
        customerTaxId: "30712345678",
        customerTaxIdType: "80",
        customerTaxCondition: "Responsable Inscripto",
        shippingStreet: "Belgrano",
        shippingNumber: "123",
        shippingCity: "Corral de Bustos",
        shippingProvince: "Cordoba",
        shippingPostalCode: "2645",
        shippingQuoteSnapshot: createShippingQuoteSnapshot(),
        billingStreet: "Belgrano",
        billingNumber: "123",
        billingCity: "Corral de Bustos",
        billingProvince: "Cordoba",
        billingPostalCode: "2645",
        paymentStrategy: "auto",
        itemProductId: ["prod_1"],
        itemQuantity: ["1"],
        idempotencyKey: "idem_2",
      }),
    );

    expect(postCheckoutMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        customer: expect.objectContaining({
          dni: "30712345678",
          taxId: "30712345678",
          taxIdType: "80",
          taxCondition: "Responsable Inscripto",
        }),
        billingAddress: {
          street: "Belgrano",
          number: "123",
          city: "Corral de Bustos",
          province: "Cordoba",
          postalCode: "2645",
        },
      }),
    );
  });

  it("no convierte el redirect de confirmación manual en error genérico", async () => {
    const redirectError = new Error("NEXT_REDIRECT");

    getBootstrapMock.mockResolvedValueOnce({
      tenant: { status: "active" },
    });
    postCheckoutMock.mockResolvedValueOnce(checkoutResult());
    readAnalyticsIdentityFromRequestMock.mockResolvedValueOnce(null);
    redirectMock.mockImplementationOnce(() => {
      throw redirectError;
    });
    unstableRethrowMock.mockImplementationOnce((error: unknown) => {
      throw error;
    });

    await expect(
      submitCheckoutAction(
        initialCheckoutActionState,
        createFormData({
          customerName: "Juan Perez",
          customerEmail: "juan@test.com",
          customerPhone: "3515551234",
          shippingStreet: "Belgrano",
          shippingNumber: "123",
          shippingCity: "Corral de Bustos",
          shippingProvince: "Cordoba",
          shippingPostalCode: "2645",
          shippingQuoteSnapshot: createShippingQuoteSnapshot(),
          paymentStrategy: "manual",
          paymentMethodId: "transferencia",
          itemProductId: ["prod_1"],
          itemQuantity: ["1"],
          idempotencyKey: "idem_redirect",
        }),
      ),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith("/checkout/confirmacion/tok_1?method=transferencia");
    expect(postCheckoutMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        paymentMethodId: "transferencia",
      }),
    );
    expect(unstableRethrowMock).toHaveBeenCalledWith(redirectError);
  });

  it("bloquea el checkout cuando cart/validate detecta inconsistencias", async () => {
    getBootstrapMock.mockResolvedValueOnce({
      tenant: { status: "active" },
    });
    postCartValidateMock.mockResolvedValueOnce(
      cartValidateResult({
        isValid: false,
        warnings: ["Producto 1: Solo hay 1 unidades disponibles"],
      }),
    );
    readAnalyticsIdentityFromRequestMock.mockResolvedValueOnce(null);

    const result = await submitCheckoutAction(
      initialCheckoutActionState,
      createFormData({
        customerName: "Juan Perez",
        customerEmail: "juan@test.com",
        customerPhone: "3515551234",
        shippingStreet: "Belgrano",
        shippingNumber: "123",
        shippingCity: "Corral de Bustos",
        shippingProvince: "Cordoba",
        shippingPostalCode: "2645",
        shippingQuoteSnapshot: createShippingQuoteSnapshot(),
        paymentStrategy: "auto",
        itemProductId: ["prod_1"],
        itemQuantity: ["2"],
        idempotencyKey: "idem_invalid_cart",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "Producto 1: Solo hay 1 unidades disponibles",
    });
    expect(postCheckoutMock).not.toHaveBeenCalled();
  });

  it("no convierte el redirect de pago aprobado en error genérico", async () => {
    const redirectError = new Error("NEXT_REDIRECT");

    processPaymentMock.mockResolvedValueOnce({
      paymentId: "mp_1",
      status: "approved",
      statusDetail: "accredited",
      orderId: "ord_1",
      orderToken: "tok_1",
    });
    redirectMock.mockImplementationOnce(() => {
      throw redirectError;
    });
    unstableRethrowMock.mockImplementationOnce((error: unknown) => {
      throw error;
    });

    await expect(
      processPaymentAction(
        initialCheckoutActionState,
        createFormData({
          orderId: "ord_1",
          orderToken: "tok_1",
          paymentToken: "card_token",
          paymentMethodId: "visa",
          installments: "1",
          payerEmail: "juan@test.com",
          transactionAmount: "15200",
        }),
      ),
    ).rejects.toBe(redirectError);

    expect(redirectMock).toHaveBeenCalledWith("/checkout/confirmacion/tok_1");
    expect(unstableRethrowMock).toHaveBeenCalledWith(redirectError);
  });
});
