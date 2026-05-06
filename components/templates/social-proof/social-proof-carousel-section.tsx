import { SocialProofCarousel } from "@/components/social-proof/social-proof-carousel";
import type { SocialProofModule } from "@/lib/modules/social-proof";

import { SocialProofSectionShell } from "./shared";

export function SocialProofCarouselSection({ module }: { module: SocialProofModule }) {
  return (
    <SocialProofSectionShell
      title={module.content.title}
      subtitle={module.content.subtitle}
      template="social-proof-carousel"
    >
      <SocialProofCarousel empresaId={module.empresaId} tenantSlug={module.tenantSlug} />
    </SocialProofSectionShell>
  );
}
