export function SectionCard({ badge, title, subtitle, children, right }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <div className="section-title-group">
          {badge && <div className="section-badge">{badge}</div>}
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
      {children}
    </section>
  );
}

export function Badge({ tone = 'gray', children }) {
  const cls = {
    green:  'badge-green',
    yellow: 'badge-yellow',
    red:    'badge-red',
    gray:   'badge-gray',
  }[tone] || 'badge-gray';
  return <span className={`badge ${cls}`}>{children}</span>;
}

export function EmptyState({ icon = '🎬', text }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-text">{text}</div>
    </div>
  );
}
