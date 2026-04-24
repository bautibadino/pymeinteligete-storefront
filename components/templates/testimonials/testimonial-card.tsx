import { Quote } from "lucide-react";

import type { TestimonialsItem } from "@/lib/modules/testimonials";

/**
 * TestimonialCard — primitivo compartido por todas las variantes.
 *
 * Recibe un `TestimonialsItem` y un `size` opcional para adaptar
 * la tipografía entre el carousel (grande) y la grilla (compacta).
 * Sin hex literals; consume tokens CSS via Tailwind.
 */

type Props = {
  item: TestimonialsItem;
  size?: "sm" | "md" | "lg";
};

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <div aria-label={`Puntuación: ${clamped} de 5`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < clamped ? "text-primary" : "text-border"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Avatar({ item }: { item: TestimonialsItem }) {
  const initials = item.author
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (item.avatarUrl) {
    return (
      <img
        src={item.avatarUrl}
        alt={item.author}
        className="size-10 flex-shrink-0 rounded-pill object-cover"
        loading="lazy"
        width={40}
        height={40}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex size-10 flex-shrink-0 items-center justify-center rounded-pill bg-primary-soft text-sm font-semibold text-primary"
    >
      {initials}
    </div>
  );
}

export function TestimonialCard({ item, size = "md" }: Props) {
  const quoteSizeClass =
    size === "lg"
      ? "text-xl md:text-2xl"
      : size === "sm"
        ? "text-sm md:text-base"
        : "text-base md:text-lg";

  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border border-border bg-paper p-6 shadow-tenant md:p-8">
      <Quote
        className="size-8 flex-shrink-0 text-primary-soft"
        aria-hidden="true"
      />

      {item.rating !== undefined && <StarRating rating={item.rating} />}

      <blockquote
        className={`flex-1 font-heading leading-relaxed text-foreground ${quoteSizeClass}`}
      >
        {item.quote}
      </blockquote>

      <footer className="flex items-center gap-3 border-t border-border pt-4">
        <Avatar item={item} />
        <div>
          <cite className="block text-sm font-semibold not-italic text-foreground">
            {item.author}
          </cite>
          {item.role && (
            <span className="block text-xs text-muted">{item.role}</span>
          )}
        </div>
      </footer>
    </article>
  );
}
