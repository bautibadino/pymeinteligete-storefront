import { z } from "zod";

import type { SocialProofModule } from "@/lib/modules/social-proof";

export type SocialProofTemplateId = SocialProofModule["variant"];

export const SOCIAL_PROOF_TEMPLATE_IDS: readonly SocialProofTemplateId[] = [
  "mini",
  "carousel",
  "grid",
];

export const DEFAULT_SOCIAL_PROOF_TEMPLATE_ID: SocialProofTemplateId = "carousel";

export type SocialProofTemplateDescriptor = {
  id: SocialProofTemplateId;
  label: string;
  description: string;
  bestFor: string[];
  thumbnailUrl: string;
  contentSchema: z.ZodTypeAny;
};

export const SocialProofContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export const SOCIAL_PROOF_TEMPLATE_DESCRIPTORS: Record<
  SocialProofTemplateId,
  SocialProofTemplateDescriptor
> = {
  mini: {
    id: "mini",
    label: "Resumen compacto",
    description: "Sello breve con rating, cantidad y avatares reales.",
    bestFor: ["header de sección", "soporte editorial", "PDP y home"],
    thumbnailUrl: "/template-thumbnails/social-proof-mini.svg",
    contentSchema: SocialProofContentSchema,
  },
  carousel: {
    id: "carousel",
    label: "Carrusel de reseñas",
    description: "Bloque principal con cards de reseñas y promedio visible.",
    bestFor: ["home", "landings comerciales", "secciones de confianza"],
    thumbnailUrl: "/template-thumbnails/social-proof-carousel.svg",
    contentSchema: SocialProofContentSchema,
  },
  grid: {
    id: "grid",
    label: "Grilla de reseñas",
    description: "Varias reseñas visibles de un vistazo con lectura rápida.",
    bestFor: ["PDP", "institucional", "secciones amplias"],
    thumbnailUrl: "/template-thumbnails/social-proof-grid.svg",
    contentSchema: SocialProofContentSchema,
  },
};

export function isSocialProofTemplateId(value: unknown): value is SocialProofTemplateId {
  return (
    typeof value === "string" &&
    (SOCIAL_PROOF_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}

export function resolveSocialProofTemplateId(value: unknown): SocialProofTemplateId {
  return isSocialProofTemplateId(value) ? value : DEFAULT_SOCIAL_PROOF_TEMPLATE_ID;
}
