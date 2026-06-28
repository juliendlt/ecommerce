interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color?: string
}

export function StatCard({ label, value, sub, icon, color = 'var(--gold)' }: StatCardProps) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius)',
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', lineHeight: 1, color }}>{value}</p>
        {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{sub}</p>}
      </div>
    </div>
  )
}
