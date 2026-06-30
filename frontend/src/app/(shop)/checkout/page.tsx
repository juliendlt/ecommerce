'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore, useAuthStore } from '@/lib/store'
import { ordersApi, paymentsApi } from '@/lib/api'
import { toast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils'

// Frais de port : gratuit au-dessus de 50 €, sinon 4.90 €
const SHIPPING_THRESHOLD = 50
const SHIPPING_COST = 4.9

const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CH', label: 'Suisse' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'MC', label: 'Monaco' },
]

const EMPTY_ADDRESS = {
  firstName: '',
  lastName: '',
  address: '',
  addressLine2: '',
  city: '',
  postal: '',
  country: 'FR',
}

type AddressForm = typeof EMPTY_ADDRESS
type AddressErrors = Partial<Record<keyof AddressForm, string>>

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const [form, setForm] = useState<AddressForm>({
    ...EMPTY_ADDRESS,
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  })
  const [errors, setErrors] = useState<AddressErrors>({})
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Redirection si panier vide ou non connecté
  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated()) {
      router.push('/compte?redirect=checkout')
      return
    }
    if (items.length === 0) {
      router.push('/boutique')
    }
  }, [mounted, isAuthenticated, items.length, router])

  if (!mounted || !isAuthenticated() || items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
      </div>
    )
  }

  const subtotal = total()
  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const orderTotal = subtotal + shippingCost

  function set(key: keyof AddressForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: AddressErrors = {}
    if (!form.firstName.trim()) e.firstName = 'Requis'
    if (!form.lastName.trim()) e.lastName = 'Requis'
    if (!form.address.trim()) e.address = 'Requis'
    if (!form.city.trim()) e.city = 'Requis'
    if (!form.postal.trim()) e.postal = 'Requis'
    else if (!/^\d{4,10}$/.test(form.postal.trim())) e.postal = 'Code postal invalide'
    if (!form.country) e.country = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      const order = await ordersApi.create({
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          optionsSnapshot: Object.fromEntries(
            Object.values(item.selectedOptions).map(v => [v.type, v.label])
          ),
        })),
        shipping: {
          address: [form.address, form.addressLine2].filter(Boolean).join(', '),
          city: form.city,
          postal: form.postal,
          country: form.country,
        },
      })

      const { url } = await paymentsApi.createCheckout(order.id)
      clearCart()
      if (url) window.location.href = url
    } catch (e: any) {
      const msg = e.message === 'PRODUCT_NOT_FOUND'
        ? 'Un produit de votre panier n\'est plus disponible.'
        : e.message || 'Une erreur est survenue'
      toast(msg, 'error')
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <nav style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/" className="breadcrumb-link">Accueil</Link>
            <span>›</span>
            <Link href="/boutique" className="breadcrumb-link">Boutique</Link>
            <span>›</span>
            <span style={{ color: 'var(--text)' }}>Validation commande</span>
          </nav>
          <p className="label" style={{ marginBottom: '0.4rem' }}>Dernière étape</p>
          <h1 className="display-lg">Valider ma commande</h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: '2.5rem',
          alignItems: 'start',
        }} className="checkout-grid">

          {/* ── Colonne gauche : adresse ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Adresse de livraison */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <p className="label" style={{ marginBottom: '1.5rem' }}>Adresse de livraison</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div className="form-grid-2">
                  <Field
                    label="Prénom" required
                    value={form.firstName} onChange={v => set('firstName', v)}
                    placeholder="Marie" error={errors.firstName}
                  />
                  <Field
                    label="Nom" required
                    value={form.lastName} onChange={v => set('lastName', v)}
                    placeholder="Dupont" error={errors.lastName}
                  />
                </div>

                <Field
                  label="Adresse" required
                  value={form.address} onChange={v => set('address', v)}
                  placeholder="12 rue des Lilas" error={errors.address}
                />

                <Field
                  label="Complément d'adresse"
                  value={form.addressLine2} onChange={v => set('addressLine2', v)}
                  placeholder="Appartement, bâtiment, etc. (optionnel)"
                />

                <div className="form-grid-2">
                  <Field
                    label="Code postal" required
                    value={form.postal} onChange={v => set('postal', v)}
                    placeholder="75001" error={errors.postal}
                  />
                  <Field
                    label="Ville" required
                    value={form.city} onChange={v => set('city', v)}
                    placeholder="Paris" error={errors.city}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Pays <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                    style={{ appearance: 'auto', cursor: 'pointer' }}
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  {errors.country && <p className="form-error">{errors.country}</p>}
                </div>
              </div>
            </div>

            {/* Info paiement sécurisé */}
            <div style={{
              padding: '1rem 1.25rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Paiement sécurisé par <strong style={{ color: 'var(--text)' }}>Stripe</strong>.
                Vos données bancaires ne nous sont jamais transmises.
              </p>
            </div>
          </div>

          {/* ── Colonne droite : récap ── */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <p className="label" style={{ marginBottom: '1.5rem' }}>
                Récapitulatif ({items.reduce((a, i) => a + i.quantity, 0)} article{items.reduce((a, i) => a + i.quantity, 0) > 1 ? 's' : ''})
              </p>

              {/* Articles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.85rem' }}>
                    {/* Image */}
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      borderRadius: 'var(--radius)', overflow: 'hidden',
                      background: 'var(--bg-warm)', border: '1px solid var(--border)',
                    }}>
                      {item.image
                        ? <img src={item.image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                            </svg>
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.3 }}>
                          {item.productName}
                          {item.quantity > 1 && (
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem', fontSize: '0.82rem' }}>
                              ×{item.quantity}
                            </span>
                          )}
                        </p>
                        <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                      {Object.values(item.selectedOptions).length > 0 && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {Object.values(item.selectedOptions).map(v => v.label).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ marginBottom: '1rem' }} />

              {/* Calcul des prix */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Livraison</span>
                  {shippingCost === 0 ? (
                    <span style={{ color: '#a8c5a0', fontWeight: 600 }}>Offerte 🎉</span>
                  ) : (
                    <span>{formatPrice(shippingCost)}</span>
                  )}
                </div>

                {shippingCost > 0 && (
                  <p style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(201,168,124,0.06)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                  }}>
                    Plus que <strong style={{ color: 'var(--gold)' }}>
                      {formatPrice(SHIPPING_THRESHOLD - subtotal)}
                    </strong> pour la livraison offerte
                  </p>
                )}
              </div>

              <div className="divider" style={{ marginBottom: '1.25rem' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="display-md" style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>
                  {formatPrice(orderTotal)}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-gold"
                style={{ width: '100%', padding: '1rem', fontSize: '0.85rem' }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(0,0,0,0.2)',
                      borderTopColor: 'var(--text-dark)',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Création de la commande…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Payer {formatPrice(orderTotal)}
                  </>
                )}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.85rem' }}>
                Vous serez redirigé vers Stripe pour finaliser le paiement
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

// ── Composant champ de formulaire réutilisable ────────────────
function Field({
  label, value, onChange, placeholder, error, required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span style={{ color: 'var(--gold)', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <input
        className="input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
