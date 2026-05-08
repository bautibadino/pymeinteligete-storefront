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

function readNestedString(record: Record<string, unknown>, key: string, nestedKeys: string[]): string | undefined {
  const value = record[key];

  if (typeof value === "string") {
    return readString(value);
  }

  if (!isRecord(value)) {
    return undefined;
  }

  for (const nestedKey of nestedKeys) {
    const nestedValue = readString(value[nestedKey]);
    if (nestedValue) return nestedValue;
  }

  return undefined;
}

function readFirstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = readString(record[key]);
    if (value) return value;
  }

  return undefined;
}

export function normalizeSocialProofContent(input: unknown): SocialProofContent {
  const content = isRecord(input) ? input : {};
  const nestedContent = isRecord(content.content) ? content.content : undefined;
  const title =
    readFirstString(content, ["title", "heading", "headline"]) ??
    readNestedString(content, "heading", ["title", "text", "label"]) ??
    readNestedString(content, "header", ["title", "heading", "text"]) ??
    (nestedContent ? readFirstString(nestedContent, ["title", "heading", "headline"]) : undefined);
  const subtitle =
    readFirstString(content, ["subtitle", "description", "summary"]) ??
    readNestedString(content, "heading", ["subtitle", "description", "summary"]) ??
    readNestedString(content, "header", ["subtitle", "description", "summary"]) ??
    (nestedContent ? readFirstString(nestedContent, ["subtitle", "description", "summary"]) : undefined);

  return {
    ...(title ? { title } : {}),
    ...(subtitle ? { subtitle } : {}),
  };
}
