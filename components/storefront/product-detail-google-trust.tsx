"use client";

import { Star } from "lucide-react";

import { GoogleMark } from "@/components/social-proof/google-mark";
import { useSocialProofSummary } from "@/components/social-proof/use-social-proof";
import { cn } from "@/lib/utils/cn";

type ProductDetailGoogleTrustProps = {
  empresaId?: string | undefined;
  tenantSlug?: string | undefined;
  className?: string | undefined;
};

export function ProductDetailGoogleTrust({
  empresaId,
  tenantSlug,
  className,
}: ProductDetailGoogleTrustProps) {
  const { data } = useSocialProofSummary(empresaId, tenantSlug);

  if (!data || data.totalReviews === 0) {
    return null;
  }

  const roundedRating = Math.round(data.averageRating);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[18px] border border-black/10 bg-white px-3 py-3",
        className,
      )}
      data-product-google-trust="true"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Opiniones reales
        </p>
        <GoogleMark className="size-4 shrink-0" />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={cn("size-3.5", index < roundedRating ? "fill-current" : "text-border")}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {data.averageRating.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          {data.totalReviews} reseñas Google
        </span>
      </div>
    </div>
  );
}
