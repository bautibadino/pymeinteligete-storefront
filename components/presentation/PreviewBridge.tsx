"use client";

import { useEffect } from "react";

/**
 * PreviewBridge — cliente que conecta el storefront con el editor ERP
 * mediante postMessage.
 *
 * V1 mínimo:
 * - Emite `ready` al montar.
 * - Escucha `refresh` y recarga la página.
 * - Escucha `navigate` para cambiar de página.
 * - Escucha `highlight-section` (placeholder para V2).
 * - Emite `selected` cuando el usuario clickea una sección (placeholder).
 */
export function PreviewBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Notificar al parent que el iframe está listo
    if (window.parent !== window) {
      window.parent.postMessage({ type: "ready" }, "*");
    }

    const handler = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type } = event.data;

      switch (type) {
        case "refresh": {
          window.location.reload();
          break;
        }
        case "navigate": {
          const page = event.data.page as string | undefined;
          if (page) {
            const paths: Record<string, string> = {
              home: "/",
              catalog: "/catalogo",
              product: "/producto/sample",
            };
            const target = paths[page];
            if (target && window.location.pathname !== target) {
              window.location.href = target;
            }
          }
          break;
        }
        case "highlight-section": {
          // V2: scroll + outline temporal sobre la sección
          const sectionId = event.data.sectionId as string | undefined;
          if (sectionId) {
            const el = document.querySelector(`[data-section-id="${sectionId}"]`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              // Outline temporal
              const htmlEl = el as HTMLElement;
              htmlEl.style.outline = "2px dashed var(--accent)";
              setTimeout(() => {
                htmlEl.style.outline = "";
              }, 2000);
            }
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return null;
}
