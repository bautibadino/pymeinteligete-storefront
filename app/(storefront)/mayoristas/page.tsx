import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/mayoristas", "Mayoristas");
}

export default function MayoristasPage() {
  return <InstitutionalPageShell pathname="/mayoristas" title="Mayoristas" />;
}
