export function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Pill({ tone = "default", children }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}
