'use client'

import { useEffect, useState, useRef } from 'react'
import { adminProductsApi, adminCategoriesApi, adminOptionsApi, adminImagesApi } from '@/lib/api'
import type { Product, Category, OptionValue, ProductImage } from '@/lib/api'
import { AdminTable } from '@/components/admin/AdminTable'
import { Modal } from '@/components/admin/Modal'
import { toast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────────────────────────
interface PendingImage {
  tempId: string
  file: File
  preview: string
  alt: string
  position: number
  optionValueId: string // '' = image de base
}

const EMPTY_FORM = {
  name: '', slug: '', shortDescription: '', description: '',
  basePrice: '', categoryId: '', isActive: true,
}

// ─────────────────────────────────────────────────────────────
// Page liste produits
// ─────────────────────────────────────────────────────────────
export default function AdminProduitsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [options, setOptions] = useState<OptionValue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null | 'new'>('new')
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [p, c, o] = await Promise.all([
        adminProductsApi.getAll(),
        adminCategoriesApi.getAll(),
        adminOptionsApi.getAll(),
      ])
      setProducts(p)
      setCategories(c)
      setOptions(o)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditingProduct(null)
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setModalOpen(true)
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
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <p className="admin-section-title">Catalogue</p>
          <h1 className="admin-page-title">Produits</h1>
        </div>
        <button onClick={openCreate} className="btn btn-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nouveau produit
        </button>
      </div>

      {/* Barre recherche */}
      <div className="admin-toolbar">
        <input
          className="input-field admin-search"
          placeholder="Rechercher par nom, slug, catégorie…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {!loading && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filtered.length} produit{filtered.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tableau */}
      <AdminTable
        loading={loading}
        keyExtractor={p => p.id}
        emptyMessage="Aucun produit — créez-en un !"
        data={filtered}
        columns={[
          {
            key: 'name', label: 'Produit',
            render: p => (
              <div>
                <p style={{ fontWeight: 500, marginBottom: '0.1rem' }}>{p.name}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {p.slug}
                </p>
              </div>
            ),
          },
          { key: 'category', label: 'Catégorie', render: p => p.category.name },
          {
            key: 'basePrice', label: 'Prix',
            render: p => (
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>
                {formatPrice(p.basePrice)}
              </span>
            ),
          },
          {
            key: 'images', label: 'Images',
            render: p => (
              <span style={{ color: 'var(--text-muted)' }}>
                {p.images.length}
              </span>
            ),
          },
          {
            key: 'options', label: 'Groupes',
            render: p => (
              <span style={{ color: 'var(--text-muted)' }}>
                {p.optionGroups.length}
              </span>
            ),
          },
          {
            key: 'isActive', label: 'Statut',
            render: p => (
              <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                {p.isActive ? 'Actif' : 'Inactif'}
              </span>
            ),
          },
          {
            key: 'actions', label: '', width: '160px',
            render: p => (
              <div className="actions-row">
                <button onClick={() => openEdit(p)} className="table-action-btn primary">
                  Éditer
                </button>
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`table-action-btn ${p.isActive ? 'danger' : 'success'}`}
                >
                  {p.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          product={editingProduct as Product | null}
          categories={categories}
          availableOptions={options}
          onClose={() => { setModalOpen(false); load() }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Modal produit (2 étapes : Infos → Images)
// ─────────────────────────────────────────────────────────────
interface ProductModalProps {
  product: Product | null
  categories: Category[]
  availableOptions: OptionValue[]
  onClose: () => void
}

type Step = 'info' | 'images'

function ProductModal({ product, categories, availableOptions, onClose }: ProductModalProps) {
  const isEdit = !!product
  const [step, setStep] = useState<Step>('info')
  const [saving, setSaving] = useState(false)
  const [productId, setProductId] = useState<string | null>(product?.id ?? null)

  // ── Formulaire infos ──────────────────────────────────────
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    basePrice: product ? String(product.basePrice) : '',
    categoryId: product?.category?.id ?? '',
    isActive: product?.isActive ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function autoSlug(name: string) {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Requis'
    if (!form.slug.trim()) e.slug = 'Requis'
    if (!form.categoryId) e.categoryId = 'Requis'
    if (!form.basePrice || isNaN(parseFloat(form.basePrice))) e.basePrice = 'Prix invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSaveInfo() {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        description: form.description.trim() || undefined,
        basePrice: parseFloat(form.basePrice),
        categoryId: form.categoryId,
        isActive: form.isActive,
      }
      if (isEdit && productId) {
        await adminProductsApi.update(productId, payload)
        toast('Produit mis à jour', 'success')
      } else {
        const created = await adminProductsApi.create(payload)
        setProductId(created.id)
        toast('Produit créé', 'success')
      }
      setStep('images')
    } catch (e: any) {
      toast(e.message || 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Gestion images ────────────────────────────────────────
  const [existingImages, setExistingImages] = useState<ProductImage[]>(
    product?.images ?? []
  )
  const [pending, setPending] = useState<PendingImage[]>([])
  const [uploadingSave, setUploadingSave] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Options disponibles pour lier une image à une variante
  // = toutes les options des groupes du produit en cours
  const productOptions = isEdit
    ? product.optionGroups.flatMap(g => g.values)
    : availableOptions

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newPending: PendingImage[] = files.map((file, i) => ({
      tempId: `${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      alt: '',
      position: existingImages.length + pending.length + i,
      optionValueId: '',
    }))
    setPending(prev => [...prev, ...newPending])
    if (fileRef.current) fileRef.current.value = ''
  }

  function updatePending(tempId: string, patch: Partial<PendingImage>) {
    setPending(prev => prev.map(p => p.tempId === tempId ? { ...p, ...patch } : p))
  }

  async function deleteExisting(imageId: string) {
    setDeletingId(imageId)
    try {
      await adminImagesApi.delete(imageId)
      setExistingImages(prev => prev.filter(i => i.id !== imageId))
      toast('Image supprimée', 'success')
    } catch (e: any) {
      toast(e.message || 'Erreur suppression', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleFinish() {
    if (!productId) { onClose(); return }
    if (pending.length === 0) { onClose(); return }

    setUploadingSave(true)
    let ok = 0
    for (const img of pending) {
      try {
        await adminImagesApi.upload({
          file: img.file,
          productId,
          alt: img.alt || undefined,
          position: img.position,
          optionValueId: img.optionValueId || undefined,
        })
        ok++
      } catch (e: any) {
        toast(`Erreur "${img.file.name}" : ${e.message}`, 'error')
      }
    }
    setUploadingSave(false)
    if (ok > 0) toast(`${ok} image${ok > 1 ? 's' : ''} uploadée${ok > 1 ? 's' : ''}`, 'success')
    onClose()
  }

  const title = isEdit ? `Modifier : ${product!.name}` : 'Nouveau produit'

  return (
    <Modal open onClose={onClose} title={title} width={640}>

      {/* Stepper */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        marginBottom: '1.75rem',
      }}>
        {(['info', 'images'] as Step[]).map((s, i) => {
          const labels = { info: 'Informations', images: 'Images' }
          const active = step === s
          const done = step === 'images' && s === 'info'
          return (
            <button
              key={s}
              onClick={() => { if (s === 'info' || productId) setStep(s) }}
              disabled={s === 'images' && !productId}
              style={{
                flex: 1, padding: '0.7rem',
                fontSize: '0.8rem', fontWeight: 600,
                borderBottom: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
                color: active ? 'var(--gold)' : done ? 'var(--text)' : 'var(--text-muted)',
                opacity: s === 'images' && !productId ? 0.4 : 1,
                background: 'none', cursor: productId || s === 'info' ? 'pointer' : 'not-allowed',
                marginBottom: '-1px', transition: 'all var(--transition)',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: '50%', fontSize: '0.65rem', fontWeight: 700,
                marginRight: '0.5rem',
                background: active ? 'var(--gold)' : done ? 'rgba(168,197,160,0.3)' : 'var(--bg-warm)',
                color: active ? 'var(--text-dark)' : done ? '#a8c5a0' : 'var(--text-muted)',
              }}>
                {done ? '✓' : i + 1}
              </span>
              {labels[s]}
            </button>
          )
        })}
      </div>

      {/* ── Étape 1 : Informations ── */}
      {step === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Nom <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Pochette zippée"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Slug <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  className="input-field"
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="pochette-zippee"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => setForm(p => ({ ...p, slug: autoSlug(p.name) }))}
                  className="table-action-btn"
                  type="button"
                >
                  Auto
                </button>
              </div>
              {errors.slug && <p className="form-error">{errors.slug}</p>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">
                Catégorie <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <select
                className="input-field"
                value={form.categoryId}
                onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                style={{ appearance: 'auto', cursor: 'pointer' }}
              >
                <option value="">Choisir…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="form-error">{errors.categoryId}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Prix de base (€) <span style={{ color: 'var(--gold)' }}>*</span>
              </label>
              <input
                className="input-field"
                type="number" min="0" step="0.01"
                value={form.basePrice}
                onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
                placeholder="0.00"
              />
              {errors.basePrice && <p className="form-error">{errors.basePrice}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description courte</label>
            <input
              className="input-field"
              value={form.shortDescription}
              onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
              placeholder="Résumé affiché sur la carte produit"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description complète</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description détaillée visible sur la fiche produit…"
              style={{ resize: 'vertical' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Produit visible sur la boutique
            </span>
          </label>

          <hr className="section-divider" />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>
              Annuler
            </button>
            <button onClick={handleSaveInfo} disabled={saving} className="btn btn-gold" style={{ flex: 2 }}>
              {saving ? 'Sauvegarde…' : isEdit ? 'Mettre à jour → Images' : 'Créer → Images'}
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 2 : Images ── */}
      {step === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Images existantes */}
          {existingImages.length > 0 && (
            <div>
              <p className="admin-section-title" style={{ marginBottom: '0.75rem' }}>
                Images actuelles ({existingImages.length})
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.5rem',
              }}>
                {[...existingImages]
                  .sort((a, b) => a.position - b.position)
                  .map(img => {
                    const linkedOpt = productOptions.find(o => o.id === img.optionValueId)
                    return (
                      <div key={img.id} className="image-thumb">
                        <img src={img.url} alt={img.alt ?? ''} />
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          padding: '0.2rem 0.25rem', fontSize: '0.58rem',
                          background: 'rgba(0,0,0,0.72)', textAlign: 'center',
                          color: linkedOpt ? 'var(--gold)' : '#a8c5a0',
                          lineHeight: 1.2,
                        }}>
                          {linkedOpt ? linkedOpt.label : 'Base'}
                        </div>
                        <div className="overlay">
                          <button
                            onClick={() => deleteExisting(img.id)}
                            disabled={deletingId === img.id}
                            style={{
                              background: 'rgba(196,122,106,0.9)', border: 'none',
                              borderRadius: 'var(--radius)', color: '#fff',
                              padding: '0.25rem 0.45rem', fontSize: '0.68rem',
                              cursor: 'pointer',
                            }}
                          >
                            {deletingId === img.id ? '…' : 'Suppr.'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Zone upload */}
          <div>
            <p className="admin-section-title" style={{ marginBottom: '0.75rem' }}>
              Ajouter des images
            </p>
            <label className="upload-zone" style={{ display: 'block', cursor: 'pointer' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.2" style={{ margin: '0 auto 0.6rem' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Cliquez ou déposez vos images
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                JPG, PNG, WEBP · Max 5 Mo
              </p>
            </label>
          </div>

          {/* Images en attente */}
          {pending.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p className="admin-section-title">
                À uploader ({pending.length})
              </p>
              {pending.map(img => (
                <div key={img.tempId} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.75rem',
                  background: 'var(--bg-warm)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}>
                  {/* Preview */}
                  <div style={{
                    width: 56, height: 56, flexShrink: 0,
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                  }}>
                    <img src={img.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Config */}
                  <div className="form-grid-2" style={{ flex: 1 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.62rem' }}>
                        Texte alternatif
                      </label>
                      <input
                        className="input-field"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                        value={img.alt}
                        onChange={e => updatePending(img.tempId, { alt: e.target.value })}
                        placeholder="Description…"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.62rem' }}>
                        Variante liée
                      </label>
                      <select
                        className="input-field"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', appearance: 'auto' }}
                        value={img.optionValueId}
                        onChange={e => updatePending(img.tempId, { optionValueId: e.target.value })}
                      >
                        <option value="">Image de base</option>
                        {productOptions.map(o => (
                          <option key={o.id} value={o.id}>
                            {o.label} ({o.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setPending(prev => prev.filter(p => p.tempId !== img.tempId))}
                    className="table-action-btn danger"
                    style={{ flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <hr className="section-divider" />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setStep('info')} className="btn btn-ghost" style={{ flex: 1 }}>
              ← Infos
            </button>
            <button
              onClick={handleFinish}
              disabled={uploadingSave}
              className="btn btn-gold"
              style={{ flex: 2 }}
            >
              {uploadingSave
                ? 'Upload en cours…'
                : pending.length > 0
                  ? `Uploader ${pending.length} image${pending.length > 1 ? 's' : ''} & Terminer`
                  : 'Terminer'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
