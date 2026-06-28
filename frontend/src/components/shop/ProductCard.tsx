'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/api'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images.find((i) => !i.optionValueId) ?? product.images[0]
  const hasOptions = product.optionGroups.some((g) => g.values.length > 0)

  return (
    <Link href={`/boutique/${product.slug}`} style={{ display: 'block' }}>
      <article
        className="card"
        style={{ transition: 'transform 200ms ease, border-color 200ms ease', cursor: 'pointer' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-gold)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }}
      >
        {/* Image */}
        <div style={{
          aspectRatio: '4/3',
          background: 'var(--bg-warm)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {image ? (
            <img
              src={image.url}
              alt={image.alt ?? product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9M15 21V9M3 15h18"/>
              </svg>
            </div>
          )}
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'var(--bg)', borderRadius: 'var(--radius)',
            padding: '0.3rem 0.6rem',
          }}>
            <span className="label" style={{ fontSize: '0.65rem' }}>{product.category.name}</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="body-sm" style={{
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {product.shortDescription}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1.05rem' }}>
                {formatPrice(product.basePrice)}
              </span>
              {hasOptions && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>et +</span>
              )}
            </div>
            {hasOptions && (
              <span style={{
                fontSize: '0.68rem', color: 'var(--gold-dark)', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Personnalisable
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
