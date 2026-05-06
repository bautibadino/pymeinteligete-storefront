import { CheckCircle2, CreditCard, Mail, Package, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckoutPostPurchaseEffects } from "./checkout-post-purchase-effects";
import {
  buildManualPaymentSuccessDetails,
  type ManualPaymentSuccessSource,
} from "@/lib/checkout/manual-payment";
import type { StorefrontOrderByTokenResult, StorefrontPaymentMethod } from "@/lib/storefront-api";

import { ManualPaymentForm } from "./manual-payment-form";
import { ManualPaymentInstructions } from "./manual-payment-instructions";

type ConfirmationSummaryProps = {
  order: StorefrontOrderByTokenResult | null;
  originalOrderTotal?: number | undefined;
  issue?: string | undefined;
  orderToken: string;
  paymentMethods: StorefrontPaymentMethod[];
  manualPayment?: ManualPaymentSuccessSource | undefined;
  manualPaymentIssue?: string | undefined;
};

function formatTotal(total: number | null | undefined): string {
  if (total === null || total === undefined) {
    return "A confirmar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  })
    .format(total)
    .replaceAll(" ", " ")
    .replaceAll(" ", " ");
}

function resolveOrderTitle(input: {
  isPaid: boolean;
  hasManualPayment: boolean;
}): string {
  if (input.isPaid) {
    return "Tu pedido ya está pagado";
  }

  if (input.hasManualPayment) {
    return "Transferí para confirmar tu pedido";
  }

  return "Tu pedido quedó registrado";
}

function resolveOrderDescription(input: {
  isPaid: boolean;
  hasManualPayment: boolean;
}): string {
  if (input.isPaid) {
    return "El comercio ya recibió el pago. Guardá esta confirmación para seguir el pedido.";
  }

  if (input.hasManualPayment) {
    return "La orden ya está creada. Sólo falta que hagas la transferencia y avises el pago.";
  }

  return "Guardá esta confirmación. Si falta pagar, elegí un medio disponible para ver las instrucciones.";
}

function OrderItem({ item }: { item: StorefrontOrderByTokenResult["items"][number] }) {
  const quantity = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
  const unitDisplayAmount = item.total > 0 ? item.total / quantity : item.unitPrice;

  return (
    <article className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-2xl border border-border/70 bg-background/85 px-3 py-3">
      <div className="min-w-0 space-y-1">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.description}</p>
        <p className="text-xs text-muted-foreground">
          {item.quantity} {item.quantity === 1 ? "unidad" : "unidades"} · {formatTotal(unitDisplayAmount)} c/u
        </p>
      </div>
      <strong className="shrink-0 text-sm text-foreground">{formatTotal(item.total)}</strong>
    </article>
  );
}

export function ConfirmationSummary({
  order,
  originalOrderTotal,
  issue,
  orderToken,
  paymentMethods,
  manualPayment,
  manualPaymentIssue,
}: ConfirmationSummaryProps) {
  if (!order) {
    return (
      <section className="rounded-[28px] border border-border/70 bg-background p-6 shadow-sm">
        <div className="space-y-3">
          <Badge variant="soft" className="w-fit">Confirmación</Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
            No pudimos encontrar el pedido
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {issue ??
              "Necesitás abrir el enlace de confirmación que se genera al terminar el checkout."}
          </p>
        </div>
      </section>
    );
  }

  const manualPaymentMethods = paymentMethods.filter((method) => method.methodType === "manual");
  const manualPaymentDetails = manualPayment
    ? buildManualPaymentSuccessDetails(manualPayment)
    : null;
  const hasManualPayment = Boolean(manualPaymentDetails);
  const showManualPaymentForm = !order.isPaid && !manualPaymentDetails && manualPaymentMethods.length > 0;
  const amountToPay = manualPaymentDetails?.amount ?? order.total;
  const effectiveOriginalTotal = originalOrderTotal ?? order.total;
  const paymentDiscountAmount =
    manualPaymentDetails && effectiveOriginalTotal > manualPaymentDetails.amount
      ? effectiveOriginalTotal - manualPaymentDetails.amount
      : 0;
  const installmentsCount =
    order.payment?.installments && order.payment.installments > 1
      ? order.payment.installments
      : null;
  const installmentAmount =
    installmentsCount && amountToPay > 0
      ? Math.round(amountToPay / installmentsCount)
      : null;

  return (
    <section>
      <CheckoutPostPurchaseEffects order={order} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-border/70 bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <Badge
                  variant={order.isPaid ? "success" : "soft"}
                  className="w-fit text-foreground"
                >
                  {order.isPaid ? "Pago confirmado" : "Pedido registrado"}
                </Badge>
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
                    {resolveOrderTitle({ isPaid: order.isPaid, hasManualPayment })}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {resolveOrderDescription({ isPaid: order.isPaid, hasManualPayment })}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-panel/70 px-3 py-2 text-sm">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Pedido</p>
                <p className="mt-1 font-semibold text-foreground">#{order.orderNumber ?? "sin número"}</p>
              </div>
            </div>
          </div>

          {manualPaymentDetails ? (
            <ManualPaymentInstructions
              details={manualPaymentDetails}
              orderNumber={order.orderNumber}
            />
          ) : null}

          {manualPaymentIssue ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
              No pudimos cargar automáticamente los datos de pago: {manualPaymentIssue}
            </div>
          ) : null}

          {showManualPaymentForm ? (
            <div className="space-y-4 rounded-[28px] border border-border/70 bg-background p-5 shadow-sm">
              <div className="space-y-2">
                <Badge variant="soft" className="w-fit">Pago pendiente</Badge>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                  Elegí cómo querés pagar
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Seleccioná un medio para ver la cuenta y el contacto del comercio.
                </p>
              </div>
              <ManualPaymentForm
                orderToken={orderToken}
                paymentMethods={manualPaymentMethods}
              />
            </div>
          ) : null}

          {order.isPaid ? (
            <div className="rounded-[24px] border border-success/30 bg-success-soft/40 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-5 text-success" />
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">Listo para preparar</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    El comercio ya puede avanzar con la preparación y el despacho del pedido.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20">
          <div className="rounded-[24px] border border-border/70 bg-background p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Resumen
                </p>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                  Tu compra
                </h2>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5">
              <div className="rounded-2xl border border-border/70 bg-panel/70 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total a pagar</p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {formatTotal(amountToPay)}
                </p>
              </div>
              {paymentDiscountAmount > 0 ? (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                  <span>Ahorraste</span>
                  <strong>-{formatTotal(paymentDiscountAmount)}</strong>
                </div>
              ) : null}
              {installmentsCount && installmentAmount ? (
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/85 px-3 py-2.5 text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="size-4" />
                    {installmentsCount} cuotas
                  </span>
                  <strong className="text-foreground">{formatTotal(installmentAmount)}</strong>
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/85 px-3 py-2.5 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="min-w-0 truncate text-foreground">{order.customer.email}</span>
              </div>
            </div>

            <div className="my-4 h-px bg-border/70" />

            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ReceiptText className="size-4" />
              Productos
            </div>
            <div className="space-y-2">
              {order.items.length > 0 ? (
                order.items.map((item) => (
                  <OrderItem key={`${item.productId}-${item.quantity}`} item={item} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  No hay detalle de productos disponible.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="flex-1">
              <a href="/catalogo">
                <Package className="size-4" />
                Seguir comprando
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
