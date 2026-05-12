import { describe, expect, it } from "vitest";

import {
  buildFieldErrors,
  hasFieldErrors,
  parseItems,
  readTrimmedString,
} from "@/lib/checkout/validation";
import type { StorefrontShippingCheckoutSnapshot } from "@/lib/types/storefront";

const HOME_DELIVERY_SNAPSHOT: StorefrontShippingCheckoutSnapshot = {
  contractVersion: "storefront.shipping.quote.v1",
  provider: "andreani",
  optionId: "andreani:home:standard",
  carrierName: "Andreani",
  serviceName: "Envío estándar",
  deliveryType: "home_delivery",
  priceWithTax: 14068,
  priceWithoutTax: 11626.45,
  currency: "ARS",
  destinationPostalCode: "2645",
  originPostalCode: "5000",
  packages: [{ declaredValue: 100000, volumeCm3: 5000, weightKg: 1 }],
  quotedAt: "2026-05-06T22:00:00.000Z",
  expiresAt: "2026-05-06T22:15:00.000Z",
};

const CARRIER_BRANCH_SNAPSHOT: StorefrontShippingCheckoutSnapshot = {
  ...HOME_DELIVERY_SNAPSHOT,
  optionId: "andreani:branch:001",
  serviceName: "Andreani - retiro en sucursal",
  deliveryType: "carrier_branch",
  selectedCarrierBranch: {
    branchId: "AND-CBA-001",
    name: "Andreani Córdoba Centro",
    address: "Colón 123",
    city: "Córdoba",
    province: "Córdoba",
    postalCode: "5000",
  },
};

const PICKUP_SNAPSHOT: StorefrontShippingCheckoutSnapshot = {
  ...HOME_DELIVERY_SNAPSHOT,
  provider: "pickup",
  optionId: "pickup:local:001",
  carrierName: "Retiro local",
  serviceName: "Retiro local",
  deliveryType: "pickup",
  priceWithTax: 0,
  priceWithoutTax: 0,
  pickupLocation: {
    locationId: "sucursal-centro",
    name: "Sucursal Centro",
    address: "San Martín 100",
    city: "Córdoba",
    province: "Córdoba",
    postalCode: "5000",
  },
};

function createFormData(entries: Record<string, string | string[]>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        formData.append(key, item);
      }
    } else {
      formData.set(key, value);
    }
  }

  return formData;
}

function stringifySnapshot(snapshot: StorefrontShippingCheckoutSnapshot): string {
  return JSON.stringify(snapshot);
}

describe("readTrimmedString", () => {
  it("devuelve el valor trimmeado", () => {
    const formData = createFormData({ name: "  Juan  " });

    expect(readTrimmedString(formData, "name")).toBe("Juan");
  });

  it("devuelve cadena vacía si falta la clave", () => {
    const formData = new FormData();

    expect(readTrimmedString(formData, "missing")).toBe("");
  });
});

describe("parseItems", () => {
  it("parsea productos y cantidades válidas", () => {
    const formData = createFormData({
      itemProductId: ["prod_1", "prod_2"],
      itemQuantity: ["2", "3"],
    });
    const items = parseItems(formData);

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ productId: "prod_1", quantity: 2 });
    expect(items[1]).toEqual({ productId: "prod_2", quantity: 3 });
  });

  it("ignora productos sin id", () => {
    const formData = createFormData({
      itemProductId: ["", "prod_2"],
      itemQuantity: ["2", "3"],
    });
    const items = parseItems(formData);

    expect(items).toHaveLength(1);
    expect(items[0]?.productId).toBe("prod_2");
  });

  it("convierte cantidades inválidas a cero", () => {
    const formData = createFormData({
      itemProductId: ["prod_1"],
      itemQuantity: ["abc"],
    });
    const items = parseItems(formData);

    expect(items[0]?.quantity).toBe(0);
  });
});

describe("buildFieldErrors", () => {
  it("no devuelve errores cuando todos los campos son válidos", () => {
    const formData = createFormData({
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      shippingQuoteSnapshot: stringifySnapshot(HOME_DELIVERY_SNAPSHOT),
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(hasFieldErrors(errors)).toBe(false);
  });

  it("detecta campos obligatorios faltantes", () => {
    const formData = new FormData();
    const errors = buildFieldErrors(formData);

    expect(errors.customerName).toBeDefined();
    expect(errors.customerEmail).toBeDefined();
    expect(errors.shippingStreet).toBeDefined();
    expect(errors.shippingNumber).toBeDefined();
    expect(errors.shippingCity).toBeDefined();
    expect(errors.shippingProvince).toBeDefined();
    expect(errors.shippingPostalCode).toBeDefined();
    expect(errors.items).toBeDefined();
  });

  it("detecta items con cantidad cero", () => {
    const formData = createFormData({
      customerName: "Juan",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Córdoba",
      shippingProvince: "Córdoba",
      shippingPostalCode: "5000",
      shippingQuoteSnapshot: stringifySnapshot(HOME_DELIVERY_SNAPSHOT),
      itemProductId: ["prod_1"],
      itemQuantity: ["0"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.items).toBe("Necesitás al menos un producto con cantidad mayor a cero.");
  });

  it("no exige campos de pago cuando la estrategia no es auto", () => {
    const formData = createFormData({
      paymentStrategy: "none",
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      shippingQuoteSnapshot: stringifySnapshot(HOME_DELIVERY_SNAPSHOT),
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.paymentToken).toBeUndefined();
    expect(errors.paymentMethodId).toBeUndefined();
  });

  it("no exige campos de pago en auto (flujo de 2 pasos: orden primero, pago después)", () => {
    const formData = createFormData({
      paymentStrategy: "auto",
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      shippingQuoteSnapshot: stringifySnapshot(HOME_DELIVERY_SNAPSHOT),
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.paymentToken).toBeUndefined();
    expect(errors.paymentMethodId).toBeUndefined();
    expect(errors.payerEmail).toBeUndefined();
    expect(errors.payerIdType).toBeUndefined();
    expect(errors.payerIdNumber).toBeUndefined();
    expect(hasFieldErrors(errors)).toBe(false);
  });

  it("exige un snapshot de envío válido para crear checkout", () => {
    const formData = createFormData({
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.shippingQuoteSnapshot).toBe("Seleccioná un envío válido desde el carrito.");
  });

  it("no exige dirección domiciliaria para retiro en sucursal Andreani", () => {
    const formData = createFormData({
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingQuoteSnapshot: stringifySnapshot(CARRIER_BRANCH_SNAPSHOT),
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.shippingStreet).toBeUndefined();
    expect(errors.shippingNumber).toBeUndefined();
    expect(errors.shippingCity).toBeUndefined();
    expect(errors.shippingProvince).toBeUndefined();
    expect(errors.shippingPostalCode).toBeUndefined();
    expect(hasFieldErrors(errors)).toBe(false);
  });

  it("no exige dirección domiciliaria para retiro local", () => {
    const formData = createFormData({
      customerName: "Juan Perez",
      customerEmail: "juan@mail.com",
      customerPhone: "3515551234",
      shippingQuoteSnapshot: stringifySnapshot(PICKUP_SNAPSHOT),
      itemProductId: ["prod_1"],
      itemQuantity: ["2"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.shippingStreet).toBeUndefined();
    expect(errors.shippingNumber).toBeUndefined();
    expect(errors.shippingCity).toBeUndefined();
    expect(errors.shippingProvince).toBeUndefined();
    expect(errors.shippingPostalCode).toBeUndefined();
    expect(hasFieldErrors(errors)).toBe(false);
  });
});
