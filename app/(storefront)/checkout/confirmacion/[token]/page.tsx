import type { Metadata } from "next";

import {
  canFetchPaymentMethods,
  loadBootstrapExperience,
} from "@/app/(storefront)/_lib/storefront-shell-data";
import { ConfirmationSummary } from "@/components/storefront/checkout/confirmation-summary";
import { buildTenantMetadata, resolveTenantSeoSnapshot } from "@/lib/seo";
import {
  StorefrontApiError,
  getOrderByToken,
  getPaymentMethods,
  postManualPayment,
  type StorefrontManualPaymentResult,
  type StorefrontOrderByTokenResult,
  type StorefrontPaymentMethod,
} from "@/lib/storefront-api";

type ConfirmationTokenPageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const snapshot = await resolveTenantSeoSnapshot();

  return buildTenantMetadata(snapshot, {
    pathname: "/checkout/confirmacion",
    title: `${snapshot.title} | Confirmacion`,
    noIndex: true,
  });
}

async function resolveOrderByToken(
  context: Awaited<ReturnType<typeof loadBootstrapExperience>>["runtime"]["context"],
  token: string,
): Promise<{
  order: StorefrontOrderByTokenResult | null;
  issue?: string;
}> {
  if (!token) {
    return {
      order: null,
      issue: "Falta el token firmado del pedido.",
    };
  }

  try {
    return {
      order: await getOrderByToken(context, token),
    };
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        order: null,
        issue: error.message,
      };
    }

    return {
      order: null,
      issue: "No se pudo consultar el estado del pedido con el token firmado.",
    };
  }
}

async function resolvePaymentMethodsForConfirmation(
  context: Awaited<ReturnType<typeof loadBootstrapExperience>>["runtime"]["context"],
  shopStatus: import("@/lib/storefront-api").ShopStatus | null,
): Promise<StorefrontPaymentMethod[]> {
  if (!canFetchPaymentMethods(shopStatus)) {
    return [];
  }

  try {
    const methods = await getPaymentMethods(context);

    return methods.paymentMethods ?? [];
  } catch {
    return [];
  }
}

function readSearchParamValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function resolveManualMethodId(input: {
  requestedMethodId: string;
  manualPaymentMethods: StorefrontPaymentMethod[];
}): string {
  const requestedMethod = input.manualPaymentMethods.find(
    (method) => method.methodId === input.requestedMethodId,
  );

  if (requestedMethod) {
    return requestedMethod.methodId;
  }

  if (!input.requestedMethodId && input.manualPaymentMethods.length === 1) {
    return input.manualPaymentMethods[0]?.methodId ?? "";
  }

  return "";
}

async function resolveManualPaymentForConfirmation(input: {
  context: Awaited<ReturnType<typeof loadBootstrapExperience>>["runtime"]["context"];
  order: StorefrontOrderByTokenResult | null;
  token: string;
  methodId: string;
}): Promise<{
  manualPayment?: StorefrontManualPaymentResult;
  manualPaymentIssue?: string;
}> {
  if (!input.order || input.order.isPaid || !input.methodId) {
    return {};
  }

  try {
    return {
      manualPayment: await postManualPayment(input.context, input.token, {
        methodId: input.methodId,
      }),
    };
  } catch (error) {
    if (error instanceof StorefrontApiError) {
      return {
        manualPaymentIssue: error.message,
      };
    }

    return {
      manualPaymentIssue:
        "No pudimos cargar los datos de pago. Contactá al comercio para finalizar la compra.",
    };
  }
}

export default async function CheckoutConfirmationTokenPage({
  params,
  searchParams,
}: ConfirmationTokenPageProps) {
  const [{ token }, resolvedSearchParams, experience] = await Promise.all([
    params,
    searchParams,
    loadBootstrapExperience(),
  ]);
  const [{ order, issue }, paymentMethods] = await Promise.all([
    resolveOrderByToken(experience.runtime.context, token),
    resolvePaymentMethodsForConfirmation(
      experience.runtime.context,
      experience.bootstrap?.tenant.status ?? null,
    ),
  ]);
  const manualPaymentMethods = paymentMethods.filter((method) => method.methodType === "manual");
  const selectedManualMethodId = resolveManualMethodId({
    requestedMethodId: readSearchParamValue(resolvedSearchParams, "method"),
    manualPaymentMethods,
  });
  const { manualPayment, manualPaymentIssue } = await resolveManualPaymentForConfirmation({
    context: experience.runtime.context,
    order,
    token,
    methodId: selectedManualMethodId,
  });
  const refreshedOrderResult = manualPayment
    ? await resolveOrderByToken(experience.runtime.context, token)
    : null;
  const displayOrder = refreshedOrderResult?.order ?? order;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-[1160px] flex-col px-4 py-6 sm:px-6 lg:px-8">
      <ConfirmationSummary
        order={displayOrder}
        originalOrderTotal={manualPayment ? order?.total : undefined}
        issue={refreshedOrderResult?.issue ?? issue}
        orderToken={token}
        paymentMethods={paymentMethods}
        manualPayment={manualPayment}
        manualPaymentIssue={manualPaymentIssue}
      />
    </main>
  );
}
