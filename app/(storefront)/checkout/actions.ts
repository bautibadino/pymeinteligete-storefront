"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { canAccessCheckout } from "@/app/(storefront)/_lib/storefront-shell-data";
import type {
  CheckoutActionState,
  ManualPaymentActionState,
} from "@/app/(storefront)/checkout/action-state";
import { readAnalyticsIdentityFromRequest } from "@/lib/analytics/server";
import { resolveCheckoutStrategy } from "@/lib/checkout/strategy";
import {
  buildFieldErrors,
  hasFieldErrors,
  parseItems,
  readValidShippingQuoteSnapshot,
  readTrimmedString,
} from "@/lib/checkout/validation";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import {
  StorefrontApiError,
  getBootstrap,
  postCartValidate,
  postCheckout,
  postManualPayment,
  processPayment,
} from "@/lib/storefront-api";
import {
  getShippingDeliveryMode,
  requiresHomeShippingAddress,
} from "@/lib/shipping/checkout-shipping";
import type {
  StorefrontAddressInput,
  StorefrontShippingCheckoutSnapshot,
} from "@/lib/types/storefront";

type PaymentStrategy = "none" | "manual" | "auto";

function readShippingQuoteSnapshot(
  formData: FormData,
): StorefrontShippingCheckoutSnapshot | null {
  return readValidShippingQuoteSnapshot(formData);
}

function splitStreetAddress(value: string | undefined): { street: string; number: string } {
  if (!value?.trim()) {
    return { street: "", number: "" };
  }

  const trimmed = value.trim();
  const match = trimmed.match(/^(.*?)(?:\s+(\d+[a-zA-Z]?))?$/);

  return {
    street: match?.[1]?.trim() || trimmed,
    number: match?.[2]?.trim() || "S/N",
  };
}

function buildShippingAddress(
  formData: FormData,
  snapshot: StorefrontShippingCheckoutSnapshot | null,
): StorefrontAddressInput | undefined {
  if (!snapshot || requiresHomeShippingAddress(snapshot)) {
    return {
      street: readTrimmedString(formData, "shippingStreet"),
      number: readTrimmedString(formData, "shippingNumber"),
      city: readTrimmedString(formData, "shippingCity"),
      province: readTrimmedString(formData, "shippingProvince"),
      postalCode: readTrimmedString(formData, "shippingPostalCode"),
      ...(readTrimmedString(formData, "shippingNotes")
        ? { notes: readTrimmedString(formData, "shippingNotes") }
        : {}),
    };
  }

  const mode = getShippingDeliveryMode(snapshot);
  if (mode === "carrier_branch" && !snapshot.selectedCarrierBranch) {
    return undefined;
  }

  const location =
    mode === "carrier_branch" ? snapshot.selectedCarrierBranch : snapshot.pickupLocation;
  const fallbackAddress = splitStreetAddress(location?.address);

  return {
    street: location?.street ?? fallbackAddress.street,
    number: location?.number ?? fallbackAddress.number,
    city: location?.city ?? "",
    province: location?.province ?? "",
    postalCode: location?.postalCode ?? snapshot.destinationPostalCode,
    ...(readTrimmedString(formData, "shippingNotes")
      ? { notes: readTrimmedString(formData, "shippingNotes") }
      : {}),
  };
}

function buildDeliverySelection(snapshot: StorefrontShippingCheckoutSnapshot | null) {
  if (!snapshot) return undefined;
  const deliveryType = getShippingDeliveryMode(snapshot);
  return {
    deliveryType,
    provider: snapshot.provider,
    carrierName: snapshot.carrierName,
    serviceName: snapshot.serviceName,
    ...(snapshot.selectedCarrierBranch
      ? { selectedCarrierBranch: snapshot.selectedCarrierBranch }
      : {}),
    ...(snapshot.pickupLocation ? { selectedPickupLocation: snapshot.pickupLocation } : {}),
  };
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
  const paymentStrategy = (readTrimmedString(formData, "paymentStrategy") as PaymentStrategy) || "none";
  const selectedPaymentMethodId = readTrimmedString(formData, "paymentMethodId");

  if (paymentStrategy === "manual" && !selectedPaymentMethodId) {
    return {
      status: "error",
      message: "Seleccioná un método de pago para continuar.",
    };
  }

  try {
    const bootstrap = await getBootstrap(runtime.context);
    const analyticsIdentity = await readAnalyticsIdentityFromRequest();
    const items = parseItems(formData);
    const shippingQuoteSnapshot = readShippingQuoteSnapshot(formData);
    const shippingAddress = buildShippingAddress(formData, shippingQuoteSnapshot);
    const deliverySelection = buildDeliverySelection(shippingQuoteSnapshot);

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

    const cartValidation = await postCartValidate(runtime.context, { items });
    if (!cartValidation.isValid) {
      return {
        status: "error",
        message:
          cartValidation.warnings[0] ??
          "El carrito cambió y necesita validación antes de finalizar la compra.",
        cartValidation,
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
        ...(readTrimmedString(formData, "customerTaxId")
          ? { taxId: readTrimmedString(formData, "customerTaxId") }
          : {}),
        ...(readTrimmedString(formData, "customerTaxIdType")
          ? { taxIdType: readTrimmedString(formData, "customerTaxIdType") }
          : {}),
        ...(readTrimmedString(formData, "customerTaxCondition")
          ? { taxCondition: readTrimmedString(formData, "customerTaxCondition") }
          : {}),
      },
      ...(shippingAddress ? { shippingAddress } : {}),
      ...(shippingQuoteSnapshot ? { shippingQuoteSnapshot } : {}),
      ...(deliverySelection ? { deliverySelection } : {}),
      items,
      ...(paymentStrategy === "manual" && selectedPaymentMethodId
        ? { paymentMethodId: selectedPaymentMethodId }
        : {}),
      ...(readTrimmedString(formData, "billingStreet") &&
      readTrimmedString(formData, "billingNumber") &&
      readTrimmedString(formData, "billingCity") &&
      readTrimmedString(formData, "billingProvince") &&
      readTrimmedString(formData, "billingPostalCode")
        ? {
            billingAddress: {
              street: readTrimmedString(formData, "billingStreet"),
              number: readTrimmedString(formData, "billingNumber"),
              city: readTrimmedString(formData, "billingCity"),
              province: readTrimmedString(formData, "billingProvince"),
              postalCode: readTrimmedString(formData, "billingPostalCode"),
            },
          }
        : {}),
      ...(readTrimmedString(formData, "orderNotes")
        ? { notes: readTrimmedString(formData, "orderNotes") }
        : {}),
      idempotencyKey: readTrimmedString(formData, "idempotencyKey"),
      ...(analyticsIdentity ? { analytics: analyticsIdentity } : {}),
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

    if (paymentStrategy === "manual") {
      redirect(
        `/checkout/confirmacion/${encodeURIComponent(checkout.orderToken)}?method=${encodeURIComponent(selectedPaymentMethodId)}`,
      );
    }

    redirect(`/checkout/confirmacion/${encodeURIComponent(checkout.orderToken)}`);
  } catch (error) {
    unstable_rethrow(error);

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
    unstable_rethrow(error);

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
    unstable_rethrow(error);

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
