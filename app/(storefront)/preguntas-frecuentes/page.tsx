import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/preguntas-frecuentes", "Preguntas frecuentes");
}

export default function PreguntasFrecuentesPage() {
  return <InstitutionalPageShell pathname="/preguntas-frecuentes" title="Preguntas frecuentes" />;
}
