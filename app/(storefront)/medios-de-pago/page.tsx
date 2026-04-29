import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/medios-de-pago", "Medios de pago");
}

export default function MediosDePagoPage() {
  return <InstitutionalPageShell pathname="/medios-de-pago" title="Medios de pago" />;
}
