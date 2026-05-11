import { resolveNotFoundPolicy } from "@/lib/seo/not-found-policy";
import { getStorefrontRuntimeSnapshot } from "@/lib/runtime/storefront-request-context";
import { getBootstrap } from "@/lib/storefront-api";
import { isPymeStoreMarketingHost } from "@/lib/marketing/pyme-store-host";

export default async function NotFound() {
  const runtime = await getStorefrontRuntimeSnapshot();
  const host = runtime.context.host || "desconocido";

  if (isPymeStoreMarketingHost(host)) {
    return (
      <main className="shell shell-frame">
        <section className="shell-panel">
          <div className="shell-content">
            <span className="status-pill">No encontrada</span>
            <h1 className="shell-title">Página no encontrada</h1>
            <p className="footer-note">
              La landing comercial de PymeInteligente está disponible en la página principal.
            </p>
          </div>
        </section>
      </main>
    );
  }

  let bootstrap: Awaited<ReturnType<typeof getBootstrap>> | null = null;
  let fetchError = false;

  if (host !== "desconocido" && runtime.hasApiBaseUrl) {
    try {
      bootstrap = await getBootstrap(runtime.context);
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
