'use client'

import { useEffect, useState } from 'react'
import { adminProductsApi, adminCategoriesApi } from '@/lib/api'
import type { Product, Category } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'

const EMPTY_FORM = {
  name: '', slug: '', shortDescription: '', description: '',
  basePrice: '', categoryId: '', isActive: true,
}

export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([adminProductsApi.getAll(), adminCategoriesApi.getAll()])
      setProducts(p)
      setCategories(c)
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

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      basePrice: String(product.basePrice),
      categoryId: product.category.id,
      isActive: product.isActive,
    })
    setModalOpen(true)
  }

  function autoSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSave() {
    if (!form.name || !form.slug || !form.basePrice || !form.categoryId) {
      toast('Veuillez remplir tous les champs obligatoires', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        basePrice: parseFloat(form.basePrice),
        categoryId: form.categoryId,
        isActive: form.isActive,
      }
      if (editing) {
        await adminProductsApi.update(editing.id, payload)
        toast('Produit mis à jour', 'success')
      } else {
        await adminProductsApi.create(payload)
        toast('Produit créé', 'success')
      }
      setModalOpen(false)
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(product: Product) {
    try {
      await adminProductsApi.update(product.id, { isActive: !product.isActive })
      toast(product.isActive ? 'Produit désactivé' : 'Produit activé', 'success')
      load()
    } catch (e: any) {
      toast(e.message || 'Erreur', 'error')
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  )

  const f = (key: keyof typeof form, label: string, required = false) => (
    <div>
      <label className="form-label">{label}{required && <span style={{ color: 'var(--gold)' }}> *</span>}</label>
      <input
        className="input-field"
        value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={label}
      />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="label" style={{ marginBottom: '0.3rem' }}>Catalogue</p>
          <h1 className="display-lg" style={{ fontSize: '1.6rem' }}>Produits</h1>
        </div>
        <button onClick={openCreate} className="btn btn-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau produit
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          className="input-field"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {/* Table */}
      <AdminTable
        loading={loading}
        keyExtractor={(p) => p.id}
        emptyMessage="Aucun produit trouvé"
        data={filtered}
        columns={[
          {
            key: 'name', label: 'Produit',
            render: (p) => (
              <div>
                <p style={{ fontWeight: 500, marginBottom: '0.1rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.slug}</p>
              </div>
            ),
          },
          { key: 'category', label: 'Catégorie', render: (p) => p.category.name },
          {
            key: 'basePrice', label: 'Prix',
            render: (p) => <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(p.basePrice)}</span>,
          },
          {
            key: 'images', label: 'Images',
            render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.images.length}</span>,
          },
          {
            key: 'isActive', label: 'Statut',
            render: (p) => (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: 'var(--radius)',
                fontSize: '0.7rem', fontWeight: 600,
                background: p.isActive ? 'rgba(168,197,160,0.15)' : 'rgba(196,122,106,0.15)',
                color: p.isActive ? '#a8c5a0' : '#c47a6a',
              }}>
                {p.isActive ? 'Actif' : 'Inactif'}
              </span>
            ),
          },
          {
            key: 'actions', label: 'Actions', width: '120px',
            render: (p) => (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => openEdit(p)}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Éditer
                </button>
                <button
                  onClick={() => handleToggleActive(p)}
                  style={{
                    padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                    color: p.isActive ? '#c47a6a' : '#a8c5a0',
                    background: 'transparent', cursor: 'pointer',
                  }}
                >
                  {p.isActive ? 'Désactiver' : 'Activer'}
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
        title={editing ? `Modifier : ${editing.name}` : 'Nouveau produit'}
        width={560}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {f('name', 'Nom du produit', true)}

          <div>
            <label className="form-label">Slug <span style={{ color: 'var(--gold)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="input-field"
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="mon-produit"
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
          </div>

          <div>
            <label className="form-label">Catégorie <span style={{ color: 'var(--gold)' }}>*</span></label>
            <select
              className="input-field"
              value={form.categoryId}
              onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
              style={{ appearance: 'auto', cursor: 'pointer' }}
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Prix de base (€) <span style={{ color: 'var(--gold)' }}>*</span></label>
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.01"
              value={form.basePrice}
              onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          {f('shortDescription', 'Description courte (carte produit)')}

          <div>
            <label className="form-label">Description complète</label>
            <textarea
              className="input-field"
              rows={4}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description détaillée du produit…"
              style={{ resize: 'vertical' }}
            />
          </div>

          {editing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                Produit actif (visible sur la boutique)
              </label>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button onClick={() => setModalOpen(false)} className="btn btn-ghost" style={{ flex: 1 }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-gold" style={{ flex: 2 }}>
              {saving ? 'Sauvegarde…' : editing ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
