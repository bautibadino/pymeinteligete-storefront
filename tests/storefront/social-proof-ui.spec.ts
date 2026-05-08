import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReviewCard } from "@/components/social-proof/review-card";
import type { SocialProofReviewRecord } from "@/components/social-proof/types";
import { SocialProofSectionShell } from "@/components/templates/social-proof/shared";

const review: SocialProofReviewRecord = {
  reviewId: "review-1",
  author: {
    name: "Marcela Marco",
    photoUrl: "https://cdn.example.com/avatar.webp",
  },
  rating: 5,
  publishedAtRaw: "hace 3 meses",
  content: "Excelente atención y predisposición, el mejor precio.",
  metadata: {
    isLocalGuide: true,
  },
};

function renderHtml(element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(element).replaceAll("&amp;", "&");
}

describe("socialProof UI", () => {
  it("apila Local Guide y fecha para que no se aprieten en mobile", () => {
    const html = renderHtml(createElement(ReviewCard, { review }));

    expect(html).toContain("Local Guide");
    expect(html).toContain("hace 3 meses");
    expect(html).toContain("grid gap-0.5");
  });

  it("usa una sección más compacta que no ocupa una pantalla completa en mobile", () => {
    const html = renderHtml(
      createElement(
        SocialProofSectionShell,
        {
          title: "Confianza real",
          subtitle: "Reseñas verificadas de Google.",
          template: "social-proof-carousel",
          children: createElement("div", null, "contenido"),
        },
      ),
    );

    expect(html).toContain("py-6 sm:py-8");
    expect(html).not.toContain("py-10");
  });
});
