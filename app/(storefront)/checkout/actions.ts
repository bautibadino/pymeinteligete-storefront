"use server";

import { redirect } from "next/navigation";

import { canAccessCheckout } from "@/app/(storefront)/_lib/storefront-shell-data";
import type { ManualPaymentSuccessSource } from "@/lib/checkout/manual-payment";
import { resolveCheckoutStrategy } from "@/lib/checkout/strategy";
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
  processPayment,
} from "@/lib/storefront-api";

export type CheckoutActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<import("@/lib/checkout/validation").CheckoutFieldName, string>>;
  orderId?: string;
  orderToken?: string;
  orderNumber?: string;
  total?: number;
  payerEmail?: string;
};

export type ManualPaymentActionState = {
  status: "idle" | "success" | "error";
  message?: string;
} & Partial<ManualPaymentSuccessSource>;

export const initialCheckoutActionState: CheckoutActionState = {
  status: "idle",
};

export const initialManualPaymentActionState: ManualPaymentActionState = {
  status: "idle",
};

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

  try {
    const bootstrap = await getBootstrap(runtime.context);

    if (!canAccessCheckout(bootstrap.tenant.status)) {
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

    if (paymentStrategy === "auto") {
      // Flujo legacy de 2 pasos: primero crear orden, luego mostrar Payment Brick.
      // Devolvemos los datos de la orden para que el cliente avance al paso de pago.
      return {
        status: "success",
        orderId: checkout.orderId,
        orderToken: checkout.orderToken,
        orderNumber: checkout.orderNumber,
        total: checkout.total,
        payerEmail: checkout.payerEmail,
      };
    }

    // "none" y "manual" redirigen a confirmación.
    redirect(`/checkout/confirmacion/${encodeURIComponent(checkout.orderToken)}`);
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "No se pudo crear la orden o procesar el pago en este momento.",
    };
  }
}

/**
 * Procesa el pago automático para una orden ya creada.
 * Usada por el Payment Brick en el flujo de 2 pasos (legacy parity).
 */
export async function processPaymentAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const orderId = readTrimmedString(formData, "orderId");
  const orderToken = readTrimmedString(formData, "orderToken");
  const paymentToken = readTrimmedString(formData, "paymentToken");
  const paymentMethodId = readTrimmedString(formData, "paymentMethodId");
  const installments = Number(readTrimmedString(formData, "installments")) || 1;
  const payerEmail = readTrimmedString(formData, "payerEmail");
  const payerIdType = readTrimmedString(formData, "payerIdType");
  const payerIdNumber = readTrimmedString(formData, "payerIdNumber");
  const issuerId = readTrimmedString(formData, "issuerId");

  if (!orderId || !orderToken) {
    return {
      status: "error",
      message: "Faltan datos de la orden para procesar el pago.",
    };
  }

  if (!paymentMethodId) {
    return {
      status: "error",
      message: "Falta el método de pago.",
    };
  }

  const runtime = await getStorefrontRuntimeSnapshot();

  try {
    const paymentResult = await processPayment(runtime.context, {
      orderId,
      idempotencyKey: crypto.randomUUID(),
      paymentData: {
        ...(paymentToken ? { token: paymentToken } : {}),
        payment_method_id: paymentMethodId,
        transaction_amount: Number(readTrimmedString(formData, "transactionAmount")) || 0,
        installments,
        ...(issuerId ? { issuer_id: issuerId } : {}),
        payer: {
          email: payerEmail,
          ...(payerIdType && payerIdNumber
            ? {
                identification: {
                  type: payerIdType,
                  number: payerIdNumber,
                },
              }
            : {}),
        },
      },
    });

    if (paymentResult.status === "approved" || paymentResult.status === "pending") {
      redirect(`/checkout/confirmacion/${encodeURIComponent(orderToken)}`);
    }

    return {
      status: "error",
      message: `El pago no pudo completarse (${paymentResult.statusDetail || paymentResult.status}). La orden ya fue creada; podés completar el pago manualmente desde la confirmación.`,
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
      message: "No se pudo procesar el pago en este momento.",
    };
  }
}

export async function submitManualPaymentAction(
  _previousState: ManualPaymentActionState,
  formData: FormData,
): Promise<ManualPaymentActionState> {
  const token = readTrimmedString(formData, "orderToken");
  const methodId = readTrimmedString(formData, "methodId");

  if (!token) {
    return {
      status: "error",
      message: "Falta el token de la orden para iniciar el pago manual.",
    };
  }

  if (!methodId) {
    return {
      status: "error",
      message: "Seleccioná un método de pago manual.",
    };
  }

  const runtime = await getStorefrontRuntimeSnapshot();

  try {
    const manualPayment = await postManualPayment(runtime.context, token, { methodId });

    return {
      status: "success",
      message: "Seguí estas instrucciones para completar el pago manual de la orden.",
      paymentAttemptId: manualPayment.paymentAttemptId,
      orderId: manualPayment.orderId,
      orderToken: manualPayment.orderToken,
      amount: manualPayment.amount,
      methodDisplayName: manualPayment.methodDisplayName,
      ...(manualPayment.instructions ? { instructions: manualPayment.instructions } : {}),
      ...(manualPayment.bankAccounts ? { bankAccounts: manualPayment.bankAccounts } : {}),
      ...(manualPayment.contactInfo ? { contactInfo: manualPayment.contactInfo } : {}),
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
      message: "No se pudo iniciar el pago manual en este momento.",
    };
  }
}
