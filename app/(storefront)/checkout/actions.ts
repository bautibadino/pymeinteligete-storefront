"use server";

import { redirect } from "next/navigation";

import { canAccessCheckout } from "@/app/(storefront)/_lib/storefront-shell-data";
import {
  resolveCheckoutStrategy,
} from "@/lib/checkout/strategy";
import {
  buildFieldErrors,
  hasFieldErrors,
  parseItems,
  readTrimmedString,
} from "@/lib/checkout/validation";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import {
  StorefrontApiError,
  getBootstrap,
  postCheckout,
  postManualPayment,
  type StorefrontManualPaymentRequest,
} from "@/lib/storefront-api";

export type CheckoutActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<import("@/lib/checkout/validation").CheckoutFieldName, string>>;
};

export type ManualPaymentActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialCheckoutActionState: CheckoutActionState = {
  status: "idle",
};

export const initialManualPaymentActionState: ManualPaymentActionState = {
  status: "idle",
};

/**
 * Estrategias de pago soportadas en el formulario de checkout.
 * - "none": crea la orden y redirige a confirmación sin intentar pago.
 * - "manual": crea la orden y redirige a confirmación; el usuario completa el pago manual desde allí.
 * - "auto": TODO bloqueado por contrato — requiere paymentData de proveedor (token de MP, etc.)
 *   que el frontend todavía no genera de forma segura. No activar hasta tener integración real.
 */
type PaymentStrategy = "none" | "manual" | "auto";

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
  const paymentStrategy = (readTrimmedString(formData, "paymentStrategy") as PaymentStrategy) || "none";
  let confirmationUrl: `/checkout/confirmacion/${string}`;

  try {
    const bootstrap = await getBootstrap(runtime.context);

    if (!canAccessCheckout(bootstrap.shopStatus)) {
      return {
        status: "error",
        message: "La tienda actual no permite crear nuevas órdenes porque no está `active`.",
      };
    }

    const strategyResult = resolveCheckoutStrategy(paymentStrategy);

    if (!strategyResult.allowed) {
      return {
        status: "error",
        message: strategyResult.message,
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

    confirmationUrl = `/checkout/confirmacion/${encodeURIComponent(checkout.orderToken)}`;

    // "none" y "manual" redirigen a confirmación; en "manual" el usuario completa el pago desde allí.
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

export async function submitManualPaymentAction(
  _previousState: ManualPaymentActionState,
  formData: FormData,
): Promise<ManualPaymentActionState> {
  const token = readTrimmedString(formData, "orderToken");
  const amountRaw = readTrimmedString(formData, "amount");
  const paymentMethodId = readTrimmedString(formData, "paymentMethodId");
  const reference = readTrimmedString(formData, "reference");
  const notes = readTrimmedString(formData, "notes");

  if (!token) {
    return {
      status: "error",
      message: "Falta el token de la orden para registrar el pago manual.",
    };
  }

  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      status: "error",
      message: "Ingresá un monto válido mayor a cero.",
    };
  }

  if (!paymentMethodId) {
    return {
      status: "error",
      message: "Seleccioná un método de pago manual.",
    };
  }

  const runtime = await getStorefrontRuntimeSnapshot();

  try {
    const payload: StorefrontManualPaymentRequest = {
      amount,
      paymentMethodId,
      ...(reference ? { reference } : {}),
      ...(notes ? { notes } : {}),
    };

    await postManualPayment(runtime.context, token, payload);

    return {
      status: "success",
      message: "El pago manual se registró correctamente. El estado de la orden se actualizará en breve.",
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
      message: "No se pudo registrar el pago manual en este momento.",
    };
  }
}
