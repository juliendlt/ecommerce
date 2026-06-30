'use client'

import { useEffect, useRef } from 'react'
import { useCartStore, useAuthStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleCheckout() {
    if (!isAuthenticated()) {
      onClose()
      router.push('/compte?redirect=checkout')
      return
    }
    // Rediriger vers la page de validation commande
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 900, opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(420px, 100vw)',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          zIndex: 901,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="label">Votre panier</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {items.length === 0 ? 'Vide' : `${items.reduce((a, i) => a + i.quantity, 0)} article(s)`}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem' }} aria-label="Fermer le panier">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1" style={{ margin: '0 auto 1rem' }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
              </svg>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Votre panier est vide</p>
              <button onClick={onClose} className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
                Découvrir la boutique
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                  {/* Image placeholder */}
                  <div style={{
                    width: 64, height: 64, flexShrink: 0,
                    background: 'var(--bg-warm)', borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.productName}</p>
                    {Object.entries(item.selectedOptions).length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {Object.values(item.selectedOptions).map(v => v.label).join(' · ')}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      {/* Quantity */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1 }}
                        >−</button>
                        <span style={{ fontSize: '0.85rem', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1 }}
                        >+</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>{formatPrice(item.unitPrice * item.quantity)}</span>
                        <button onClick={() => removeItem(item.id)} style={{ color: 'var(--text-muted)', transition: 'color var(--transition)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#c47a6a')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total</span>
              <span className="display-md" style={{ color: 'var(--gold)' }}>{formatPrice(total())}</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Frais de livraison calculés à la commande
            </p>
            <button onClick={handleCheckout} className="btn btn-gold" style={{ width: '100%' }}>
              Commander — {formatPrice(total())}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
