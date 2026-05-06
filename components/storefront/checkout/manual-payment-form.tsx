"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Landmark, Wallet } from "lucide-react";

import {
  type ManualPaymentActionState,
  initialManualPaymentActionState,
} from "@/app/(storefront)/checkout/action-state";
import { submitManualPaymentAction } from "@/app/(storefront)/checkout/actions";
import { Button } from "@/components/ui/button";
import { useStorefrontCart } from "@/components/storefront/cart/storefront-cart-provider";
import { buildManualPaymentSuccessDetails } from "@/lib/checkout/manual-payment";
import { resolvePaymentMethodOptionValue } from "@/lib/checkout/payment-method-option";
import type { StorefrontPaymentMethod } from "@/lib/storefront-api";
import { ManualPaymentInstructions } from "./manual-payment-instructions";

type ManualPaymentFormProps = {
  orderToken: string;
  paymentMethods: StorefrontPaymentMethod[];
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
      {pending ? "Cargando datos..." : "Ver datos para pagar"}
    </Button>
  );
}

function ManualPaymentSuccessCard({ state }: { state: ManualPaymentActionState }) {
  if (
    state.status !== "success" ||
    !state.paymentAttemptId ||
    !state.orderId ||
    !state.orderToken ||
    state.amount === undefined ||
    !state.methodDisplayName
  ) {
    return null;
  }

  const details = buildManualPaymentSuccessDetails({
    paymentAttemptId: state.paymentAttemptId,
    orderId: state.orderId,
    orderToken: state.orderToken,
    amount: state.amount,
    methodDisplayName: state.methodDisplayName,
    ...(state.instructions ? { instructions: state.instructions } : {}),
    ...(state.bankAccounts ? { bankAccounts: state.bankAccounts } : {}),
    ...(state.contactInfo ? { contactInfo: state.contactInfo } : {}),
  });

  return <ManualPaymentInstructions details={details} />;
}

export function ManualPaymentForm({ orderToken, paymentMethods }: ManualPaymentFormProps) {
  const [state, formAction] = useActionState(
    submitManualPaymentAction,
    initialManualPaymentActionState,
  );
  const { clearCart } = useStorefrontCart();

  useEffect(() => {
    if (state.status === "success") {
      clearCart();
    }
  }, [clearCart, state.status]);

  if (state.status === "success") {
    return <ManualPaymentSuccessCard state={state} />;
  }

  return (
    <form className="space-y-5" action={formAction}>
      <input type="hidden" name="orderToken" value={orderToken} />

      <div className="grid gap-3">
        {paymentMethods.map((method: import("@/lib/storefront-api").StorefrontPaymentMethod, index) => (
          <label
            key={method.methodId}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:border-primary/40"
          >
            <input
              type="radio"
              name="methodId"
              value={resolvePaymentMethodOptionValue(method)}
              defaultChecked={paymentMethods.length === 1 || index === 0}
              className="mt-1"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {method.methodType === "manual" ? (
                  <Landmark className="size-4 text-primary" />
                ) : (
                  <Wallet className="size-4 text-primary" />
                )}
                <span className="font-semibold text-foreground">{method.displayName ?? "Método"}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {method.description ?? "Coordiná el pago con el comercio."}
              </p>
            </div>
          </label>
        ))}
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <p className="rounded-2xl border border-border/70 bg-panel/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
        Al continuar vas a ver el alias, CBU y contacto para enviar el comprobante.
      </p>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
