import { describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => vi.fn());
const getServerEnvSnapshotMock = vi.hoisted(() => vi.fn());
const createRequestIdMock = vi.hoisted(() => vi.fn());
const resolveRequestHostFromHeadersMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/env/server-env", () => ({
  getServerEnvSnapshot: getServerEnvSnapshotMock,
}));

vi.mock("@/lib/runtime/request-id", () => ({
  createRequestId: createRequestIdMock,
}));

vi.mock("@/lib/tenancy/resolve-request-host", () => ({
  resolveRequestHostFromHeaders: resolveRequestHostFromHeadersMock,
}));

import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";

describe("getStorefrontRuntimeSnapshot", () => {
  it("recupera tenantSlug desde cookie de preview cuando no llega por header", async () => {
    const headerStore = new Headers({
      cookie: "__preview_token=preview-123; __preview_tenant_slug=bym",
      "x-preview-token": "preview-123",
    });

    headersMock.mockResolvedValue(headerStore);
    getServerEnvSnapshotMock.mockReturnValue({
      pymeApiBaseUrl: "http://localhost:3001",
      storefrontVersionOverride: null,
    });
    createRequestIdMock.mockReturnValue("req_test");
    resolveRequestHostFromHeadersMock.mockReturnValue("localhost");

    const snapshot = await getStorefrontRuntimeSnapshot();

    expect(snapshot.context).toMatchObject({
      host: "localhost",
      requestId: "req_test",
      previewToken: "preview-123",
      tenantSlug: "bym",
    });
    expect(snapshot.hasApiBaseUrl).toBe(true);
  });
});
