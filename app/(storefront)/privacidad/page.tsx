import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/privacidad", "Privacidad");
}

export default function PrivacidadPage() {
  return (
    <InstitutionalPageShell pathname="/privacidad" title="Privacidad">
      <div className="fallback-content">
        <h3>Privacidad</h3>
        <p>
          TODO: la política de privacidad y protección de datos debe venir del backend como módulo
          institucional.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
