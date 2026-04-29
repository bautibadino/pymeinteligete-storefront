import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/sobre-nosotros", "Sobre nosotros");
}

export default function SobreNosotrosPage() {
  return <InstitutionalPageShell pathname="/sobre-nosotros" title="Sobre nosotros" />;
}
