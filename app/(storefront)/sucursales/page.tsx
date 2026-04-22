import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/sucursales", "Sucursales");
}

export default function SucursalesPage() {
  return (
    <InstitutionalPageShell pathname="/sucursales" title="Sucursales">
      <div className="fallback-content">
        <h3>Sucursales</h3>
        <p>
          TODO: el listado de sucursales, direcciones y horarios debe venir del backend como módulo
          institucional.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
