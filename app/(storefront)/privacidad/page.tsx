import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/privacidad", "Privacidad");
}

export default function PrivacidadPage() {
  return <InstitutionalPageShell pathname="/privacidad" title="Privacidad" />;
}
