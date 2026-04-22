import { headers } from "next/headers";

import { resolveNotFoundPolicy } from "@/lib/seo/not-found-policy";
import { StorefrontApiError, getBootstrap } from "@/lib/storefront-api";
import { resolveRequestHostFromHeaders } from "@/lib/tenancy/resolve-request-host";

export default async function NotFound() {
  const headerStore = await headers();
  let host: string;

  try {
    host = resolveRequestHostFromHeaders(headerStore);
  } catch {
    host = "desconocido";
  }

  let bootstrap: Awaited<ReturnType<typeof getBootstrap>> | null = null;
  let fetchError = false;

  if (host !== "desconocido") {
    try {
      bootstrap = await getBootstrap(host);
    } catch {
      // Cualquier error de fetch (tipado o no) se trata como caso operativo
      // para evitar falsos "Tienda no encontrada" cuando la plataforma falla.
      fetchError = true;
    }
  }

  const policy = resolveNotFoundPolicy(host, bootstrap, fetchError);

  return (
    <main className="shell shell-frame">
      <section className="shell-panel">
        <div className="shell-content">
          <span className="status-pill">{policy.statusLabel}</span>
          <h1 className="shell-title">{policy.title}</h1>
          <p className="footer-note">{policy.description}</p>
          {host !== "desconocido" ? (
            <p className="footer-note mono">Host: {host}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
