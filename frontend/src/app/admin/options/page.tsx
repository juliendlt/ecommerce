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
  const [options, setOptions] = useState<OptionValue[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<OptionValue | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  async function load() {
    setLoading(true)
    try {
      setOptions(await adminOptionsApi.getAll())
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
        await adminOptionsApi.update(editing.id, payload)
        toast('Option mise à jour', 'success')
      } else {
        await adminOptionsApi.create(payload)
        toast('Option créée', 'success')
      }
      setModalOpen(false)
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(opt: OptionValue) {
    try {
      await adminOptionsApi.update(opt.id, { isAvailable: !opt.isAvailable })
      toast(opt.isAvailable ? 'Option désactivée' : 'Option activée', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    }
  }

  const types = ['all', ...Array.from(new Set(options.map(o => o.type)))]
  const filtered = filterType === 'all' ? options : options.filter(o => o.type === filterType)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="label" style={{ marginBottom: '0.3rem' }}>Catalogue</p>
          <h1 className="display-lg" style={{ fontSize: '1.6rem' }}>Options</h1>
        </div>
        <button onClick={openCreate} className="btn btn-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nouvelle option
        </button>
      </div>

      {/* Filtre par type */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: '0.4rem 1rem', fontSize: '0.78rem',
              borderRadius: 'var(--radius)', border: '1px solid',
              borderColor: filterType === t ? 'var(--gold)' : 'var(--border)',
              color: filterType === t ? 'var(--gold)' : 'var(--text-muted)',
              background: filterType === t ? 'rgba(201,168,124,0.08)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {t === 'all' ? 'Tous' : t}
          </button>
        ))}
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={(o) => o.id}
        emptyMessage="Aucune option"
        data={filtered}
        columns={[
          {
            key: 'label', label: 'Label',
            render: (o) => <span style={{ fontWeight: 500 }}>{o.label}</span>,
          },
          {
            key: 'type', label: 'Type',
            render: (o) => (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
                fontSize: '0.72rem', fontWeight: 600,
                background: 'rgba(201,168,124,0.1)',
                color: 'var(--gold)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {o.type}
              </span>
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
            key: 'isAvailable', label: 'Disponible',
            render: (o) => (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
                fontSize: '0.7rem', fontWeight: 600,
                background: o.isAvailable ? 'rgba(168,197,160,0.15)' : 'rgba(196,122,106,0.15)',
                color: o.isAvailable ? '#a8c5a0' : '#c47a6a',
              }}>
                {o.isAvailable ? 'Oui' : 'Non'}
              </span>
            ),
          },
          {
            key: 'actions', label: 'Actions', width: '140px',
            render: (o) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openEdit(o)}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleToggle(o)}
                  style={{
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                    color: o.isAvailable ? '#c47a6a' : '#a8c5a0',
                    background: 'transparent', cursor: 'pointer',
                  }}
                >
                  {o.isAvailable ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Modifier : ${editing.label}` : 'Nouvelle option'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label className="form-label">Label <span style={{ color: 'var(--gold)' }}>*</span></label>
            <input
              className="input-field"
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              placeholder="Ex : Liberty Betsy, Doré, S (0-2 ans)…"
            />
          </div>

          <div>
            <label className="form-label">Type <span style={{ color: 'var(--gold)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {COMMON_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  style={{
                    padding: '0.3rem 0.75rem', fontSize: '0.75rem',
                    borderRadius: 'var(--radius)', border: '1px solid',
                    borderColor: form.type === t ? 'var(--gold)' : 'var(--border)',
                    color: form.type === t ? 'var(--gold)' : 'var(--text-muted)',
                    background: 'transparent', cursor: 'pointer',
                  }}
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

          <div>
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
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Montant ajouté au prix de base du produit si cette option est choisie
            </p>
          </div>

          {editing && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(201,168,124,0.06)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem', color: 'var(--text-muted)',
            }}>
              💡 Pour désactiver cette option sur tous les produits, utilisez le bouton "Désactiver" dans le tableau.
            </div>
          )}

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
