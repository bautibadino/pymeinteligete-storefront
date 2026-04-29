import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/cambios-y-devoluciones", "Cambios y devoluciones");
}

export default function ReturnsPage() {
  return (
    <InstitutionalPageShell
      pathname="/cambios-y-devoluciones"
      title="Cambios y devoluciones"
      description="Esta sección centraliza la política pública disponible del tenant para cambios, devoluciones y canales de seguimiento."
    />
  );
}
