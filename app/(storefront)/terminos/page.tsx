import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/terminos", "Términos y condiciones");
}

export default function TerminosPage() {
  return <InstitutionalPageShell pathname="/terminos" title="Términos y condiciones" />;
}
