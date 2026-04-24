/**
 * HeaderModule — tipo del bloque global header para el site builder (Ola 2).
 *
 * No forma parte del sistema legacy de StorefrontModule (module-schema.ts).
 * Vive en su propio archivo para no romper lib/modules/index.ts.
 *
 * El componente de cada variante recibe `{ module: HeaderModule }` como única
 * prop. Ningún componente conoce el tenant; los estilos vienen exclusivamente
 * de CSS vars (design tokens).
 */

// ---------------------------------------------------------------------------
// Shared sub-types
// ---------------------------------------------------------------------------

export interface HeaderNavLink {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}

export interface HeaderTopBarLink {
  label: string;
  href: string;
}

// ---------------------------------------------------------------------------
// Template variants
// ---------------------------------------------------------------------------

export type HeaderTemplateVariant =
  | "centered-logo"
  | "left-logo-search"
  | "sticky-compact"
  | "minimal";

// ---------------------------------------------------------------------------
// HeaderModule
// ---------------------------------------------------------------------------

/**
 * Interfaz plana que cada variante de header consume.
 * Los campos opcionales deben ser ignorados graciosamente por los componentes.
 */
export interface HeaderModule {
  /** nanoid estable del SectionInstance */
  id: string;
  type: "header";
  variant: HeaderTemplateVariant;
  /** URL del logo. Si es vacía o ausente, mostrar nombre del tenant en texto. */
  logoUrl?: string;
  /** href del logo (generalmente "/"). */
  logoHref?: string;
  /** alt text del logo. */
  logoAlt?: string;
  /** Links de navegación principal. */
  navLinks?: HeaderNavLink[];
  /** Si se muestra el buscador (placeholder visual en V1). */
  showSearch?: boolean;
  /** Placeholder del campo de búsqueda visual. */
  searchPlaceholder?: string;
  /** Si se muestra el carrito (placeholder visual en V1, siempre con count 0). */
  showCart?: boolean;
  /** Si se muestra el acceso a cuenta/login. */
  showAccount?: boolean;
  /** Barra fina superior con links utilitarios. */
  topBarLinks?: HeaderTopBarLink[];
}
