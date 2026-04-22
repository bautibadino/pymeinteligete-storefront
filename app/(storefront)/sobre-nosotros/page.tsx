import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/sobre-nosotros", "Sobre nosotros");
}

export default function SobreNosotrosPage() {
  return (
    <InstitutionalPageShell pathname="/sobre-nosotros" title="Sobre nosotros">
      <div className="fallback-content">
        <h3>Sobre nosotros</h3>
        <p>
          TODO: el contenido sobre la empresa, historia y valores debe venir del backend como módulo
          institucional.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
