"use server";

import { redirect } from "next/navigation";

import { canAccessCheckout } from "@/app/(storefront)/_lib/storefront-shell-data";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import { StorefrontApiError, getBootstrap, postCheckout } from "@/lib/storefront-api";

export type CheckoutActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<CheckoutFieldName, string>>;
};

type CheckoutFieldName =
  | "customerName"
  | "customerEmail"
  | "shippingStreet"
  | "shippingNumber"
  | "shippingCity"
  | "shippingProvince"
  | "shippingPostalCode"
  | "items";

export const initialCheckoutActionState: CheckoutActionState = {
  status: "idle",
};

type ParsedCheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutFieldErrors = Partial<Record<CheckoutFieldName, string>>;

function readTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseItems(formData: FormData): ParsedCheckoutItem[] {
  const productIds = formData.getAll("itemProductId");
  const quantities = formData.getAll("itemQuantity");
  const items: ParsedCheckoutItem[] = [];

  for (let index = 0; index < productIds.length; index += 1) {
    const rawProductId = productIds[index];
    const rawQuantity = quantities[index];
    const productId = typeof rawProductId === "string" ? rawProductId.trim() : "";
    const quantityValue = typeof rawQuantity === "string" ? Number(rawQuantity) : Number.NaN;

    if (!productId) {
      continue;
    }

    items.push({
      productId,
      quantity: Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 0,
    });
  }

  return items;
}

function buildFieldErrors(formData: FormData): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const items = parseItems(formData);

  if (!readTrimmedString(formData, "customerName")) {
    errors.customerName = "Ingresá el nombre del cliente.";
  }

  if (!readTrimmedString(formData, "customerEmail")) {
    errors.customerEmail = "Ingresá un email válido para el pedido.";
  }

  if (!readTrimmedString(formData, "shippingStreet")) {
    errors.shippingStreet = "Ingresá la calle de entrega.";
  }

  if (!readTrimmedString(formData, "shippingNumber")) {
    errors.shippingNumber = "Ingresá la numeración.";
  }

  if (!readTrimmedString(formData, "shippingCity")) {
    errors.shippingCity = "Ingresá la ciudad.";
  }

  if (!readTrimmedString(formData, "shippingProvince")) {
    errors.shippingProvince = "Ingresá la provincia.";
  }

  if (!readTrimmedString(formData, "shippingPostalCode")) {
    errors.shippingPostalCode = "Ingresá el código postal.";
  }

  if (items.length === 0 || items.some((item) => item.quantity <= 0)) {
    errors.items = "Necesitás al menos un producto con cantidad mayor a cero.";
  }

  return errors;
}

function hasFieldErrors(fieldErrors: CheckoutFieldErrors): boolean {
  return Object.keys(fieldErrors).length > 0;
}

export async function submitCheckoutAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const fieldErrors = buildFieldErrors(formData);

  if (hasFieldErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Revisá los datos mínimos del formulario antes de crear la orden.",
      fieldErrors,
    };
  }

  const runtime = await getStorefrontRuntimeSnapshot();
  let confirmationUrl: `/checkout/confirmacion/${string}`;

  try {
    const bootstrap = await getBootstrap(runtime.context);

    if (!canAccessCheckout(bootstrap.shopStatus)) {
      return {
        status: "error",
        message: "La tienda actual no permite crear nuevas órdenes porque no está `active`.",
      };
    }

    const checkout = await postCheckout(runtime.context, {
      customer: {
        name: readTrimmedString(formData, "customerName"),
        email: readTrimmedString(formData, "customerEmail"),
        ...(readTrimmedString(formData, "customerPhone")
          ? { phone: readTrimmedString(formData, "customerPhone") }
          : {}),
        ...(readTrimmedString(formData, "customerDni")
          ? { dni: readTrimmedString(formData, "customerDni") }
          : {}),
      },
      shippingAddress: {
        street: readTrimmedString(formData, "shippingStreet"),
        number: readTrimmedString(formData, "shippingNumber"),
        city: readTrimmedString(formData, "shippingCity"),
        province: readTrimmedString(formData, "shippingProvince"),
        postalCode: readTrimmedString(formData, "shippingPostalCode"),
        ...(readTrimmedString(formData, "shippingNotes")
          ? { notes: readTrimmedString(formData, "shippingNotes") }
          : {}),
      },
      items: parseItems(formData),
      ...(readTrimmedString(formData, "orderNotes")
        ? { notes: readTrimmedString(formData, "orderNotes") }
        : {}),
      idempotencyKey: readTrimmedString(formData, "idempotencyKey"),
    });

    // TODO: no llamamos a processPayment() en esta fase porque el frontend todavía no genera
    // paymentData seguro de proveedor. Forzar ese payload ahora inventaría contrato.
    confirmationUrl = `/checkout/confirmacion/${encodeURIComponent(checkout.orderToken)}`;
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "No se pudo crear la orden en este momento.",
    };
  }

  redirect(confirmationUrl);
}
