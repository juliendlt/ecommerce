'use client'

import { useEffect, useState } from 'react'
import { adminOrdersApi } from '@/lib/api'
import type { AdminOrder } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

interface UserSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  orderCount: number
  totalSpent: number
  lastOrder: string
}

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<UserSummary | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminOrdersApi.getAll()
      .then(all => {
        setOrders(all)
        // Construire la liste des clients à partir des commandes
        const map = new Map<string, UserSummary>()
        for (const o of all) {
          const u = o.user
          const paid = ['PAID','PROCESSING','SHIPPED','DELIVERED'].includes(o.status)
          const existing = map.get(u.id)
          if (existing) {
            existing.orderCount++
            if (paid) existing.totalSpent += Number(o.total)
            if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
              existing.lastOrder = o.createdAt
            }
          } else {
            map.set(u.id, {
              id: u.id, email: u.email,
              firstName: u.firstName, lastName: u.lastName,
              orderCount: 1,
              totalSpent: paid ? Number(o.total) : 0,
              lastOrder: o.createdAt,
            })
          }
        }
        setUsers(
          Array.from(map.values())
            .sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime())
        )
      })
      .catch(() => toast('Erreur chargement', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    !search || [u.email, u.firstName, u.lastName]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  )

  const userOrders = selected
    ? orders
        .filter(o => o.user.id === selected.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-title">Gestion</p>
          <h1 className="admin-page-title">Utilisateurs</h1>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {users.length} client{users.length > 1 ? 's' : ''} avec commandes
        </span>
      </div>

      <div className="admin-toolbar">
        <input
          className="input-field admin-search"
          placeholder="Rechercher par email ou nom…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={u => u.id}
        emptyMessage="Aucun utilisateur avec des commandes"
        data={filtered}
        columns={[
          {
            key: 'name', label: 'Client',
            render: u => (
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                  {u.firstName} {u.lastName}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
            ),
          },
          {
            key: 'orderCount', label: 'Commandes',
            render: u => <span style={{ fontWeight: 600 }}>{u.orderCount}</span>,
          },
          {
            key: 'totalSpent', label: 'Total dépensé',
            render: u => (
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                {u.totalSpent > 0 ? formatPrice(u.totalSpent) : '—'}
              </span>
            ),
          },
          {
            key: 'lastOrder', label: 'Dernière commande',
            render: u => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {new Date(u.lastOrder).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            ),
          },
          {
            key: 'actions', label: '', width: '110px',
            render: u => (
              <button onClick={() => setSelected(u)} className="table-action-btn primary">
                Commandes
              </button>
            ),
          },
        ]}
      />

      {/* Modal historique commandes */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.firstName} ${selected.lastName}` : ''}
        width={580}
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Résumé client */}
            <div style={{
              display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
              padding: '1rem', background: 'var(--bg-warm)', borderRadius: 'var(--radius)',
            }}>
              {[
                { label: 'Email', value: selected.email },
                { label: 'Commandes', value: String(selected.orderCount) },
                { label: 'Total dépensé', value: selected.totalSpent > 0 ? formatPrice(selected.totalSpent) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Commandes */}
            <div>
              <p className="admin-section-title" style={{ marginBottom: '0.6rem' }}>Historique</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 340, overflowY: 'auto' }}>
                {userOrders.map(o => (
                  <div key={o.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 0.85rem', background: 'var(--bg-warm)',
                    borderRadius: 'var(--radius)', gap: '1rem', flexWrap: 'wrap',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        #{o.id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{o.items.length} article{o.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius)',
                        fontSize: '0.68rem', fontWeight: 600,
                        background: `${getOrderStatusColor(o.status)}20`,
                        color: getOrderStatusColor(o.status),
                      }}>
                        {getOrderStatusLabel(o.status)}
                      </span>
                      <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.88rem' }}>
                        {formatPrice(o.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
