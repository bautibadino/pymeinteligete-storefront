import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/trabajos", "Trabajos");
}

export default function TrabajosPage() {
  return (
    <InstitutionalPageShell pathname="/trabajos" title="Trabajos">
      <div className="fallback-content">
        <h3>Trabajos</h3>
        <p>
          TODO: las oportunidades laborales y formulario de postulación deben venir del backend como
          módulo institucional.
        </p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
