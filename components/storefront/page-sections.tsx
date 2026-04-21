import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function PageIntro({ eyebrow, title, description, aside }: PageIntroProps) {
  return (
    <section className="page-intro">
      <div className="page-intro-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {aside ? <aside className="page-intro-aside">{aside}</aside> : null}
    </section>
  );
}

type SplitPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function SplitPanel({ title, description, children }: SplitPanelProps) {
  return (
    <section className="split-panel">
      <div className="split-panel-header">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="split-panel-content">{children}</div>
    </section>
  );
}
