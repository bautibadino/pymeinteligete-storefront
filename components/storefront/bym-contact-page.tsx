import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";

import type {
  ContactEntry,
  InstitutionalPageData,
} from "@/app/(storefront)/_lib/institutional-page-data";
import { BymContactFallbackForm } from "@/components/storefront/contact/bym-contact-form";
import { DynamicContactForm } from "@/components/storefront/contact/dynamic-contact-form";
import type { StorefrontContactForm } from "@/lib/storefront-api";

type BymContactPageProps = {
  contactForm?: StorefrontContactForm;
  data: InstitutionalPageData;
};

function findEntry(entries: ContactEntry[], label: string): ContactEntry | undefined {
  return entries.find((entry) => entry.label === label);
}

function getContactCopy(data: InstitutionalPageData) {
  const email = findEntry(data.contactEntries, "Email");
  const phone = findEntry(data.contactEntries, "Teléfono");
  const whatsapp = findEntry(data.contactEntries, "WhatsApp");
  const address = findEntry(data.contactEntries, "Dirección");

  return {
    email,
    phone,
    whatsapp,
    address,
    rawEmail: data.bootstrap?.contact?.email,
    rawWhatsapp: data.bootstrap?.contact?.whatsapp,
  };
}

function ContactInfoLink({
  entry,
  icon,
  label,
}: {
  entry: ContactEntry | undefined;
  icon: ReactNode;
  label: string;
}) {
  if (!entry) {
    return null;
  }

  const content = (
    <>
      <span className="grid size-10 place-items-center border border-white/12 bg-white/[0.04] text-[#f4c542]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
          {label}
        </span>
        <span className="mt-1 block break-words text-sm font-semibold text-white">
          {entry.value}
        </span>
      </span>
    </>
  );

  const className =
    "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#f4c542]/50 hover:bg-white/[0.06]";

  return entry.href ? (
    <a className={className} href={entry.href}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function BymContactPage({ contactForm, data }: BymContactPageProps) {
  const contact = getContactCopy(data);
  const hasDynamicForm = Boolean(contactForm?.enabled && contactForm.fields.length > 0);

  return (
    <main
      className="min-h-dvh bg-[#070707] px-4 pb-20 pt-[calc(var(--bym-shell-header-height)+clamp(36px,6vw,76px))] text-white sm:px-6 lg:px-8"
      data-bym-fullbleed="true"
    >
      <section className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.78fr)] lg:items-start">
        <div className="grid gap-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f4c542]">
              Contacto BYM
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Hablemos de tu compra.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
              Pedí precio, stock, envío, armado o balanceado. Te respondemos por el canal más rápido para cerrar la operación sin vueltas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {contact.whatsapp?.href ? (
              <a
                className="inline-flex min-h-12 items-center gap-2 bg-[#f4c542] px-5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-white"
                href={contact.whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Escribir por WhatsApp
              </a>
            ) : null}
            {contact.phone?.href ? (
              <a
                className="inline-flex min-h-12 items-center gap-2 border border-white/18 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
                href={contact.phone.href}
              >
                <Phone className="size-4" aria-hidden="true" />
                Llamar
              </a>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ContactInfoLink
              entry={contact.whatsapp}
              icon={<MessageCircle className="size-4" aria-hidden="true" />}
              label="WhatsApp"
            />
            <ContactInfoLink
              entry={contact.phone}
              icon={<Phone className="size-4" aria-hidden="true" />}
              label="Teléfono"
            />
            <ContactInfoLink
              entry={contact.email}
              icon={<Mail className="size-4" aria-hidden="true" />}
              label="Email"
            />
            <ContactInfoLink
              entry={contact.address}
              icon={<MapPin className="size-4" aria-hidden="true" />}
              label="Dirección"
            />
          </div>
        </div>

        <div className="border border-white/12 bg-[#f7f7f4] p-5 text-[#111111] shadow-[0_24px_80px_-48px_rgba(255,255,255,0.5)] sm:p-7">
          {hasDynamicForm && contactForm ? (
            <DynamicContactForm
              contactForm={contactForm}
              className="[--accent:#f4c542] [--action-contrast:#050505] [--bg:#ffffff] [--focus-ring:rgba(244,197,66,0.28)] [--ink:#111111] [--line:#dadce0] [--muted:#5f6368] [--paper:#ffffff] [&_button[type=submit]]:rounded-none [&_button[type=submit]]:bg-[#f4c542] [&_button[type=submit]]:text-black [&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none"
            />
          ) : (
            <BymContactFallbackForm
              {...(contact.rawEmail ? { email: contact.rawEmail } : {})}
              {...(contact.rawWhatsapp ? { whatsapp: contact.rawWhatsapp } : {})}
            />
          )}
        </div>
      </section>
    </main>
  );
}
