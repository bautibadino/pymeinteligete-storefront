import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";
import {
  type ContactEntry,
  loadInstitutionalPageData,
} from "@/app/(storefront)/_lib/institutional-page-data";
import { DynamicContactForm } from "@/components/storefront/contact/dynamic-contact-form";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/contacto", "Contacto");
}

function ContactChannels({ entries }: { entries: ContactEntry[] }) {
  return (
    <section className="grid content-start gap-4 border-y border-border py-5 lg:border-y-0 lg:border-r lg:py-0 lg:pr-8">
      <div className="grid gap-2">
        <h2 className="text-xl font-black text-foreground">Canales disponibles</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          También podés comunicarte por los medios publicados por la tienda.
        </p>
      </div>

      {entries.length > 0 ? (
        <ul className="grid gap-3">
          {entries.map((entry) => (
            <li key={`${entry.label}:${entry.value}`} className="grid gap-1">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                {entry.label}
              </span>
              {entry.href ? (
                <a className="font-semibold text-foreground underline-offset-4 hover:underline" href={entry.href}>
                  {entry.value}
                </a>
              ) : (
                <span className="font-semibold text-foreground">{entry.value}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          La tienda todavía no publicó canales de contacto directos en el bootstrap actual.
        </p>
      )}
    </section>
  );
}

export default async function ContactoPage() {
  const data = await loadInstitutionalPageData("/contacto");
  const contactForm = data.bootstrap?.contactForm;

  if (!contactForm?.enabled || contactForm.fields.length === 0) {
    return <InstitutionalPageShell pathname="/contacto" title="Contacto" />;
  }

  return (
    <InstitutionalPageShell pathname="/contacto" title="Contacto">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <ContactChannels entries={data.contactEntries} />
        <DynamicContactForm contactForm={contactForm} />
      </div>
    </InstitutionalPageShell>
  );
}
