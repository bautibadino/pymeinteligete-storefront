import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/mayoristas", "Mayoristas");
}

export default function MayoristasPage() {
  return (
    <InstitutionalPageShell pathname="/mayoristas" title="Mayoristas">
      <div className="fallback-content">
        <h3>Mayoristas</h3>
        <p>
          TODO: la información para clientes mayoristas, descuentos y condiciones comerciales debe venir
          del backend.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
