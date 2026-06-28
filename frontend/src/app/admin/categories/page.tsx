'use client'

import { useEffect, useState } from 'react'
import { adminCategoriesApi } from '@/lib/api'
import type { Category } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'

const EMPTY_FORM = { name: '', slug: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState<Category | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setCategories(await adminCategoriesApi.getAll())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function autoSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.slug) {
      toast('Nom et slug sont obligatoires', 'error')
      return
    }
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
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteModal) return
    try {
      await adminCategoriesApi.delete(deleteModal.id)
      toast('Catégorie supprimée', 'success')
      setDeleteModal(null)
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur lors de la suppression', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="label" style={{ marginBottom: '0.3rem' }}>Catalogue</p>
          <h1 className="display-lg" style={{ fontSize: '1.6rem' }}>Catégories</h1>
        </div>
        <button onClick={openCreate} className="btn btn-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nouvelle catégorie
        </button>
      </div>

      <AdminTable
        loading={loading}
        keyExtractor={(c) => c.id}
        emptyMessage="Aucune catégorie"
        data={categories}
        columns={[
          { key: 'name', label: 'Nom', render: (c) => <span style={{ fontWeight: 500 }}>{c.name}</span> },
          {
            key: 'slug', label: 'Slug',
            render: (c) => (
              <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {c.slug}
              </span>
            ),
          },
          {
            key: 'actions', label: 'Actions', width: '140px',
            render: (c) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openEdit(c)}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Éditer
                </button>
                <button
                  onClick={() => setDeleteModal(c)}
                  style={{
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                    borderRadius: 'var(--radius)', border: '1px solid rgba(196,122,106,0.4)',
                    color: '#c47a6a', background: 'transparent', cursor: 'pointer',
                  }}
                >
                  Supprimer
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
        title={editing ? `Modifier : ${editing.name}` : 'Nouvelle catégorie'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label className="form-label">Nom <span style={{ color: 'var(--gold)' }}>*</span></label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex : Accessoires"
            />
          </div>

          <div>
            <label className="form-label">Slug <span style={{ color: 'var(--gold)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="input-field"
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="accessoires"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setForm(p => ({ ...p, slug: autoSlug(p.name) }))}
                className="btn btn-outline"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                Auto
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Uniquement des lettres minuscules, chiffres et tirets
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

      {/* Modal confirmation suppression */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Supprimer la catégorie"
        width={420}
      >
        <div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Êtes-vous sûr de vouloir supprimer la catégorie{' '}
            <strong style={{ color: 'var(--text)' }}>{deleteModal?.name}</strong> ?
            Cette action est irréversible. Les produits associés seront affectés.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setDeleteModal(null)} className="btn btn-ghost" style={{ flex: 1 }}>
              Annuler
            </button>
            <button
              onClick={handleDelete}
              style={{
                flex: 2, padding: '0.75rem 1.75rem',
                background: '#c47a6a', color: '#fff',
                borderRadius: 'var(--radius)', fontWeight: 600,
                fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', border: 'none',
              }}
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
