import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildContactFormInitialValues,
  validateContactFormValues,
} from "@/components/storefront/contact/dynamic-contact-form";
import { STOREFRONT_API_PATHS } from "@/lib/contracts/storefront-v1";
import { postContactForm } from "@/lib/fetchers/contact";
import type { StorefrontContactForm } from "@/lib/storefront-api";

const CONTACT_FORM = {
  enabled: true,
  title: "Escribinos",
  fields: [
    {
      id: "field_name",
      key: "name",
      type: "text",
      label: "Nombre",
      required: true,
      order: 1,
      validation: { minLength: 2 },
    },
    {
      id: "field_email",
      key: "email",
      type: "email",
      label: "Email",
      required: true,
      order: 2,
    },
    {
      id: "field_reason",
      key: "reason",
      type: "select",
      label: "Motivo",
      required: true,
      order: 3,
      options: [
        { label: "Ventas", value: "sales" },
        { label: "Soporte", value: "support" },
      ],
    },
    {
      id: "field_quantity",
      key: "quantity",
      type: "number",
      label: "Cantidad",
      required: false,
      order: 4,
      validation: { min: 1, max: 10 },
    },
    {
      id: "field_terms",
      key: "terms",
      type: "checkbox",
      label: "Acepto ser contactado",
      required: true,
      order: 5,
    },
    {
      id: "field_source",
      key: "source",
      type: "hidden",
      required: false,
      order: 6,
      defaultValue: "contact-page",
    },
  ],
} satisfies StorefrontContactForm;

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("contact form helpers", () => {
  it("arma valores iniciales con defaults visibles y hidden sin renderizar", () => {
    expect(buildContactFormInitialValues(CONTACT_FORM.fields)).toEqual({
      name: "",
      email: "",
      reason: "",
      quantity: "",
      terms: false,
      source: "contact-page",
    });
  });

  it("valida required, email, select option, checkbox requerido y rango numerico", () => {
    const errors = validateContactFormValues(CONTACT_FORM.fields, {
      name: "A",
      email: "correo-invalido",
      reason: "billing",
      quantity: 11,
      terms: false,
      source: "contact-page",
    });

    expect(errors).toEqual({
      name: "Ingresá al menos 2 caracteres.",
      email: "Ingresá un email válido.",
      reason: "Seleccioná una opción válida.",
      quantity: "Ingresá un valor menor o igual a 10.",
      terms: "Este campo es obligatorio.",
    });
  });
});

describe("postContactForm", () => {
  it("envia el body canonico al endpoint contact del backend PyME", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { message: "Recibimos tu consulta", submissionId: "sub_123" },
        }),
        { status: 200 },
      ),
    );

    vi.stubEnv("PYME_API_BASE_URL", "https://erp.pyme.test");
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      postContactForm(
        {
          host: "bym.test",
          requestId: "req_contact_1",
          storefrontVersion: "storefront@test",
          tenantSlug: "bym",
        },
        {
          values: {
            name: "Bautista",
            email: "bauti@test.com",
            reason: "sales",
            quantity: 2,
            terms: true,
            source: "contact-page",
          },
        },
      ),
    ).resolves.toEqual({
      message: "Recibimos tu consulta",
      submissionId: "sub_123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `https://erp.pyme.test${STOREFRONT_API_PATHS.contact}`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          values: {
            name: "Bautista",
            email: "bauti@test.com",
            reason: "sales",
            quantity: 2,
            terms: true,
            source: "contact-page",
          },
        }),
      }),
    );
  });
});
