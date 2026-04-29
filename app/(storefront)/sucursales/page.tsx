import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/sucursales", "Sucursales");
}

export default function SucursalesPage() {
  return <InstitutionalPageShell pathname="/sucursales" title="Sucursales" />;
}
