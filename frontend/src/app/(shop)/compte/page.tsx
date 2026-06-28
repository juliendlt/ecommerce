'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { authApi, userApi, ordersApi } from '@/lib/api'
import type { Order } from '@/lib/api'
import { toast } from '@/components/ui/Toast'
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

type Tab = 'profile' | 'orders'
type AuthMode = 'login' | 'register'

export default function ComptePage() {
  const { user, token, setAuth, logout } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  if (!user || !token) {
    return <AuthSection />
  }
  return <AccountSection />
}

/* ── Auth (login / register) ─────────────────────────────────── */
function AuthSection() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email requis'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
    if (!form.password) e.password = 'Mot de passe requis'
    else if (form.password.length < 8) e.password = 'Minimum 8 caractères'
    if (mode === 'register') {
      if (!form.firstName) e.firstName = 'Prénom requis'
      if (!form.lastName) e.lastName = 'Nom requis'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await authApi.login(form.email, form.password)
        : await authApi.register({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName })

      setAuth(result.user, result.token)
      toast(mode === 'login' ? `Bienvenue, ${result.user.firstName} !` : 'Compte créé avec succès !', 'success')

      const redirect = searchParams.get('redirect')
      if (redirect === 'checkout') router.push('/')
    } catch (err: any) {
      const msg = err.message === 'INVALID_LOGIN' ? 'Email ou mot de passe incorrect'
        : err.message === 'EMAIL_ALREADY_EXISTS' ? 'Cet email est déjà utilisé'
        : 'Une erreur est survenue'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      {errors[key] && <p style={{ fontSize: '0.75rem', color: '#c47a6a', marginTop: '0.35rem' }}>{errors[key]}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo/title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="label" style={{ marginBottom: '0.75rem' }}>Mon espace</p>
          <h1 className="display-lg">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg-warm)',
          borderRadius: 'var(--radius)', padding: 4, marginBottom: '2rem',
          border: '1px solid var(--border)',
        }}>
          {(['login', 'register'] as AuthMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErrors({}) }}
              style={{
                flex: 1, padding: '0.6rem',
                borderRadius: 'calc(var(--radius) - 2px)',
                fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.04em',
                transition: 'all var(--transition)',
                background: mode === m ? 'var(--gold)' : 'transparent',
                color: mode === m ? 'var(--text-dark)' : 'var(--text-muted)',
              }}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {field('firstName', 'Prénom', 'text', 'Marie')}
                {field('lastName', 'Nom', 'text', 'Dupont')}
              </div>
            )}
            {field('email', 'Adresse email', 'email', 'marie@exemple.fr')}
            {field('password', 'Mot de passe', 'password', '••••••••')}
            {mode === 'register' && field('confirmPassword', 'Confirmer le mot de passe', 'password', '••••••••')}
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', marginTop: '1.75rem', padding: '0.9rem' }}
          >
            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>

          {mode === 'login' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
              Lorem ipsum dolor sit amet consectetur — accès sécurisé
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Account (profile + orders) ─────────────────────────────── */
function AccountSection() {
  const [tab, setTab] = useState<Tab>('profile')
  const { user, logout } = useAuthStore()
  const router = useRouter()

  function handleLogout() {
    logout()
    toast('Déconnexion réussie', 'success')
    router.push('/')
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p className="label" style={{ marginBottom: '0.5rem' }}>Mon espace</p>
            <h1 className="display-lg">
              Bonjour, <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>{user?.firstName}</em>
            </h1>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Se déconnecter
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '2.5rem' }}>
          {([['profile', 'Mon profil'], ['orders', 'Mes commandes']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.82rem', fontWeight: 600,
                letterSpacing: '0.04em',
                borderBottom: `2px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
                color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
                transition: 'color var(--transition)',
                marginBottom: '-1px',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && <ProfileTab />}
        {tab === 'orders' && <OrdersTab />}
      </div>
    </div>
  )
}

/* ── Profile Tab ─────────────────────────────────────────────── */
function ProfileTab() {
  const { user, setAuth, token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  })
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({})

  async function handleSaveProfile() {
    setLoading(true)
    try {
      const updated = await userApi.updateMe(form)
      setAuth({ ...updated, createdAt: user?.createdAt }, token!)
      toast('Profil mis à jour', 'success')
    } catch (e: any) {
      toast(e.message === 'EMAIL_ALREADY_USED' ? 'Cet email est déjà utilisé' : 'Erreur lors de la mise à jour', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleChangePassword() {
    const e: Record<string, string> = {}
    if (!pwd.current) e.current = 'Requis'
    if (!pwd.next || pwd.next.length < 8) e.next = 'Minimum 8 caractères'
    if (pwd.next !== pwd.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    if (Object.keys(e).length) { setPwdErrors(e); return }
    setPwdErrors({})
    setPwdLoading(true)
    try {
      await userApi.updatePassword(pwd.current, pwd.next)
      toast('Mot de passe mis à jour', 'success')
      setPwd({ current: '', next: '', confirm: '' })
    } catch (e: any) {
      toast(e.message === 'INVALID_PASSWORD' ? 'Mot de passe actuel incorrect' : 'Erreur', 'error')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
      {/* Info Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <p className="label" style={{ marginBottom: '1.5rem' }}>Informations personnelles</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Prénom</label>
              <input className="input-field" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Nom</label>
              <input className="input-field" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="form-label">Adresse email</label>
            <input className="input-field" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Rôle</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--gold)', padding: '0.75rem 1rem', background: 'rgba(201,168,124,0.08)', borderRadius: 'var(--radius)', border: '1px solid var(--border-gold)' }}>
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Client'}
            </p>
          </div>
          <button onClick={handleSaveProfile} disabled={loading} className="btn btn-gold">
            {loading ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Password Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <p className="label" style={{ marginBottom: '1.5rem' }}>Changer le mot de passe</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            ['current', 'Mot de passe actuel'],
            ['next', 'Nouveau mot de passe'],
            ['confirm', 'Confirmer le nouveau'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={pwd[key as keyof typeof pwd]}
                onChange={e => setPwd(p => ({ ...p, [key]: e.target.value }))}
              />
              {pwdErrors[key] && <p style={{ fontSize: '0.75rem', color: '#c47a6a', marginTop: '0.35rem' }}>{pwdErrors[key]}</p>}
            </div>
          ))}
          <button onClick={handleChangePassword} disabled={pwdLoading} className="btn btn-outline">
            {pwdLoading ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Orders Tab ──────────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(setOrders)
      .catch(() => toast('Impossible de charger les commandes', 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: '1.5rem', height: 80, animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1" style={{ margin: '0 auto 1rem' }}>
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Vous n'avez pas encore de commandes.</p>
        <a href="/boutique" className="btn btn-gold">Explorer la boutique</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {orders.map((order) => (
        <div key={order.id} className="card">
          {/* Order header */}
          <button
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            style={{
              width: '100%', padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '1rem', flexWrap: 'wrap', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Commande</p>
                <p style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text)' }}>#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Date</p>
                <p style={{ fontSize: '0.85rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--gold)', fontWeight: 600 }}>{formatPrice(order.total)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                background: `${getOrderStatusColor(order.status)}20`,
                color: getOrderStatusColor(order.status),
                border: `1px solid ${getOrderStatusColor(order.status)}40`,
              }}>
                {getOrderStatusLabel(order.status)}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
                style={{ transition: 'transform var(--transition)', transform: expanded === order.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </button>

          {/* Order items (expanded) */}
          {expanded === order.id && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                        {item.productName}
                        {item.quantity > 1 && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>×{item.quantity}</span>}
                      </p>
                      {item.optionsSnapshot && Object.keys(item.optionsSnapshot).length > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {Object.entries(item.optionsSnapshot).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin: '1rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Sous-total {formatPrice(order.subtotal)}</span>
                  {Number(order.shippingCost) > 0 && <span style={{ marginLeft: '1rem' }}>+ livraison {formatPrice(order.shippingCost)}</span>}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)' }}>
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
