"use client";

import { Star } from "lucide-react";

import { ReviewCard } from "@/components/social-proof/review-card";
import { useSocialProofReviews, useSocialProofSummary } from "@/components/social-proof/use-social-proof";
import { cn } from "@/lib/utils/cn";

interface SocialProofGridProps {
  empresaId?: string | undefined;
  tenantSlug?: string | undefined;
  className?: string;
}

export function SocialProofGrid({ empresaId, tenantSlug, className }: SocialProofGridProps) {
  const { data: summary } = useSocialProofSummary(empresaId, tenantSlug);
  const { data: reviewsResponse } = useSocialProofReviews(empresaId, tenantSlug, {
    limit: 6,
    minRating: 4,
    hasComment: true,
  });

  const reviews = reviewsResponse?.data ?? [];

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {summary && summary.totalReviews > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-border/70 bg-white/94 px-4 py-3 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.22)]">
          <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn("size-4", index < Math.round(summary.averageRating) ? "fill-current" : "text-border")}
              />
            ))}
          </div>
          <p className="text-sm text-foreground sm:text-base">
            <span className="font-semibold">{summary.averageRating.toFixed(1)}</span>{" "}
            <span className="text-muted-foreground">sobre {summary.totalReviews} reseñas</span>
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.reviewId} review={review} />
        ))}
      </div>
    </div>
  );
}
