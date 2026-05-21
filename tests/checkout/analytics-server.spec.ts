import { describe, expect, it } from "vitest";

import { enrichServerAnalyticsPayload } from "@/lib/analytics/server";

describe("enrichServerAnalyticsPayload", () => {
  it("completa matching del proxy con cookies y metadata de request sin perder eventId", () => {
    const payload = enrichServerAnalyticsPayload({
      body: {
        eventName: "Purchase",
        eventId: "purchase_000123",
        path: "/checkout/confirmacion/tok_1",
        user: {
          externalId: "anon_1",
        },
      },
      cookieHeader:
        "_fbp=fb.1.123; sf_fbc=fb.1.saved; _ga=GA1.1.987654321.123456789",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      forwardedFor: "203.0.113.10, 10.0.0.1",
    });

    expect(payload).toEqual({
      eventName: "Purchase",
      eventId: "purchase_000123",
      path: "/checkout/confirmacion/tok_1",
      user: {
        externalId: "anon_1",
        fbp: "fb.1.123",
        fbc: "fb.1.saved",
        clientId: "987654321.123456789",
        clientUserAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        clientIpAddress: "203.0.113.10",
      },
    });
  });
});
