import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/envios-y-entregas", "Envíos y entregas");
}

export default function EnviosYEntregasPage() {
  return <InstitutionalPageShell pathname="/envios-y-entregas" title="Envíos y entregas" />;
}
