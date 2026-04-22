import { describe, expect, it } from "vitest";

import {
  buildFieldErrors,
  hasFieldErrors,
  parseItems,
  readTrimmedString,
} from "@/lib/checkout/validation";

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
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Corral de Bustos",
      shippingProvince: "Cordoba",
      shippingPostalCode: "2645",
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
      shippingStreet: "Belgrano",
      shippingNumber: "123",
      shippingCity: "Córdoba",
      shippingProvince: "Córdoba",
      shippingPostalCode: "5000",
      itemProductId: ["prod_1"],
      itemQuantity: ["0"],
    });
    const errors = buildFieldErrors(formData);

    expect(errors.items).toBe("Necesitás al menos un producto con cantidad mayor a cero.");
  });
});
