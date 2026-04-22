import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/envios-y-entregas", "Envíos y entregas");
}

export default function EnviosYEntregasPage() {
  return (
    <InstitutionalPageShell pathname="/envios-y-entregas" title="Envíos y entregas">
      <div className="fallback-content">
        <h3>Envíos y entregas</h3>
        <p>
          TODO: las políticas de envío, zonas de cobertura, tiempos y costos deben venir del backend.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
