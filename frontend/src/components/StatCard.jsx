export default function StatCard({ title, value, subtitle, icon: Icon, color, bgColor }) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-icon" style={{ background: bgColor }}>
        <Icon size={20} color={color} />
      </div>
      <div className="stat-info">
        <h3 style={{ color }}>{value ?? '—'}</h3>
        <p>{title}</p>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );
}
