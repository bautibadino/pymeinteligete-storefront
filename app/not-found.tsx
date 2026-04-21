export default function NotFound() {
  return (
    <main className="shell shell-frame">
      <section className="shell-panel">
        <div className="shell-content">
          <span className="status-pill">Tienda no disponible</span>
          <h1 className="shell-title">No hay una superficie publica renderizable para esta URL.</h1>
          <p className="footer-note">
            TODO: conectar esta salida con `shopStatus`, tenant inexistente y politica de errores del
            backend.
          </p>
        </div>
      </section>
    </main>
  );
}
