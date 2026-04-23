import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * El design system se maneja por CSS variables definidas en
 * `app/globals.css` y sobreescritas por `TenantThemeProvider`
 * con los tokens del tenant. Tailwind consume esas variables
 * vía `colors` para que un mismo template pueda cambiar de
 * estética por tenant sin ramificar código.
 *
 * Limitación conocida: como los valores son CSS vars con
 * formato hex/rgba, no soportan modificadores de opacidad al
 * estilo `bg-primary/50`. Para eso se expone una utility
 * `bg-primary-soft` (variable ya mezclada con alpha en el
 * preset).
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "var(--content-width)",
      },
    },
    extend: {
      colors: {
        background: "var(--bg)",
        paper: "var(--paper)",
        panel: "var(--panel)",
        "panel-strong": "var(--panel-strong)",
        foreground: "var(--ink)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted)",
        },
        border: "var(--line)",
        input: "var(--line)",
        ring: "var(--accent)",
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--action-contrast)",
          soft: "var(--accent-soft)",
        },
        secondary: {
          DEFAULT: "var(--module-accent)",
          foreground: "var(--paper)",
          soft: "var(--module-accent-soft)",
        },
        accent: {
          DEFAULT: "var(--module-accent)",
          soft: "var(--module-accent-soft)",
        },
        success: {
          DEFAULT: "var(--accent-live)",
          soft: "var(--accent-live-soft)",
        },
        warning: {
          DEFAULT: "var(--accent-paused)",
          soft: "var(--accent-paused-soft)",
        },
        destructive: {
          DEFAULT: "var(--accent-disabled)",
          foreground: "var(--paper)",
          soft: "var(--accent-disabled-soft)",
        },
        draft: {
          DEFAULT: "var(--accent-draft)",
          soft: "var(--accent-draft-soft)",
        },
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        heading: "var(--font-heading)",
        sans: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      boxShadow: {
        tenant: "var(--shadow)",
      },
      maxWidth: {
        content: "var(--content-width)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
