import { z } from "zod";

export type SocialProofTemplateId = "mini" | "carousel" | "grid";

export const SocialProofContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
});

export type SocialProofContent = z.infer<typeof SocialProofContentSchema>;

export interface SocialProofModule {
  id: string;
  type: "socialProof";
  variant: SocialProofTemplateId;
  content: SocialProofContent;
  empresaId?: string;
  tenantSlug?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeSocialProofContent(input: unknown): SocialProofContent {
  const content = isRecord(input) ? input : {};

  return {
    ...(readString(content.title) ? { title: readString(content.title) } : {}),
    ...(readString(content.subtitle) ? { subtitle: readString(content.subtitle) } : {}),
  };
}
