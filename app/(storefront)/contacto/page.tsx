import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/contacto", "Contacto");
}

export default function ContactoPage() {
  return (
    <InstitutionalPageShell pathname="/contacto" title="Contacto">
      <div className="fallback-content">
        <h3>Contacto</h3>
        <p>
          TODO: el contenido de contacto (email, teléfono, dirección, horarios) debe venir del backend
          como parte del bootstrap o de un módulo institucional.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
