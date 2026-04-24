/**
 * RichTextBody — renderiza `body` como HTML básico via dangerouslySetInnerHTML.
 *
 * V1: acepta sólo HTML básico (p, strong, em, ul, ol, li, a, h2, h3, h4, blockquote).
 * V2 pendiente: sanitización fuerte con DOMPurify o similar.
 * No usar @tailwindcss/typography (no instalado). Estilos manuales con Tailwind.
 */
export function RichTextBody({ html }: { html: string }) {
  return (
    <div
      className={[
        "rich-text-body",
        "text-foreground leading-relaxed",
        "[&_p]:mb-4 [&_p:last-child]:mb-0",
        "[&_strong]:font-semibold [&_em]:italic",
        "[&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6",
        "[&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5",
        "[&_h4]:font-heading [&_h4]:text-lg [&_h4]:font-medium [&_h4]:mb-2 [&_h4]:mt-4",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted",
      ].join(" ")}
      // V2 TODO: reemplazar dangerouslySetInnerHTML por un renderizador con DOMPurify
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
