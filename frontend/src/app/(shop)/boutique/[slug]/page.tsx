'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { productsApi } from '@/lib/api'
import type { Product, OptionValue, ProductOptionGroup } from '@/lib/api'
import { useCartStore } from '@/lib/store'
import { formatPrice, computeFinalPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, OptionValue>>({})
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    productsApi.getBySlug(slug)
      .then(setProduct)
      .catch(() => router.push('/boutique'))
      .finally(() => setLoading(false))
  }, [slug, router])

  useEffect(() => {
    if (!product) return
    const selectedValues = Object.values(selectedOptions)
    const matchingImage = product.images.findIndex(
      (img) => img.optionValueId && selectedValues.some((v) => v.id === img.optionValueId)
    )
    if (matchingImage !== -1) setActiveImage(matchingImage)
  }, [selectedOptions, product])

  const finalPrice = useMemo(() => {
    if (!product) return 0
    return computeFinalPrice(Number(product.basePrice), selectedOptions)
  }, [product, selectedOptions])

  const sortedGroups: ProductOptionGroup[] = useMemo(() => {
    if (!product) return []
    return [...product.optionGroups].sort((a, b) => a.position - b.position)
  }, [product])

  const allRequiredSelected = sortedGroups.every((g) => selectedOptions[g.id])

  function handleSelectOption(groupId: string, value: OptionValue) {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: value }))
  }

  function handleAddToCart() {
    if (!product) return
    if (!allRequiredSelected && sortedGroups.length > 0) {
      toast('Veuillez sélectionner toutes les options', 'error')
      return
    }
    const baseImage = product.images.find((i) => !i.optionValueId) ?? product.images[0]
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: baseImage?.url,
      quantity,
      unitPrice: finalPrice,
      selectedOptions,
    })
    toast(`${product.name} ajouté au panier`, 'success')
  }

  if (loading) {
    return (
      <div style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ aspectRatio: '1', background: 'var(--bg-warm)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease infinite' }} />
            <div style={{ paddingTop: '1rem' }}>
              {[80, 60, 40, 100, 60].map((w, i) => (
                <div key={i} style={{ height: 20, width: `${w}%`, background: 'var(--bg-warm)', borderRadius: 4, marginBottom: 16, animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      </div>
    )
  }

  if (!product) return null

  const mainImages = product.images.filter(i => !i.optionValueId)
  const optionImages = product.images.filter(i => i.optionValueId)
  const allImages = [...mainImages, ...optionImages]

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Link href="/" className="breadcrumb-link">Accueil</Link>
          <span>›</span>
          <Link href="/boutique" className="breadcrumb-link">Boutique</Link>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>{product.name}</span>
        </nav>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'clamp(2rem,5vw,4rem)', alignItems: 'start' }}>

          {/* Images */}
          <div>
            <div style={{
              aspectRatio: '1', background: 'var(--bg-warm)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--border)', marginBottom: '0.75rem',
            }}>
              {allImages[activeImage] ? (
                <img
                  src={allImages[activeImage].url}
                  alt={allImages[activeImage].alt ?? product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="0.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9M15 21V9M3 15h18"/>
                  </svg>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {allImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    style={{
                      width: 64, height: 64,
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      border: `2px solid ${activeImage === idx ? 'var(--gold)' : 'var(--border)'}`,
                      padding: 0, cursor: 'pointer',
                      transition: 'border-color var(--transition)',
                      background: 'var(--bg-warm)',
                    }}
                  >
                    <img src={img.url} alt={img.alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <p className="label" style={{ marginBottom: '0.75rem' }}>{product.category.name}</p>
            <h1 className="display-lg" style={{ marginBottom: '1rem' }}>{product.name}</h1>

            {product.shortDescription && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                {product.shortDescription}
              </p>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <span className="display-md" style={{ color: 'var(--gold)' }}>{formatPrice(finalPrice)}</span>
              {finalPrice !== Number(product.basePrice) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  (base {formatPrice(product.basePrice)})
                </span>
              )}
            </div>

            {/* Options */}
            {sortedGroups.length > 0 && (
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sortedGroups.map((group) => (
                  <div key={group.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <p className="label" style={{ color: 'var(--text-muted)' }}>
                        {group.values[0]?.type ?? `Option ${group.position + 1}`}
                      </p>
                      {selectedOptions[group.id] && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                          {selectedOptions[group.id].label}
                          {Number(selectedOptions[group.id].priceOffSet) > 0 && (
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                              (+{formatPrice(selectedOptions[group.id].priceOffSet)})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {group.values
                        .filter((v) => v.isAvailable)
                        .map((value) => {
                          const isSelected = selectedOptions[group.id]?.id === value.id
                          return (
                            <button
                              key={value.id}
                              onClick={() => handleSelectOption(group.id, value)}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius)',
                                border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                                background: isSelected ? 'rgba(201,168,124,0.12)' : 'var(--bg-warm)',
                                color: isSelected ? 'var(--gold)' : 'var(--text)',
                                fontSize: '0.82rem',
                                transition: 'all var(--transition)',
                                cursor: 'pointer',
                              }}
                            >
                              {value.label}
                              {Number(value.priceOffSet) > 0 && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                                  +{formatPrice(value.priceOffSet)}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      {group.values.filter(v => !v.isAvailable).map((value) => (
                        <button key={value.id} disabled style={{
                          padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)', opacity: 0.35,
                          fontSize: '0.82rem', cursor: 'not-allowed',
                          textDecoration: 'line-through', color: 'var(--text-muted)',
                          background: 'var(--bg-warm)',
                        }}>
                          {value.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Quantité</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderRight: '1px solid var(--border)' }}>−</button>
                  <span style={{ width: 40, textAlign: 'center', fontSize: '0.9rem' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}
                    style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}>+</button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total : <strong style={{ color: 'var(--gold)' }}>{formatPrice(finalPrice * quantity)}</strong>
                </span>
              </div>
            </div>

            <button onClick={handleAddToCart} className="btn btn-gold" style={{ width: '100%', padding: '1rem', fontSize: '0.85rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
              </svg>
              Ajouter au panier
            </button>

            {product.description && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <p className="label" style={{ marginBottom: '1rem' }}>Description</p>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '0.9rem' }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .breadcrumb-link { transition: color var(--transition); }
        .breadcrumb-link:hover { color: var(--text); }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: minmax(0,1fr) minmax(0,1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
