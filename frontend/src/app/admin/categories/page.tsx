'use client'

import { useEffect, useState } from 'react'
import { adminCategoriesApi } from '@/lib/api'
import type { Category } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'

const EMPTY = { name: '', slug: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try { setCategories(await adminCategoriesApi.getAll()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function autoSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  function openEdit(cat: Category) { setEditing(cat); setForm({ name: cat.name, slug: cat.slug }); setModalOpen(true) }

  async function handleSave() {
    if (!form.name || !form.slug) { toast('Nom et slug obligatoires', 'error'); return }
    setSaving(true)
    try {
      if (editing) {
        await adminCategoriesApi.update(editing.id, form)
        toast('Catégorie mise à jour', 'success')
      } else {
        await adminCategoriesApi.create(form)
        toast('Catégorie créée', 'success')
      }
      setModalOpen(false)
      load()
    } catch (e: any) {
      toast(
        e.message === 'CATEGORY_ALREADY_EXISTS' ? 'Ce slug existe déjà' : e.message || 'Erreur',
        'error'
      )
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await adminCategoriesApi.delete(deleteTarget.id)
      toast('Catégorie supprimée', 'success')
      setDeleteTarget(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur lors de la suppression', 'error')
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <p className="admin-section-title">Catalogue</p>
          <h1 className="admin-page-title">Catégories</h1>
        </div>
        <button onClick={openCreate} className="btn btn-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nouvelle catégorie
        </button>
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={c => c.id}
        emptyMessage="Aucune catégorie"
        data={categories}
        columns={[
          {
            key: 'name', label: 'Nom',
            render: c => <span style={{ fontWeight: 500 }}>{c.name}</span>,
          },
          {
            key: 'slug', label: 'Slug',
            render: c => (
              <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {c.slug}
              </span>
            ),
          },
          {
            key: 'actions', label: '', width: '150px',
            render: c => (
              <div className="actions-row">
                <button onClick={() => openEdit(c)} className="table-action-btn primary">
                  Éditer
                </button>
                <button onClick={() => setDeleteTarget(c)} className="table-action-btn danger">
                  Supprimer
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal créer / modifier */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Modifier : ${editing.name}` : 'Nouvelle catégorie'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Nom <span style={{ color: 'var(--gold)' }}>*</span></label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex : Accessoires"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug <span style={{ color: 'var(--gold)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                className="input-field"
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="accessoires"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setForm(p => ({ ...p, slug: autoSlug(p.name) }))}
                className="table-action-btn"
              >
                Auto
              </button>
            </div>
            <p className="form-hint">Minuscules, chiffres et tirets uniquement</p>
          </div>

          <hr className="section-divider" />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-gold" style={{ flex: 2 }}>
              {saving ? 'Sauvegarde…' : editing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la catégorie"
        width={420}
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
          Supprimer <strong style={{ color: 'var(--text)' }}>{deleteTarget?.name}</strong> ?
          Cette action est irréversible. Les produits liés seront affectés.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost" style={{ flex: 1 }}>
            Annuler
          </button>
          <button
            onClick={handleDelete}
            style={{
              flex: 2, background: '#c47a6a', color: '#fff', border: 'none',
              borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.8rem',
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              padding: '0.75rem',
            }}
          >
            Supprimer définitivement
          </button>
        </div>
      </Modal>
    </div>
  )
}
