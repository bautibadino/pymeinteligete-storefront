"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trackStorefrontAnalyticsEvent } from "@/lib/analytics/client";
import { buildContactPayload } from "@/lib/analytics/events";
import type { ManualPaymentSuccessDetails } from "@/lib/checkout/manual-payment";

type ManualPaymentInstructionsProps = {
  details: ManualPaymentSuccessDetails;
  orderNumber?: string;
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replaceAll(" ", " ")
    .replaceAll(" ", " ");
}

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

function trackContact(
  method: "whatsapp" | "email" | "phone",
  details: ManualPaymentSuccessDetails,
  reference: string,
) {
  const payload = buildContactPayload({
    surface: "checkout-confirmation",
    method,
    orderToken: details.orderToken,
    orderNumber: reference,
    label: "Enviar comprobante",
  });

  trackStorefrontAnalyticsEvent({
    event: "Contact",
    googleEvent: "generate_lead",
    metaEvent: "Contact",
    metaPayload: payload,
    googlePayload: payload,
  });
}

export function ManualPaymentInstructions({
  details,
  orderNumber,
}: ManualPaymentInstructionsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const reference = orderNumber ?? details.orderId;

  async function handleCopy(value: string, field: string) {
    try {
      await copyToClipboard(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
    }
  }

  function handleWhatsapp(value: string) {
    trackContact("whatsapp", details, reference);
    const phone = value.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hola. Ya transferí el pago del pedido ${reference} por ${formatAmount(details.amount)} y quiero enviar el comprobante.`,
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  function handleEmail(value: string) {
    trackContact("email", details, reference);
    const subject = encodeURIComponent(`Comprobante de pago pedido ${reference}`);
    const body = encodeURIComponent(
      `Hola,\n\nYa transferí el pago del pedido ${reference} por ${formatAmount(details.amount)}.\nAdjunto el comprobante.\n`,
    );
    window.location.href = `mailto:${value}?subject=${subject}&body=${body}`;
  }

  function handlePhone(value: string) {
    trackContact("phone", details, reference);
    window.location.href = `tel:${value.replace(/\s+/g, "")}`;
  }

  return (
    <section className="rounded-[24px] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,230,0.95))] p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Badge variant="soft" className="w-fit text-foreground">
            {details.methodDisplayName}
          </Badge>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total a transferir</p>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              {formatAmount(details.amount)}
            </p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Usá la referencia <strong className="text-foreground">pedido {reference}</strong> y avisá el pago por los canales del comercio.
          </p>
        </div>

        {details.instructions ? (
          <p className="rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm leading-6 text-foreground">
            {details.instructions}
          </p>
        ) : null}

        {details.bankAccounts.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="size-4" />
              Cuenta para transferir
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {details.bankAccounts.map((account) => (
                <article
                  key={`${account.bank}-${account.cbu}-${account.alias ?? "sin-alias"}`}
                  className="rounded-2xl border border-border/70 bg-background/85 p-3"
                >
                  <p className="text-sm font-semibold text-foreground">{account.bank}</p>
                  {account.alias ? (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Alias</p>
                      <div className="flex items-center gap-2">
                        <code className="min-w-0 flex-1 rounded-xl bg-panel px-3 py-2 text-xs font-semibold text-foreground sm:text-sm">
                          {account.alias}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Copiar alias"
                          onClick={() => handleCopy(account.alias ?? "", `${account.cbu}:alias`)}
                        >
                          {copiedField === `${account.cbu}:alias` ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-3 space-y-1">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">CBU</p>
                    <div className="flex items-center gap-2">
                      <code className="min-w-0 flex-1 rounded-xl bg-panel px-3 py-2 text-xs font-semibold text-foreground sm:text-sm">
                        {account.cbu}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Copiar CBU"
                        onClick={() => handleCopy(account.cbu, `${account.cbu}:cbu`)}
                      >
                        {copiedField === `${account.cbu}:cbu` ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {details.contactItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Avisá cuando hagas la transferencia</p>
            <div className="flex flex-wrap gap-2">
              {details.contactItems.map((item) => {
                if (item.label === "WhatsApp") {
                  return (
                    <Button key={`${item.label}-${item.value}`} type="button" onClick={() => handleWhatsapp(item.value)}>
                      <MessageCircle className="size-4" />
                      WhatsApp
                    </Button>
                  );
                }

                if (item.label === "Email") {
                  return (
                    <Button key={`${item.label}-${item.value}`} type="button" variant="outline" onClick={() => handleEmail(item.value)}>
                      <Mail className="size-4" />
                      {item.value}
                    </Button>
                  );
                }

                return (
                  <Button key={`${item.label}-${item.value}`} type="button" variant="outline" onClick={() => handlePhone(item.value)}>
                    <Phone className="size-4" />
                    Llamar
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
