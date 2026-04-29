import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/trabajos", "Trabajos");
}

export default function TrabajosPage() {
  return <InstitutionalPageShell pathname="/trabajos" title="Trabajos" />;
}
