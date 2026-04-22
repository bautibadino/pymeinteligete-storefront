import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/terminos", "Términos y condiciones");
}

export default function TerminosPage() {
  return (
    <InstitutionalPageShell pathname="/terminos" title="Términos y condiciones">
      <div className="fallback-content">
        <h3>Términos y condiciones</h3>
        <p>
          TODO: los términos y condiciones de uso del sitio deben venir del backend como módulo
          institucional.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
