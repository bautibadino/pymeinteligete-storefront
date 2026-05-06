"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { GoogleMark } from "@/components/social-proof/google-mark";
import type { SocialProofAvatar } from "@/components/social-proof/types";
import { useSocialProofSummary } from "@/components/social-proof/use-social-proof";
import { cn } from "@/lib/utils/cn";

interface SocialProofMiniProps {
  empresaId?: string | undefined;
  tenantSlug?: string | undefined;
  className?: string;
}

function AvatarStack({ avatars }: { avatars: SocialProofAvatar[] }) {
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  return (
    <div className="ml-1 flex items-center -space-x-2">
      {avatars.slice(0, 5).map((avatar, index) => {
        const hasFailed = failedImages.has(index);
        const initials = avatar.name?.slice(0, 2).toUpperCase() || "RV";

        return (
          <div
            key={`${avatar.name}-${index}`}
            className="relative size-6 shrink-0 overflow-hidden rounded-full border-2 border-white bg-muted ring-1 ring-border/50"
            title={avatar.name}
          >
            {!hasFailed ? (
              <img
                src={avatar.url}
                alt={avatar.name || `Usuario ${index + 1}`}
                className="size-full object-cover"
                loading="lazy"
                width={24}
                height={24}
                onError={() => {
                  setFailedImages((prev) => new Set(prev).add(index));
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-[10px] font-bold text-muted-foreground">
                {initials}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SocialProofMini({ empresaId, tenantSlug, className }: SocialProofMiniProps) {
  const { data } = useSocialProofSummary(empresaId, tenantSlug);

  if (!data || data.totalReviews === 0) {
    return null;
  }

  const roundedRating = Math.round(data.averageRating);
  const avatars = data.userAvatars ?? [];

  return (
    <div
      data-social-proof="reviews"
      className={cn(
        "inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn("size-3.5", index < roundedRating ? "fill-current" : "text-border")}
          />
        ))}
      </div>

      <div className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
        <span>{data.averageRating.toFixed(1)}</span>
        <span className="hidden text-muted-foreground sm:inline">{data.totalReviews} reseñas</span>
        <span className="text-muted-foreground sm:hidden">{data.totalReviews}</span>
        <GoogleMark className="size-4 shrink-0" />
      </div>

      {avatars.length > 0 ? <AvatarStack avatars={avatars} /> : null}
    </div>
  );
}
