import { SocialProofGrid } from "@/components/social-proof/social-proof-grid";
import type { SocialProofModule } from "@/lib/modules/social-proof";

import { SocialProofSectionShell } from "./shared";

export function SocialProofGridSection({ module }: { module: SocialProofModule }) {
  return (
    <SocialProofSectionShell
      title={module.content.title}
      subtitle={module.content.subtitle}
      template="social-proof-grid"
    >
      <SocialProofGrid empresaId={module.empresaId} tenantSlug={module.tenantSlug} />
    </SocialProofSectionShell>
  );
}
