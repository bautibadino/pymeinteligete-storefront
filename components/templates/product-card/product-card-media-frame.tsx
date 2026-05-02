import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ProductCardMediaFrameProps {
  imageUrl?: string | undefined;
  alt: string;
  fit?: "contain" | "cover";
  frameClassName?: string;
  imageClassName?: string;
  placeholderClassName?: string;
  children?: ReactNode;
}

export function ProductCardMediaFrame({
  imageUrl,
  alt,
  fit = "contain",
  frameClassName,
  imageClassName,
  placeholderClassName,
  children,
}: ProductCardMediaFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-panel-strong",
        fit === "contain" && "bg-white",
        frameClassName,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            "h-full w-full transition-transform duration-300",
            fit === "contain"
              ? "object-contain p-3"
              : "object-cover",
            imageClassName,
          )}
          loading="lazy"
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "flex h-full w-full bg-gradient-to-br from-primary-soft to-accent-soft",
            placeholderClassName,
          )}
        />
      )}

      {children}
    </div>
  );
}
