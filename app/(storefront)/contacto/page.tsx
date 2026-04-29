import {
  InstitutionalPageShell,
  generateInstitutionalMetadata,
} from "@/app/(storefront)/_lib/institutional-page-shell";

export async function generateMetadata() {
  return generateInstitutionalMetadata("/contacto", "Contacto");
}

export default function ContactoPage() {
  return <InstitutionalPageShell pathname="/contacto" title="Contacto" />;
}
