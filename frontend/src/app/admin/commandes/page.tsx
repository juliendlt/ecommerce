'use client'

import { useEffect, useState } from 'react'
import { adminOrdersApi } from '@/lib/api'
import type { AdminOrder } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

const STATUSES = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
      fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
      background: `${getOrderStatusColor(status)}20`,
      color: getOrderStatusColor(status),
    }}>
      {getOrderStatusLabel(status)}
    </span>
  )
}

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<AdminOrder | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminOrder | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try { setOrders(await adminOrdersApi.getAll()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleUpdateStatus() {
    if (!statusTarget || !newStatus) return
    setSaving(true)
    try {
      await adminOrdersApi.updateStatus(statusTarget.id, newStatus)
      toast('Statut mis à jour', 'success')
      setStatusTarget(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    } finally { setSaving(false) }
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !search || [o.id, o.user.email, o.user.firstName, o.user.lastName]
      .some(v => v.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-title">Gestion</p>
          <h1 className="admin-page-title">Commandes</h1>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {orders.length} commande{orders.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtres */}
      <div className="admin-toolbar" style={{ flexWrap: 'wrap' }}>
        <input
          className="input-field admin-search"
          placeholder="Email, nom, référence…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`admin-filter-btn${filterStatus === s ? ' active' : ''}`}
          >
            {s === 'all' ? 'Tous' : getOrderStatusLabel(s)}
          </button>
        ))}
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={o => o.id}
        emptyMessage="Aucune commande"
        data={filtered}
        columns={[
          {
            key: 'ref', label: 'Réf.',
            render: o => (
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                #{o.id.slice(-8).toUpperCase()}
              </span>
            ),
          },
          {
            key: 'user', label: 'Client',
            render: o => (
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  {o.user.firstName} {o.user.lastName}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.user.email}</p>
              </div>
            ),
          },
          {
            key: 'date', label: 'Date',
            render: o => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            ),
          },
          {
            key: 'total', label: 'Total',
            render: o => (
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                {formatPrice(o.total)}
              </span>
            ),
          },
          {
            key: 'status', label: 'Statut',
            render: o => <StatusBadge status={o.status} />,
          },
          {
            key: 'actions', label: '', width: '150px',
            render: o => (
              <div className="actions-row">
                <button onClick={() => setDetail(o)} className="table-action-btn primary">
                  Détail
                </button>
                <button
                  onClick={() => { setStatusTarget(o); setNewStatus(o.status) }}
                  className="table-action-btn"
                >
                  Statut
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal détail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Commande #${detail?.id.slice(-8).toUpperCase()}`} width={560}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Client */}
            <div style={{ padding: '1rem', background: 'var(--bg-warm)', borderRadius: 'var(--radius)' }}>
              <p className="admin-section-title" style={{ marginBottom: '0.5rem' }}>Client</p>
              <p style={{ fontWeight: 500 }}>{detail.user.firstName} {detail.user.lastName}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{detail.user.email}</p>
            </div>

            {/* Articles */}
            <div>
              <p className="admin-section-title" style={{ marginBottom: '0.6rem' }}>Articles</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {detail.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.7rem 0.85rem', background: 'var(--bg-warm)',
                    borderRadius: 'var(--radius)', gap: '1rem',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                        {item.productName}
                        {item.quantity > 1 && (
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                            ×{item.quantity}
                          </span>
                        )}
                      </p>
                      {item.optionsSnapshot && Object.keys(item.optionsSnapshot).length > 0 && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
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

            {/* Totaux */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sous-total</span>
                <span>{formatPrice(detail.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Livraison</span>
                <span>{Number(detail.shippingCost) > 0 ? formatPrice(detail.shippingCost) : 'Offerte'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{formatPrice(detail.total)}</span>
              </div>
            </div>

            {/* Statut + action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusBadge status={detail.status} />
              <button
                onClick={() => { setDetail(null); setStatusTarget(detail); setNewStatus(detail.status) }}
                className="table-action-btn primary"
              >
                Changer le statut
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal changement statut */}
      <Modal open={!!statusTarget} onClose={() => setStatusTarget(null)} title="Changer le statut" width={400}>
        {statusTarget && (
          <div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Commande <strong style={{ fontFamily: 'monospace', color: 'var(--text)' }}>
                #{statusTarget.id.slice(-8).toUpperCase()}
              </strong> — {statusTarget.user.firstName} {statusTarget.user.lastName}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 1rem', borderRadius: 'var(--radius)',
                    border: `1px solid ${newStatus === s ? getOrderStatusColor(s) : 'var(--border)'}`,
                    background: newStatus === s ? `${getOrderStatusColor(s)}10` : 'var(--bg-warm)',
                    color: newStatus === s ? getOrderStatusColor(s) : 'var(--text)',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                  }}
                >
                  {getOrderStatusLabel(s)}
                  {newStatus === s && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStatusTarget(null)} className="btn btn-ghost" style={{ flex: 1 }}>
                Annuler
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving || newStatus === statusTarget.status}
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
