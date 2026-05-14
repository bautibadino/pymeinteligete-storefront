type SportAdventureAccent = "orange" | "white";

type SportAdventureAction = {
  label: string;
  href: string;
};

type SportAdventureContactCard = {
  id: string;
  label: string;
  value: string;
  href?: string | null;
  accent: SportAdventureAccent;
};

type SportAdventureServiceCard = {
  id: string;
  title: string;
  description: string;
};

export type SportAdventureContactProps = {
  content: {
    brand: string;
    logoUrl?: string;
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: SportAdventureAction;
    secondaryAction: SportAdventureAction;
    contactCards: SportAdventureContactCard[];
    serviceCards: SportAdventureServiceCard[];
    footerNote: string;
  };
  className?: string;
};

const DISPLAY =
  '"Eurostile", "Microgramma D Extended", "Arial Narrow", sans-serif';
const BODY =
  '"Avenir Next Condensed", "Franklin Gothic Medium", "Helvetica Neue", sans-serif';

const STYLES = `
  .sa-contact-root {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    color: #f5f1e9;
    background:
      radial-gradient(circle at top right, rgba(255, 106, 0, 0.34), transparent 32%),
      radial-gradient(circle at bottom left, rgba(255, 106, 0, 0.16), transparent 28%),
      linear-gradient(180deg, #050505 0%, #090909 40%, #111111 100%);
    font-family: ${BODY};
  }
  .sa-contact-root::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 88%);
    pointer-events: none;
  }
  .sa-contact-shell {
    position: relative;
    z-index: 1;
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 28px 0 40px;
  }
  .sa-contact-hero {
    position: relative;
    display: grid;
    gap: 22px;
    padding: 22px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.34);
  }
  .sa-contact-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .sa-contact-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .sa-contact-brand img {
    height: 30px;
    width: auto;
    object-fit: contain;
  }
  .sa-contact-brand-name {
    margin: 0;
    font-family: ${DISPLAY};
    font-size: 0.82rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.74);
  }
  .sa-contact-host {
    font-size: 0.76rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
    text-align: right;
  }
  .sa-contact-copy {
    display: grid;
    gap: 14px;
    max-width: 660px;
  }
  .sa-contact-eyebrow {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: 10px;
    margin: 0;
    padding: 9px 14px;
    border: 1px solid rgba(255, 106, 0, 0.34);
    background: rgba(255, 106, 0, 0.08);
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ff8a3d;
  }
  .sa-contact-title {
    margin: 0;
    font-family: ${DISPLAY};
    font-size: clamp(2.5rem, 9vw, 5.6rem);
    line-height: 0.94;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .sa-contact-description {
    margin: 0;
    font-size: clamp(1rem, 3.5vw, 1.22rem);
    line-height: 1.62;
    color: rgba(245, 241, 233, 0.78);
  }
  .sa-contact-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 4px;
  }
  .sa-contact-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    padding: 0 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    transition:
      transform 180ms ease,
      background 180ms ease,
      border-color 180ms ease,
      color 180ms ease;
  }
  .sa-contact-action:hover {
    transform: translateY(-2px);
  }
  .sa-contact-action-primary {
    background: #ff6a00;
    border-color: #ff6a00;
    color: #0b0b0b;
  }
  .sa-contact-action-secondary {
    background: rgba(255, 255, 255, 0.02);
    color: #ffffff;
  }
  .sa-contact-services {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sa-contact-service {
    position: relative;
    padding: 18px 16px 20px;
    border-left: 4px solid #ff6a00;
    background: rgba(255, 255, 255, 0.04);
  }
  .sa-contact-service-title {
    margin: 0 0 8px;
    font-family: ${DISPLAY};
    font-size: 0.98rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .sa-contact-service-description {
    margin: 0;
    line-height: 1.55;
    color: rgba(245, 241, 233, 0.72);
  }
  .sa-contact-grid {
    display: grid;
    gap: 14px;
    margin-top: 18px;
  }
  .sa-contact-card {
    position: relative;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(14, 14, 14, 0.72);
    text-decoration: none;
    color: inherit;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease;
  }
  .sa-contact-card[href]:hover {
    transform: translateY(-3px);
    background: rgba(18, 18, 18, 0.92);
  }
  .sa-contact-card-accent-orange {
    border-color: rgba(255, 106, 0, 0.32);
  }
  .sa-contact-card-accent-orange::before,
  .sa-contact-card-accent-white::before {
    content: "";
    display: block;
    width: 48px;
    height: 2px;
    margin-bottom: 16px;
  }
  .sa-contact-card-accent-orange::before {
    background: #ff6a00;
  }
  .sa-contact-card-accent-white::before {
    background: rgba(255, 255, 255, 0.74);
  }
  .sa-contact-card-label {
    margin: 0 0 8px;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.48);
  }
  .sa-contact-card-value {
    margin: 0;
    font-size: 1.08rem;
    line-height: 1.5;
    color: #fffaf3;
    word-break: break-word;
  }
  .sa-contact-footer {
    margin-top: 18px;
    padding: 20px 22px 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background:
      linear-gradient(90deg, rgba(255, 106, 0, 0.16), rgba(255, 106, 0, 0.03)),
      rgba(255, 255, 255, 0.02);
  }
  .sa-contact-footer-label {
    display: block;
    margin-bottom: 12px;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.46);
  }
  .sa-contact-footer-note {
    margin: 0;
    font-family: ${DISPLAY};
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    line-height: 1.2;
    text-transform: uppercase;
  }
  @media (min-width: 720px) {
    .sa-contact-shell {
      width: min(1180px, calc(100% - 48px));
      padding: 38px 0 54px;
    }
    .sa-contact-hero {
      padding: 32px;
    }
    .sa-contact-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 1024px) {
    .sa-contact-hero {
      grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
      gap: 28px;
      align-items: end;
      padding: 34px;
    }
    .sa-contact-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin-top: 22px;
    }
    .sa-contact-services {
      gap: 14px;
    }
  }
  @media (max-width: 639px) {
    .sa-contact-services {
      grid-template-columns: 1fr;
    }
    .sa-contact-header {
      align-items: flex-start;
      flex-direction: column;
    }
    .sa-contact-host {
      text-align: left;
    }
  }
`;

function ContactCard({
  card,
}: {
  card: SportAdventureContactCard;
}) {
  const className = `sa-contact-card sa-contact-card-accent-${card.accent}`;

  if (card.href) {
    return (
      <a
        className={className}
        href={card.href}
        rel={card.href.startsWith("http") ? "noreferrer" : undefined}
        target={card.href.startsWith("http") ? "_blank" : undefined}
      >
        <p className="sa-contact-card-label">{card.label}</p>
        <p className="sa-contact-card-value">{card.value}</p>
      </a>
    );
  }

  return (
    <div className={className}>
      <p className="sa-contact-card-label">{card.label}</p>
      <p className="sa-contact-card-value">{card.value}</p>
    </div>
  );
}

export function SportAdventureContact({
  content,
  className,
}: SportAdventureContactProps) {
  return (
    <section
      className={`sa-contact-root${className ? ` ${className}` : ""}`}
      aria-labelledby="sportadventure-contact-title"
    >
      <style>{STYLES}</style>

      <div className="sa-contact-shell">
        <div className="sa-contact-hero">
          <div className="sa-contact-copy">
            <div className="sa-contact-header">
              <div className="sa-contact-brand">
                {content.logoUrl ? (
                  <img src={content.logoUrl} alt={content.brand} />
                ) : null}
                <p className="sa-contact-brand-name">{content.brand}</p>
              </div>
            </div>

            <p className="sa-contact-eyebrow">{content.eyebrow}</p>
            <h1
              className="sa-contact-title"
              id="sportadventure-contact-title"
            >
              {content.title}
            </h1>
            <p className="sa-contact-description">{content.description}</p>

            <div className="sa-contact-actions" id="contacto-directo">
              <a
                className="sa-contact-action sa-contact-action-primary"
                href={content.primaryAction.href}
              >
                {content.primaryAction.label}
              </a>
              <a
                className="sa-contact-action sa-contact-action-secondary"
                href={content.secondaryAction.href}
              >
                {content.secondaryAction.label}
              </a>
            </div>
          </div>

          <div className="sa-contact-services" aria-label="Áreas de atención">
            {content.serviceCards.map((service) => (
              <article className="sa-contact-service" key={service.id}>
                <h2 className="sa-contact-service-title">{service.title}</h2>
                <p className="sa-contact-service-description">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="sa-contact-grid" aria-label="Canales de contacto">
          {content.contactCards.map((card) => (
            <ContactCard card={card} key={card.id} />
          ))}
        </div>

        <div className="sa-contact-footer">
          <span className="sa-contact-footer-label">Seguimos en contacto</span>
          <p className="sa-contact-footer-note">{content.footerNote}</p>
        </div>
      </div>
    </section>
  );
}
