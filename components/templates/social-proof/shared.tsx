import type { ReactNode } from "react";

export function SocialProofSectionShell({
  title,
  subtitle,
  children,
  template,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  children: ReactNode;
  template: string;
}) {
  return (
    <section className="py-6 sm:py-8" data-template={template}>
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6">
        {(title || subtitle) ? (
          <header className="mb-4 max-w-2xl">
            {title ? (
              <h2 className="font-heading text-[1.55rem] font-semibold tracking-tight text-foreground sm:text-[2rem]">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1.5 text-sm leading-relaxed text-muted sm:text-[0.95rem]">{subtitle}</p>
            ) : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
