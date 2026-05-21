"use client";

import { getStorefrontAnalyticsBridge } from "@/lib/analytics/client";
import { enrichAnalyticsIdentity } from "@/lib/analytics/identity";
import type {
  StorefrontContactFormField,
  StorefrontContactFormValue,
} from "@/lib/storefront-api";

type ContactAnalyticsIdentityInput = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

type ContactFormValues = Record<string, StorefrontContactFormValue | "">;

function normalizeStringValue(value: StorefrontContactFormValue | ""): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue || undefined;
}

function matchesField(field: StorefrontContactFormField, pattern: RegExp): boolean {
  const candidates = [
    field.key,
    field.label,
    field.placeholder,
    field.helperText,
  ];

  return candidates.some((candidate) => pattern.test(candidate ?? ""));
}

function resolveContactFormIdentity(
  fields: StorefrontContactFormField[],
  values: ContactFormValues,
): ContactAnalyticsIdentityInput {
  const identity: ContactAnalyticsIdentityInput = {};

  for (const field of fields) {
    const fieldValue = normalizeStringValue(values[field.key] ?? "");

    if (!fieldValue) {
      continue;
    }

    if (!identity.email && (field.type === "email" || matchesField(field, /\b(e-?mail|correo)\b/i))) {
      identity.email = fieldValue;
      continue;
    }

    if (!identity.phone && (field.type === "phone" || matchesField(field, /\b(phone|telefono|tel[eé]fono|celular|whatsapp)\b/i))) {
      identity.phone = fieldValue;
      continue;
    }

    if (!identity.name && matchesField(field, /\b(nombre|apellido|contacto|raz[oó]n social)\b/i)) {
      identity.name = fieldValue;
      continue;
    }

    if (!identity.city && matchesField(field, /\b(ciudad|localidad)\b/i)) {
      identity.city = fieldValue;
      continue;
    }

    if (!identity.province && matchesField(field, /\b(provincia|estado)\b/i)) {
      identity.province = fieldValue;
      continue;
    }

    if (!identity.postalCode && matchesField(field, /\b(c[oó]digo postal|cp|postal)\b/i)) {
      identity.postalCode = fieldValue;
    }
  }

  return identity;
}

function compactContactAnalyticsIdentity(
  identityInput: ContactAnalyticsIdentityInput,
) {
  return {
    ...(identityInput.name ? { name: identityInput.name } : {}),
    ...(identityInput.email ? { email: identityInput.email } : {}),
    ...(identityInput.phone ? { phone: identityInput.phone } : {}),
    ...(identityInput.city ? { city: identityInput.city } : {}),
    ...(identityInput.province ? { province: identityInput.province } : {}),
    ...(identityInput.postalCode ? { postalCode: identityInput.postalCode } : {}),
  };
}

export function identifyContactAnalyticsBuyer(
  identityInput: ContactAnalyticsIdentityInput,
) {
  const bridge = getStorefrontAnalyticsBridge();

  if (!bridge) {
    return;
  }

  bridge.identify(
    enrichAnalyticsIdentity(
      bridge.getIdentity(),
      compactContactAnalyticsIdentity(identityInput),
    ),
  );
}

export function identifyContactAnalyticsBuyerFromForm(
  fields: StorefrontContactFormField[],
  values: ContactFormValues,
) {
  identifyContactAnalyticsBuyer(resolveContactFormIdentity(fields, values));
}
