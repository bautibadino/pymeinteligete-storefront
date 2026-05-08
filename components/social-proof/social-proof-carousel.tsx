"use client";

import { Star } from "lucide-react";

import { OffsetCarousel } from "@/components/ui/offset-carousel";
import { ReviewCard } from "@/components/social-proof/review-card";
import { useSocialProofReviews, useSocialProofSummary } from "@/components/social-proof/use-social-proof";
import { cn } from "@/lib/utils/cn";

interface SocialProofCarouselProps {
  empresaId?: string | undefined;
  tenantSlug?: string | undefined;
  className?: string;
}

export function SocialProofCarousel({ empresaId, tenantSlug, className }: SocialProofCarouselProps) {
  const { data: summary } = useSocialProofSummary(empresaId, tenantSlug);
  const { data: reviewsResponse } = useSocialProofReviews(empresaId, tenantSlug, {
    limit: 12,
    minRating: 4,
    hasComment: true,
  });

  const reviews = reviewsResponse?.data ?? [];

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className={cn("space-y-4 py-0", className)} data-template="social-proof-carousel">
      {summary && summary.totalReviews > 0 ? (
        <header className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/92 px-4 py-2">
            <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn("size-4", index < Math.round(summary.averageRating) ? "fill-current" : "text-border")}
                />
              ))}
            </div>
            <span className="text-base font-semibold text-foreground">
              {summary.averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            Basado en {summary.totalReviews} reseñas reales de Google
          </p>
        </header>
      ) : null}

      <OffsetCarousel
        ariaLabel="Reseñas de clientes"
        items={reviews}
        getItemKey={(review) => review.reviewId}
        itemWidth="clamp(17.5rem, 30vw, 22rem)"
        peek="0.75rem"
        gap="1rem"
        scaleStep={0.06}
        opacityStep={0.22}
        maxVisibleOffset={2}
        showDots
        dotsLabel="Posición de reseñas"
        renderItem={({ item, isActive }) => (
          <div className={isActive ? "rounded-[1.25rem] shadow-[0_10px_34px_-24px_rgba(15,23,42,0.34)]" : "rounded-[1.25rem] shadow-none"}>
            <ReviewCard review={item} />
          </div>
        )}
      />
    </section>
  );
}
