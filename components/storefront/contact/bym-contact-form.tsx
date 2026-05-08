"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BymContactFallbackFormProps = {
  email?: string;
  whatsapp?: string;
};

type BymContactFormValues = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

function normalizeWhatsAppNumber(value: string | undefined): string | null {
  const normalized = value?.replace(/\D/g, "") ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function buildBymContactMessage(values: BymContactFormValues): string {
  const parts = [
    `Hola BYM, soy ${values.name.trim() || "cliente"}.`,
    values.message.trim(),
    values.phone.trim() ? `Teléfono: ${values.phone.trim()}` : "",
    values.email.trim() ? `Email: ${values.email.trim()}` : "",
  ].filter(Boolean);

  return parts.join("\n");
}

export function buildBymContactHref({
  email,
  values,
  whatsapp,
}: {
  email?: string;
  values: BymContactFormValues;
  whatsapp?: string;
}): string {
  const message = buildBymContactMessage(values);
  const whatsappNumber = normalizeWhatsAppNumber(whatsapp);

  if (whatsappNumber) {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  const subject = encodeURIComponent("Consulta desde la tienda online");
  return `mailto:${email ?? ""}?subject=${subject}&body=${encodeURIComponent(message)}`;
}

export function BymContactFallbackForm({
  email,
  whatsapp,
}: BymContactFallbackFormProps) {
  const [values, setValues] = useState<BymContactFormValues>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  function setValue(key: keyof BymContactFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = buildBymContactHref({
      values,
      ...(email ? { email } : {}),
      ...(whatsapp ? { whatsapp } : {}),
    });

    if (href.startsWith("https://")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.href = href;
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8f98]">
          Formulario rápido
        </p>
        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">
          Contanos qué necesitás
        </h2>
        <p className="max-w-xl text-sm leading-6 text-[#5f6368]">
          Completá tus datos y lo enviamos por el canal comercial disponible de BYM.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-[#111111]">
            Nombre
            <Input
              className="h-12 rounded-none border-[#dadce0] bg-white text-[#202124]"
              value={values.name}
              required
              placeholder="Tu nombre"
              autoComplete="name"
              onChange={(event) => setValue("name", event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#111111]">
            WhatsApp
            <Input
              className="h-12 rounded-none border-[#dadce0] bg-white text-[#202124]"
              value={values.phone}
              required
              placeholder="351..."
              autoComplete="tel"
              inputMode="tel"
              onChange={(event) => setValue("phone", event.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-semibold text-[#111111]">
          Email
          <Input
            className="h-12 rounded-none border-[#dadce0] bg-white text-[#202124]"
            value={values.email}
            placeholder="tu@email.com"
            autoComplete="email"
            type="email"
            onChange={(event) => setValue("email", event.target.value)}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-[#111111]">
          Consulta
          <textarea
            className="min-h-36 w-full rounded-none border border-[#dadce0] bg-white px-3 py-3 text-sm text-[#202124] outline-none transition placeholder:text-[#8a8f98] focus-visible:border-[#f4c542] focus-visible:ring-2 focus-visible:ring-[#f4c542]/25"
            value={values.message}
            required
            placeholder="Medida de neumático, cantidad, tipo de entrega o consulta comercial."
            onChange={(event) => setValue("message", event.target.value)}
          />
        </label>

        <Button
          className="h-12 w-full rounded-none bg-[#f4c542] px-6 text-xs font-semibold uppercase tracking-[0.16em] text-black hover:bg-white sm:w-fit"
          type="submit"
        >
          <Send className="size-4" aria-hidden="true" />
          Enviar consulta
        </Button>
      </form>
    </section>
  );
}
