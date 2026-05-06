import { MapPin, Star } from "lucide-react";

import { GoogleMark } from "@/components/social-proof/google-mark";
import type { SocialProofReviewRecord } from "@/components/social-proof/types";
import { cn } from "@/lib/utils/cn";

export interface ReviewCardProps {
  review: SocialProofReviewRecord;
  className?: string;
}

function getReviewImages(review: SocialProofReviewRecord) {
  return (review.images ?? [])
    .map((image) => image.blobUrl ?? image.originalUrl)
    .filter((value): value is string => Boolean(value));
}

function getAvatarUrl(review: SocialProofReviewRecord) {
  return review.author.photoUrlBlob ?? review.author.photoUrl;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const avatarUrl = getAvatarUrl(review);
  const images = getReviewImages(review).slice(0, 3);
  const initials = review.author.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-4 rounded-[1.25rem] border border-border/70 bg-white/94 p-5 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.28)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={review.author.name}
              className="size-10 rounded-full border border-border/60 object-cover"
              loading="lazy"
              width={40}
              height={40}
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-xs font-semibold text-foreground">
              {initials || "RV"}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{review.author.name}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              {review.metadata?.isLocalGuide ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden="true" />
                  Local Guide
                </span>
              ) : null}
              {review.publishedAtRaw ? <span>{review.publishedAtRaw}</span> : null}
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white/90 px-2 py-1 text-[10px] text-muted-foreground">
          <GoogleMark className="size-3.5 shrink-0" />
          Google
        </span>
      </div>

      <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Puntuación ${review.rating} de 5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn("size-3.5", index < Math.round(review.rating) ? "fill-current" : "text-border")}
          />
        ))}
      </div>

      {review.content ? (
        <p className="line-clamp-4 text-sm leading-relaxed text-foreground/82">
          {review.content}
        </p>
      ) : null}

      {images.length > 0 ? (
        <div className="mt-auto flex gap-2 pt-1">
          {images.map((image, index) => (
            <img
              key={`${review.reviewId}-image-${index}`}
              src={image}
              alt="Imagen de reseña"
              className="size-12 rounded-[0.8rem] border border-border/60 object-cover"
              loading="lazy"
              width={48}
              height={48}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
