import type { HeroModule, StorefrontModule } from "@/lib/modules";
import { isHeroTemplateId, type HeroTemplateId } from "@/lib/templates/hero-catalog";

/**
 * Lee un template override desde query string (p. ej. `?hero=workshop`).
 * Sólo se acepta si matchea un template conocido. Pensado para
 * preview manual y debugging sin tocar la config del tenant.
 */
function readHeroOverride(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined> | undefined,
): HeroTemplateId | undefined {
  if (!searchParams) {
    return undefined;
  }

  const raw =
    searchParams instanceof URLSearchParams
      ? searchParams.get("hero")
      : (() => {
          const value = searchParams["hero"];
          return Array.isArray(value) ? value[0] : value;
        })();

  if (typeof raw !== "string") {
    return undefined;
  }

  const normalized = raw.trim();

  return isHeroTemplateId(normalized) ? (normalized as HeroTemplateId) : undefined;
}

/**
 * Devuelve una copia de los módulos con los overrides de template
 * aplicados. No muta la data original — eso permite que el mismo
 * bootstrap alimente preview y producción sin interferir.
 */
export function applyTemplateOverrides(
  modules: StorefrontModule[],
  searchParams?: URLSearchParams | Record<string, string | string[] | undefined>,
): StorefrontModule[] {
  const heroOverride = readHeroOverride(searchParams);

  if (!heroOverride) {
    return modules;
  }

  return modules.map((module) => {
    if (module.type === "hero") {
      const overridden: HeroModule = { ...module, variant: heroOverride };
      return overridden;
    }
    return module;
  });
}
