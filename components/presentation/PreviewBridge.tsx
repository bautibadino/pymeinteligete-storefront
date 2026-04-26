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
 * - Escucha `highlight-section` para enfocar una sección desde el ERP.
 * - Emite `selected` cuando el usuario clickea una sección.
 */
export function PreviewBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Notificar al parent que el iframe está listo
    if (window.parent !== window) {
      window.parent.postMessage({ type: "ready" }, "*");
    }

    let highlightedElement: HTMLElement | null = null;

    const clearHighlight = () => {
      highlightedElement?.classList.remove("preview-selected-section");
      highlightedElement = null;
    };

    const highlightSection = (sectionId: string) => {
      const el = document.querySelector(`[data-section-id="${CSS.escape(sectionId)}"]`);

      if (!el) return;

      clearHighlight();
      highlightedElement = el as HTMLElement;
      highlightedElement.classList.add("preview-selected-section");
      highlightedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    };

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
          const sectionId = event.data.sectionId as string | undefined;
          if (sectionId) {
            highlightSection(sectionId);
          } else {
            clearHighlight();
          }
          break;
        }
        default:
          break;
      }
    };

    const clickHandler = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const section = target?.closest<HTMLElement>("[data-section-id]");
      const sectionId = section?.dataset.sectionId;

      if (!sectionId) return;

      window.parent.postMessage({ type: "selected", sectionId }, "*");
      highlightSection(sectionId);
    };

    window.addEventListener("message", handler);
    document.addEventListener("click", clickHandler, true);

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("click", clickHandler, true);
      clearHighlight();
    };
  }, []);

  return null;
}
