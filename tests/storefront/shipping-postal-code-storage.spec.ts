import { describe, expect, it, vi } from "vitest";

import {
  STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY,
  STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY,
  buildShippingStorageScope,
  clearSelectedShippingOption,
  normalizeShippingPostalCode,
  persistSelectedShippingOption,
  persistShippingPostalCode,
  readStoredShippingPostalCode,
  readStoredSelectedShippingOption,
} from "@/lib/shipping/postal-code-storage";

describe("shipping postal code storage", () => {
  it("normaliza códigos postales numéricos para el contrato de cotización", () => {
    expect(normalizeShippingPostalCode(" 5800 ")).toBe("5800");
    expect(normalizeShippingPostalCode("CP 5000")).toBe("5000");
    expect(normalizeShippingPostalCode("123")).toBeNull();
  });

  it("persiste y lee el código postal con key versionada", () => {
    const storage = {
      getItem: vi.fn(() => "5800"),
      setItem: vi.fn(),
    };

    expect(persistShippingPostalCode(storage, "5000")).toBe("5000");
    expect(storage.setItem).toHaveBeenCalledWith(
      STOREFRONT_SHIPPING_POSTAL_CODE_STORAGE_KEY,
      "5000",
    );
    expect(readStoredShippingPostalCode(storage)).toBe("5800");
  });

  it("persiste y limpia el snapshot de envío seleccionado", () => {
    const snapshot = {
      optionId: "andreani:400039177:0",
      serviceName: "Andreani contrato 177",
      priceWithTax: 15971.25,
    };
    let storedValue: string | null = null;
    const storage = {
      getItem: vi.fn(() => storedValue),
      setItem: vi.fn((_key: string, value: string) => {
        storedValue = value;
      }),
      removeItem: vi.fn((_key: string) => {
        storedValue = null;
      }),
    };

    persistSelectedShippingOption(storage, snapshot);

    expect(storage.setItem).toHaveBeenCalledWith(
      STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
    expect(readStoredSelectedShippingOption(storage)).toEqual(snapshot);

    clearSelectedShippingOption(storage);

    expect(storage.removeItem).toHaveBeenCalledWith(
      STOREFRONT_SELECTED_SHIPPING_OPTION_STORAGE_KEY,
    );
    expect(readStoredSelectedShippingOption(storage)).toBeNull();
  });

  it("asocia el snapshot seleccionado a host, carrito y modalidad para evitar selecciones stale", () => {
    const snapshot = {
      optionId: "andreani:branch:001",
      serviceName: "Andreani - retiro en sucursal",
      deliveryType: "carrier_branch",
      priceWithTax: 15971.25,
    };
    const stored = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => stored.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        stored.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        stored.delete(key);
      }),
    };
    const scope = buildShippingStorageScope({
      host: "bym.pymeinteligente.com.ar",
      cartKey: "prod-a:1|prod-b:2",
      deliveryMode: "carrier_branch",
    });

    persistSelectedShippingOption(storage, snapshot, scope);

    expect(readStoredSelectedShippingOption(storage, scope)).toEqual(snapshot);
    expect(
      readStoredSelectedShippingOption(storage, {
        ...scope,
        host: "otra-tienda.pymeinteligente.com.ar",
      }),
    ).toBeNull();
    expect(
      readStoredSelectedShippingOption(storage, {
        ...scope,
        cartKey: "prod-a:1",
      }),
    ).toBeNull();
    expect(
      readStoredSelectedShippingOption(storage, {
        ...scope,
        deliveryMode: "home_delivery",
      }),
    ).toBeNull();
  });
});
