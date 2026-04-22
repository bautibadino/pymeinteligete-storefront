import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/medios-de-pago", "Medios de pago");
}

export default function MediosDePagoPage() {
  return (
    <InstitutionalPageShell pathname="/medios-de-pago" title="Medios de pago">
      <div className="fallback-content">
        <h3>Medios de pago</h3>
        <p>
          TODO: los medios de pago aceptados, cuotas sin interés y promociones deben venir del backend.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
