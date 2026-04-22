import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/preguntas-frecuentes", "Preguntas frecuentes");
}

export default function PreguntasFrecuentesPage() {
  return (
    <InstitutionalPageShell pathname="/preguntas-frecuentes" title="Preguntas frecuentes">
      <div className="fallback-content">
        <h3>Preguntas frecuentes</h3>
        <p>TODO: las preguntas frecuentes y sus respuestas deben venir del backend como módulo.</p>
        <p>
          Este fallback se muestra hasta que el contrato de contenido institucional esté disponible.
        </p>
      </div>
    </InstitutionalPageShell>
  );
}
