import type { StorefrontBootstrap } from "@/lib/storefront-api";

import {
  SportAdventureContact,
  type SportAdventureContactProps,
} from "@/components/experiences/sportadventure/sportadventure-contact";

export type SportAdventureContactExperienceProps = {
  bootstrap: StorefrontBootstrap | null;
  host: string;
  className?: string;
  contentOverride?: Partial<SportAdventureContactProps["content"]>;
};

const BRAND_NAME = "SportAdventure";

function resolveDisplayName(
  bootstrap: StorefrontBootstrap | null,
  host: string,
): string {
  const candidates = [
    bootstrap?.branding?.name,
    bootstrap?.branding?.storeName,
    bootstrap?.tenant?.displayName,
    bootstrap?.tenant?.tenantSlug,
    host,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      const normalized = value.trim();
      if (/sport\s*adventure/i.test(normalized)) {
        return BRAND_NAME;
      }
    }
  }

  return BRAND_NAME;
}

function toWhatsappHref(whatsapp?: string | null) {
  if (!whatsapp) {
    return null;
  }

  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

function toTelHref(phone?: string | null) {
  if (!phone) {
    return null;
  }

  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

function toMailHref(email?: string | null) {
  const normalized = email?.trim();
  return normalized ? `mailto:${normalized}` : null;
}

function toMapsHref(address?: string | null) {
  const normalized = address?.trim();
  return normalized
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalized)}`
    : null;
}

export function SportAdventureContactExperience({
  bootstrap,
  host,
  className,
  contentOverride,
}: SportAdventureContactExperienceProps) {
  const brand = resolveDisplayName(bootstrap, host);
  const contact = bootstrap?.contact;
  const logoUrl =
    typeof bootstrap?.branding?.logoUrl === "string" &&
    bootstrap.branding.logoUrl.trim().length > 0
      ? bootstrap.branding.logoUrl.trim()
      : null;

  const baseContent: SportAdventureContactProps["content"] = {
    brand,
    eyebrow: "Consultas · Taller · Repuestos · Equipamiento",
    title: "Tu próxima salida empieza con un mensaje.",
    description:
      "Escribinos para elegir moto, coordinar servicio o encontrar ese equipo que te falta. Te respondemos por el canal más cómodo para vos.",
    primaryAction: {
      label: contact?.whatsapp?.trim() ? "Hablar por WhatsApp" : "Hacer una consulta",
      href: toWhatsappHref(contact?.whatsapp) ?? toMailHref(contact?.email) ?? "#contacto-directo",
    },
    secondaryAction: {
      label: contact?.phone?.trim() ? "Llamar ahora" : "Ver catálogo",
      href: toTelHref(contact?.phone) ?? "/catalogo",
    },
    contactCards: [
      {
        id: "whatsapp",
        label: "WhatsApp",
        value: contact?.whatsapp?.trim() || "Escribinos y coordinamos por mensaje.",
        href: toWhatsappHref(contact?.whatsapp),
        accent: "orange",
      },
      {
        id: "phone",
        label: "Llamadas",
        value: contact?.phone?.trim() || "Atención comercial por teléfono.",
        href: toTelHref(contact?.phone),
        accent: "white",
      },
      {
        id: "email",
        label: "Email",
        value: contact?.email?.trim() || "Dejanos tu consulta y te respondemos.",
        href: toMailHref(contact?.email),
        accent: "orange",
      },
      {
        id: "address",
        label: "Local",
        value: contact?.address?.trim() || "Coordiná visita o retiro con nuestro equipo.",
        href: toMapsHref(contact?.address),
        accent: "white",
      },
    ],
    serviceCards: [
      {
        id: "consultas",
        title: "Consultas",
        description: "Te orientamos para elegir con confianza y sin vueltas.",
      },
      {
        id: "taller",
        title: "Taller",
        description: "Coordiná revisión, servicio o una puesta a punto antes de salir.",
      },
      {
        id: "repuestos",
        title: "Repuestos",
        description: "Encontrá lo que necesitás para seguir rodando sin frenar tus planes.",
      },
      {
        id: "equipamiento",
        title: "Equipamiento",
        description: "Sumá protección, estilo y accesorios para cada aventura.",
      },
    ],
    footerNote:
      contact?.address?.trim() ||
      contact?.phone?.trim() ||
      contact?.email?.trim() ||
      "Dejanos tu consulta y armamos el mejor punto de partida para tu próxima aventura.",
    ...(logoUrl ? { logoUrl } : {}),
  };

  return (
    <SportAdventureContact
      {...(className ? { className } : {})}
      content={{ ...baseContent, ...contentOverride }}
    />
  );
}
