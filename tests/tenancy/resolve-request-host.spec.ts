import { describe, expect, it } from "vitest";

import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";

describe("resolveRequestHostFromHeaders", () => {
  it("prioriza x-forwarded-host y normaliza host sin puerto", () => {
    const headers = new Headers({
      host: "fallback.example.com",
      "x-forwarded-host": "Tienda.EXAMPLE.com:443",
    });

    expect(resolveRequestHostFromHeaders(headers)).toBe("tienda.example.com");
  });

  it("usa el primer valor cuando el proxy manda lista de hosts", () => {
    const headers = new Headers({
      "x-forwarded-host": "acme.com, proxy.internal",
    });

    expect(resolveRequestHostFromHeaders(headers)).toBe("acme.com");
  });

  it("falla explicitamente si no hay host", () => {
    expect(() => resolveRequestHostFromHeaders(new Headers())).toThrow(
      "No se pudo resolver el host",
    );
  });
});

