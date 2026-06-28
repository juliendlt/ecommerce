'use client'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  width?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string
}

export function AdminTable<T>({
  columns, data, loading, emptyMessage = 'Aucune donnée', keyExtractor,
}: AdminTableProps<T>) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-warm)', borderBottom: '1px solid var(--border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '0.75rem 1rem', textAlign: 'left',
                    fontSize: '0.7rem', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--text-muted)', whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '1rem' }}>
                      <div style={{
                        height: 14, background: 'var(--bg-warm)',
                        borderRadius: 4, width: '60%',
                        animation: 'pulse 1.5s ease infinite',
                      }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-warm)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '0.85rem 1rem', fontSize: '0.88rem', verticalAlign: 'middle' }}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}
