'use client'

import { useEffect, useState } from 'react'
import { adminOptionsApi } from '@/lib/api'
import type { OptionValue } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'

const EMPTY_FORM = { label: '', type: '', priceOffSet: '0' }
const COMMON_TYPES = ['tissu', 'finition', 'couleur', 'taille', 'matiere']

export default function AdminOptionsPage() {
  // On maintient TOUTES les options localement (actives + désactivées)
  // Le backend /options ne retourne que les actives, donc on fusionne :
  // au chargement on récupère les actives, les désactivées restent dans allOptions
  // jusqu'à rechargement. Après un toggle on recharge tout.
  const [allOptions, setAllOptions] = useState<OptionValue[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<OptionValue | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  async function load() {
    setLoading(true)
    try {
      // Le backend retourne uniquement les actives
      // On merge avec ce qu'on a déjà pour conserver les inactives
      const active = await adminOptionsApi.getAll()
      setAllOptions(prev => {
        // Garder les inactives connues + remplacer les actives par la réponse fraîche
        const inactiveKnown = prev.filter(o => !o.isAvailable)
        const merged = [...active, ...inactiveKnown.filter(o => !active.find(a => a.id === o.id))]
        return merged
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(opt: OptionValue) {
    setEditing(opt)
    setForm({ label: opt.label, type: opt.type, priceOffSet: String(opt.priceOffSet) })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.label || !form.type) {
      toast('Label et type sont obligatoires', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        label: form.label,
        type: form.type,
        priceOffSet: parseFloat(form.priceOffSet) || 0,
      }
      if (editing) {
        const updated = await adminOptionsApi.update(editing.id, payload)
        // Mettre à jour localement
        setAllOptions(prev => prev.map(o => o.id === editing.id ? { ...o, ...updated } : o))
        toast('Option mise à jour', 'success')
      } else {
        const created = await adminOptionsApi.create(payload)
        setAllOptions(prev => [...prev, { ...created, isAvailable: true }])
        toast('Option créée', 'success')
      }
      setModalOpen(false)
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(opt: OptionValue) {
    const next = !opt.isAvailable
    try {
      // Optimistic update
      setAllOptions(prev => prev.map(o => o.id === opt.id ? { ...o, isAvailable: next } : o))
      await adminOptionsApi.update(opt.id, { isAvailable: next })
      toast(next ? 'Option réactivée' : 'Option désactivée', 'success')
    } catch (e: any) {
      // Rollback
      setAllOptions(prev => prev.map(o => o.id === opt.id ? { ...o, isAvailable: opt.isAvailable } : o))
      toast(e.message || 'Erreur', 'error')
    }
  }

  // Types disponibles dans les données actuelles
  const types = ['all', ...Array.from(new Set(allOptions.map(o => o.type))).sort()]

  const filtered = allOptions.filter(o => {
    const matchType = filterType === 'all' || o.type === filterType
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? o.isAvailable :
      !o.isAvailable
    return matchType && matchStatus
  })

  const activeCount = allOptions.filter(o => o.isAvailable).length
  const inactiveCount = allOptions.filter(o => !o.isAvailable).length

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <p className="admin-section-title">Catalogue</p>
          <h1 className="admin-page-title">Options</h1>
        </div>
        <button onClick={openCreate} className="btn btn-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nouvelle option
        </button>
      </div>

      {/* Compteurs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: allOptions.length, status: 'all' as const },
          { label: 'Actives', count: activeCount, status: 'active' as const },
          { label: 'Désactivées', count: inactiveCount, status: 'inactive' as const },
        ].map(({ label, count, status }) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`admin-filter-btn${filterStatus === status ? ' active' : ''}`}
          >
            {label} <span style={{
              marginLeft: '0.4rem',
              padding: '0.1rem 0.45rem',
              borderRadius: '99px',
              background: filterStatus === status ? 'var(--gold)' : 'var(--bg-warm)',
              color: filterStatus === status ? 'var(--text-dark)' : 'var(--text-muted)',
              fontSize: '0.68rem', fontWeight: 700,
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Filtres par type */}
      <div className="admin-toolbar">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`admin-filter-btn${filterType === t ? ' active' : ''}`}
          >
            {t === 'all' ? 'Tous les types' : t}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <AdminTable
        loading={loading}
        keyExtractor={(o) => o.id}
        emptyMessage="Aucune option trouvée"
        data={filtered}
        columns={[
          {
            key: 'label', label: 'Label',
            render: (o) => (
              <span style={{ fontWeight: 500, opacity: o.isAvailable ? 1 : 0.5 }}>
                {o.label}
              </span>
            ),
          },
          {
            key: 'type', label: 'Type',
            render: (o) => (
              <span className="badge badge-gold">{o.type}</span>
            ),
          },
          {
            key: 'priceOffSet', label: 'Surcoût',
            render: (o) => (
              <span style={{ color: Number(o.priceOffSet) > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
                {Number(o.priceOffSet) > 0 ? `+${formatPrice(o.priceOffSet)}` : '—'}
              </span>
            ),
          },
          {
            key: 'isAvailable', label: 'Statut',
            render: (o) => (
              <span className={`badge ${o.isAvailable ? 'badge-green' : 'badge-red'}`}>
                {o.isAvailable ? 'Active' : 'Désactivée'}
              </span>
            ),
          },
          {
            key: 'actions', label: 'Actions', width: '160px',
            render: (o) => (
              <div className="actions-row">
                <button
                  onClick={() => openEdit(o)}
                  className="table-action-btn primary"
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleToggle(o)}
                  className={`table-action-btn ${o.isAvailable ? 'danger' : 'success'}`}
                >
                  {o.isAvailable ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal créer/modifier */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Modifier : ${editing.label}` : 'Nouvelle option'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group">
            <label className="form-label">
              Label <span style={{ color: 'var(--gold)' }}>*</span>
            </label>
            <input
              className="input-field"
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Ex : Liberty Betsy, Doré, S (0-2 ans)…"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Type <span style={{ color: 'var(--gold)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {COMMON_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={`option-chip${form.type === t ? ' selected' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              className="input-field"
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              placeholder="Ou saisissez un type personnalisé"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Surcoût (€)</label>
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.5"
              value={form.priceOffSet}
              onChange={e => setForm(p => ({ ...p, priceOffSet: e.target.value }))}
              placeholder="0.00"
            />
            <p className="form-hint">
              Montant ajouté au prix de base si cette option est choisie par le client
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button onClick={() => setModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-gold" style={{ flex: 2 }}>
              {saving ? 'Sauvegarde…' : editing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
