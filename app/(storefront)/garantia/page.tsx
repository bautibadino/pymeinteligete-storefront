import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/garantia", "Garantía");
}

export default function GarantiaPage() {
  return <InstitutionalPageShell pathname="/garantia" title="Garantía" />;
}
