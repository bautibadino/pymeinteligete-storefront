import { SocialProofMini } from "@/components/social-proof/social-proof-mini";
import type { SocialProofModule } from "@/lib/modules/social-proof";

import { SocialProofSectionShell } from "./shared";

export function SocialProofMiniSection({ module }: { module: SocialProofModule }) {
  return (
    <SocialProofSectionShell
      title={module.content.title}
      subtitle={module.content.subtitle}
      template="social-proof-mini"
    >
      <div className="inline-flex rounded-[1.25rem] border border-border/70 bg-white/94 px-4 py-3 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.26)]">
        <SocialProofMini
          empresaId={module.empresaId}
          tenantSlug={module.tenantSlug}
          className="max-w-full"
        />
      </div>
    </SocialProofSectionShell>
  );
}
