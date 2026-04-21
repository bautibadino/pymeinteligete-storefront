import packageJson from "@/package.json";

export const STOREFRONT_APP_NAME = "PyMEInteligente Storefront";
export const STOREFRONT_TECHNICAL_NAME = "storefront-externo";
export const STOREFRONT_VERSION = packageJson.version;

export const STOREFRONT_NAVIGATION = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/checkout", label: "Checkout" },
] as const;
