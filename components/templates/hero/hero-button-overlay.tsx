import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { shouldPrefetchStorefrontLink } from "@/lib/navigation/prefetch";
import { cn } from "@/lib/utils/cn";
import type { HeroModule } from "@/lib/modules";

export function HeroButtonOverlay({ module }: { module: HeroModule }) {
  const justifyButton = module.buttonPosition === "right" ? "justify-end" : "justify-start";
  const overlayOpacity = Math.max(0, Math.min(100, module.overlayOpacity ?? 28)) / 100;

  return (
    <section
      aria-labelledby={`hero-${module.id}-title`}
      className="relative isolate overflow-hidden rounded-xl border border-border bg-panel shadow-tenant"
      data-template="hero-button-overlay"
    >
      <h2 id={`hero-${module.id}-title`} className="sr-only">
        {module.title}
      </h2>

      {module.image ? (
        <img
          src={module.image.src}
          alt={module.image.alt}
          className="h-[300px] w-full object-cover md:h-[420px] lg:h-[520px]"
          loading="eager"
        />
      ) : (
        <div
          aria-hidden="true"
          className="h-[300px] w-full bg-gradient-to-r from-panel-strong via-panel to-secondary-soft md:h-[420px] lg:h-[520px]"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/10"
        style={{ opacity: overlayOpacity }}
      />

      <div className={cn("absolute inset-x-0 bottom-0 flex px-6 pb-6 pt-16 md:px-10 md:pb-10", justifyButton)}>
        {module.primaryAction ? (
          <Button asChild size="lg" className="shadow-2xl">
            <Link
              href={module.primaryAction.href as Route}
              prefetch={shouldPrefetchStorefrontLink(module.primaryAction.href)}
            >
              {module.primaryAction.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
