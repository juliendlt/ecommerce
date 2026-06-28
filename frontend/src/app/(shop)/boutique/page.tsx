'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { productsApi, categoriesApi } from '@/lib/api'
import type { Product, Category } from '@/lib/api'
import { ProductCard } from '@/components/shop/ProductCard'

export default function BoutiquePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    Promise.all([productsApi.getAll(), categoriesApi.getAll()])
      .then(([p, c]) => {
        setProducts(p)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const cat = searchParams.get('categorie')
    setActiveCategory(cat)
  }, [searchParams])

  const filtered = useMemo(() => {
    if (!activeCategory) return products
    return products.filter((p) => p.category.slug === activeCategory)
  }, [products, activeCategory])

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p className="label" style={{ marginBottom: '0.5rem' }}>Collections</p>
          <h1 className="display-lg" style={{ marginBottom: '1rem' }}>La boutique</h1>
          <p className="body-sm" style={{ maxWidth: 500 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Toutes nos créations sont faites à la main et peuvent être personnalisées selon vos souhaits.
          </p>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <button
            onClick={() => setActiveCategory(null)}
            className="btn"
            style={{
              padding: '0.5rem 1.25rem', fontSize: '0.78rem',
              border: '1px solid',
              borderColor: !activeCategory ? 'var(--gold)' : 'var(--border)',
              color: !activeCategory ? 'var(--gold)' : 'var(--text-muted)',
              background: !activeCategory ? 'rgba(201,168,124,0.08)' : 'transparent',
            }}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug === activeCategory ? null : cat.slug)}
              className="btn"
              style={{
                padding: '0.5rem 1.25rem', fontSize: '0.78rem',
                border: '1px solid',
                borderColor: activeCategory === cat.slug ? 'var(--gold)' : 'var(--border)',
                color: activeCategory === cat.slug ? 'var(--gold)' : 'var(--text-muted)',
                background: activeCategory === cat.slug ? 'rgba(201,168,124,0.08)' : 'transparent',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="divider" style={{ marginBottom: '2.5rem' }} />

        {/* Results count */}
        {!loading && (
          <p className="body-sm" style={{ marginBottom: '1.5rem' }}>
            {filtered.length} création{filtered.length > 1 ? 's' : ''}
            {activeCategory && categories.find(c => c.slug === activeCategory)
              ? ` dans "${categories.find(c => c.slug === activeCategory)?.name}"`
              : ''}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ aspectRatio: '3/4' }}>
                <div style={{ width: '100%', height: '60%', background: 'var(--bg-warm)', animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ height: 18, width: '70%', background: 'var(--bg-warm)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 14, width: '50%', background: 'var(--bg-warm)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1" style={{ margin: '0 auto 1rem' }}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Aucun produit dans cette catégorie pour le moment.
            </p>
            <button onClick={() => setActiveCategory(null)} className="btn btn-outline">
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
