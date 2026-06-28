'use client'

import { useEffect, useState } from 'react'
import { adminOrdersApi } from '@/lib/api'
import type { AdminOrder } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

const ORDER_STATUSES = [
  'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
]

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null)
  const [statusModal, setStatusModal] = useState<AdminOrder | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try {
      setOrders(await adminOrdersApi.getAll())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openStatusModal(order: AdminOrder) {
    setStatusModal(order)
    setNewStatus(order.status)
  }

  async function handleUpdateStatus() {
    if (!statusModal || !newStatus) return
    setSaving(true)
    try {
      await adminOrdersApi.updateStatus(statusModal.id, newStatus)
      toast('Statut mis à jour', 'success')
      setStatusModal(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = !search || [
      o.id, o.user.email, o.user.firstName, o.user.lastName,
    ].some(v => v.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const StatusBadge = ({ status }: { status: string }) => (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
      fontSize: '0.7rem', fontWeight: 600,
      background: `${getOrderStatusColor(status)}20`,
      color: getOrderStatusColor(status),
      whiteSpace: 'nowrap',
    }}>
      {getOrderStatusLabel(status)}
    </span>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="label" style={{ marginBottom: '0.3rem' }}>Gestion</p>
          <h1 className="display-lg" style={{ fontSize: '1.6rem' }}>Commandes</h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {orders.length} commande{orders.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="Rechercher (email, nom, id)…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', ...ORDER_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.4rem 0.85rem', fontSize: '0.75rem',
                borderRadius: 'var(--radius)', border: '1px solid',
                borderColor: filterStatus === s ? (s === 'all' ? 'var(--gold)' : getOrderStatusColor(s)) : 'var(--border)',
                color: filterStatus === s ? (s === 'all' ? 'var(--gold)' : getOrderStatusColor(s)) : 'var(--text-muted)',
                background: 'transparent', cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'Tous' : getOrderStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={(o) => o.id}
        emptyMessage="Aucune commande"
        data={filtered}
        columns={[
          {
            key: 'id', label: 'Réf.',
            render: (o) => (
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                #{o.id.slice(-8).toUpperCase()}
              </span>
            ),
          },
          {
            key: 'user', label: 'Client',
            render: (o) => (
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{o.user.firstName} {o.user.lastName}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.user.email}</p>
              </div>
            ),
          },
          {
            key: 'createdAt', label: 'Date',
            render: (o) => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ),
          },
          {
            key: 'items', label: 'Articles',
            render: (o) => <span style={{ color: 'var(--text-muted)' }}>{o.items.length} article{o.items.length > 1 ? 's' : ''}</span>,
          },
          {
            key: 'total', label: 'Total',
            render: (o) => <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(o.total)}</span>,
          },
          {
            key: 'status', label: 'Statut',
            render: (o) => <StatusBadge status={o.status} />,
          },
          {
            key: 'actions', label: 'Actions', width: '140px',
            render: (o) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setDetailOrder(o)}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Détail
                </button>
                <button
                  onClick={() => openStatusModal(o)}
                  style={{
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border-gold)',
                    color: 'var(--gold)', background: 'transparent', cursor: 'pointer',
                  }}
                >
                  Statut
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal détail commande */}
      <Modal
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={`Commande #${detailOrder?.id.slice(-8).toUpperCase()}`}
        width={580}
      >
        {detailOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Client */}
            <div className="card" style={{ padding: '1rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Client</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{detailOrder.user.firstName} {detailOrder.user.lastName}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{detailOrder.user.email}</p>
            </div>

            {/* Articles */}
            <div>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Articles</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {detailOrder.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', background: 'var(--bg-warm)',
                    borderRadius: 'var(--radius)', gap: '1rem',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                        {item.productName}
                        {item.quantity > 1 && <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>×{item.quantity}</span>}
                      </p>
                      {item.optionsSnapshot && Object.keys(item.optionsSnapshot).length > 0 && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {Object.entries(item.optionsSnapshot).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span style={{ color: 'var(--gold)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Récap prix */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sous-total</span>
                <span>{formatPrice(detailOrder.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Livraison</span>
                <span>{Number(detailOrder.shippingCost) > 0 ? formatPrice(detailOrder.shippingCost) : 'Offerte'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{formatPrice(detailOrder.total)}</span>
              </div>
            </div>

            {/* Statut */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Statut actuel :</p>
                <span style={{
                  padding: '0.3rem 0.75rem', borderRadius: 'var(--radius)',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: `${getOrderStatusColor(detailOrder.status)}20`,
                  color: getOrderStatusColor(detailOrder.status),
                }}>
                  {getOrderStatusLabel(detailOrder.status)}
                </span>
              </div>
              <button
                onClick={() => { setDetailOrder(null); openStatusModal(detailOrder) }}
                className="btn btn-outline"
                style={{ fontSize: '0.78rem' }}
              >
                Changer le statut
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal changement statut */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Changer le statut"
        width={400}
      >
        {statusModal && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Commande <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>#{statusModal.id.slice(-8).toUpperCase()}</strong> — {statusModal.user.firstName} {statusModal.user.lastName}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {ORDER_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${newStatus === s ? getOrderStatusColor(s) : 'var(--border)'}`,
                    background: newStatus === s ? `${getOrderStatusColor(s)}10` : 'var(--bg-warm)',
                    color: newStatus === s ? getOrderStatusColor(s) : 'var(--text)',
                    cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', fontWeight: 500,
                  }}
                >
                  {getOrderStatusLabel(s)}
                  {newStatus === s && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStatusModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                Annuler
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving || newStatus === statusModal.status}
                className="btn btn-gold"
                style={{ flex: 2 }}
              >
                {saving ? 'Mise à jour…' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
