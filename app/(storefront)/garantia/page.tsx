import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/garantia", "Garantía");
}

export default function GarantiaPage() {
  return (
    <InstitutionalPageShell pathname="/garantia" title="Garantía">
      <div className="fallback-content">
        <h3>Garantía</h3>
        <p>
          TODO: las condiciones de garantía, plazos y procedimientos de devolución deben venir del
          backend.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
