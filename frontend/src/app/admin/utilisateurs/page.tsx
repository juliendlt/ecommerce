'use client'

import { useEffect, useState } from 'react'
import { adminOrdersApi } from '@/lib/api'
import type { AdminOrder } from '@/lib/api'
import { Modal } from '@/components/admin/Modal'
import { AdminTable } from '@/components/admin/AdminTable'
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

// On reconstruit les users depuis les commandes (le backend n'expose pas /admin/users)
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
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminOrdersApi.getAll().then(allOrders => {
      setOrders(allOrders)
      // Construire la liste des users uniques à partir des commandes
      const map = new Map<string, UserSummary>()
      for (const order of allOrders) {
        const u = order.user
        const existing = map.get(u.id)
        const spent = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
          ? Number(order.total) : 0
        if (existing) {
          existing.orderCount++
          existing.totalSpent += spent
          if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
            existing.lastOrder = order.createdAt
          }
        } else {
          map.set(u.id, {
            id: u.id, email: u.email,
            firstName: u.firstName, lastName: u.lastName,
            orderCount: 1, totalSpent: spent,
            lastOrder: order.createdAt,
          })
        }
      }
      setUsers(Array.from(map.values()).sort((a, b) =>
        new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
      ))
    }).finally(() => setLoading(false))
  }, [])

  const userOrders = selectedUser
    ? orders.filter(o => o.user.id === selectedUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []

  const filtered = users.filter(u =>
    !search ||
    [u.email, u.firstName, u.lastName].some(v => v.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="label" style={{ marginBottom: '0.3rem' }}>Gestion</p>
          <h1 className="display-lg" style={{ fontSize: '1.6rem' }}>Utilisateurs</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {users.length} client{users.length > 1 ? 's' : ''} avec commandes
        </p>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <input
          className="input-field"
          placeholder="Rechercher (email, nom)…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={(u) => u.id}
        emptyMessage="Aucun utilisateur avec des commandes"
        data={filtered}
        columns={[
          {
            key: 'name', label: 'Client',
            render: (u) => (
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.88rem' }}>{u.firstName} {u.lastName}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
            ),
          },
          {
            key: 'orderCount', label: 'Commandes',
            render: (u) => (
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{u.orderCount}</span>
            ),
          },
          {
            key: 'totalSpent', label: 'Total dépensé',
            render: (u) => (
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                {u.totalSpent > 0 ? formatPrice(u.totalSpent) : '—'}
              </span>
            ),
          },
          {
            key: 'lastOrder', label: 'Dernière commande',
            render: (u) => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {new Date(u.lastOrder).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ),
          },
          {
            key: 'actions', label: '', width: '100px',
            render: (u) => (
              <button
                onClick={() => setSelectedUser(u)}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Commandes
              </button>
            ),
          },
        ]}
      />

      {/* Modal commandes d'un user */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        width={620}
      >
        {selectedUser && (
          <div>
            {/* Infos user */}
            <div style={{
              display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
              padding: '1rem', background: 'var(--bg-warm)',
              borderRadius: 'var(--radius)', marginBottom: '1.5rem',
            }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</p>
                <p style={{ fontSize: '0.85rem' }}>{selectedUser.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Commandes</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedUser.orderCount}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total dépensé</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                  {selectedUser.totalSpent > 0 ? formatPrice(selectedUser.totalSpent) : '—'}
                </p>
              </div>
            </div>

            {/* Liste des commandes */}
            <p className="label" style={{ marginBottom: '0.75rem' }}>Historique des commandes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 360, overflowY: 'auto' }}>
              {userOrders.map(order => (
                <div key={order.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', background: 'var(--bg-warm)',
                  borderRadius: 'var(--radius)', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
                      fontSize: '0.7rem', fontWeight: 600,
                      background: `${getOrderStatusColor(order.status)}20`,
                      color: getOrderStatusColor(order.status),
                    }}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
