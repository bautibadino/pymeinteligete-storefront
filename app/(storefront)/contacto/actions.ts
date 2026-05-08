"use server";

import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import {
  StorefrontApiError,
  getBootstrap,
  postContactForm,
} from "@/lib/storefront-api";
import type {
  StorefrontContactFormField,
  StorefrontContactFormSubmissionRequest,
  StorefrontContactFormValue,
} from "@/lib/storefront-api";

export type ContactFormActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  submissionId?: string;
};

export const initialContactFormActionState: ContactFormActionState = {
  status: "idle",
};

function readLastFormDataValue(formData: FormData, key: string): FormDataEntryValue | null {
  const values = formData.getAll(key);
  return values[values.length - 1] ?? null;
}

function readStringValue(formData: FormData, key: string): string {
  const value = readLastFormDataValue(formData, key);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeDefaultValue(field: StorefrontContactFormField): StorefrontContactFormValue {
  return field.defaultValue ?? null;
}

function readContactFieldValue(
  field: StorefrontContactFormField,
  formData: FormData,
): StorefrontContactFormValue {
  if (field.type === "hidden") {
    return normalizeDefaultValue(field);
  }

  const rawValue = readStringValue(formData, field.key);

  if (field.type === "checkbox") {
    return rawValue === "true" || rawValue === "on";
  }

  if (field.type === "number") {
    if (!rawValue) {
      return null;
    }

    const numberValue = Number(rawValue);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  return rawValue || null;
}

function buildContactSubmissionRequest(
  fields: StorefrontContactFormField[],
  formData: FormData,
): StorefrontContactFormSubmissionRequest {
  const values = fields.reduce<Record<string, StorefrontContactFormValue>>((accumulator, field) => {
    accumulator[field.key] = readContactFieldValue(field, formData);
    return accumulator;
  }, {});
  const website = readStringValue(formData, "website");

  return {
    values,
    ...(website ? { website } : {}),
  };
}

export async function submitContactAction(
  _previousState: ContactFormActionState,
  formData: FormData,
): Promise<ContactFormActionState> {
  const runtime = await getStorefrontRuntimeSnapshot();

  try {
    const bootstrap = await getBootstrap(runtime.context);
    const contactForm = bootstrap.contactForm;

    if (!contactForm?.enabled || contactForm.fields.length === 0) {
      return {
        status: "error",
        message: "El formulario de contacto no está disponible en este momento.",
      };
    }

    const result = await postContactForm(
      runtime.context,
      buildContactSubmissionRequest(contactForm.fields, formData),
    );

    return {
      status: "success",
      message:
        result.message ??
        contactForm.successMessage ??
        "Recibimos tu consulta. Te vamos a responder por los canales informados.",
      ...(result.submissionId ? { submissionId: result.submissionId } : {}),
    };
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "No pudimos enviar la consulta en este momento. Intentá nuevamente.",
    };
  }
}
