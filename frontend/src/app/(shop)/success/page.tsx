'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { ordersApi } from '@/lib/api'
import type { Order } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

export default function SuccessPage() {
  const { isAuthenticated } = useAuthStore()
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated()) {
      // Récupérer la commande la plus récente (déjà payée)
      ordersApi.getMyOrders()
        .then(orders => {
          const paid = orders
            .filter(o => o.status !== 'PENDING')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          if (paid.length > 0) setLastOrder(paid[0])
        })
        .catch(() => null)
    }
  }, [isAuthenticated])

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Icône succès */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(168,197,160,0.15)',
          border: '1px solid rgba(168,197,160,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.75rem',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a8c5a0" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>

        <p className="label" style={{ marginBottom: '0.75rem' }}>Paiement confirmé</p>
        <h1 className="display-lg" style={{ marginBottom: '1rem' }}>
          Merci pour votre commande !
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
          Votre paiement a bien été reçu. Nous préparons votre création avec soin et vous tiendrons informé de son avancement.
        </p>

        {/* Récap commande si disponible */}
        {mounted && lastOrder && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p className="label">Commande</p>
              <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                #{lastOrder.id.slice(-8).toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {lastOrder.items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', gap: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.productName}
                    {item.quantity > 1 && <span> ×{item.quantity}</span>}
                  </span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider" style={{ marginBottom: '0.75rem' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total payé</span>
              <span style={{ color: 'var(--gold)' }}>{formatPrice(lastOrder.total)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/boutique" className="btn btn-outline">
            Continuer mes achats
          </Link>
          {mounted && isAuthenticated() && (
            <Link href="/compte" className="btn btn-gold">
              Voir mes commandes
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
