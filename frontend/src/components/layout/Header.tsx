'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore, useAuthStore } from '@/lib/store'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Header() {
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // ── Hydratation safe : on lit le store uniquement après montage ──
  const [mounted, setMounted] = useState(false)

  const itemCount = useCartStore((s) => s.itemCount())
  const { user } = useAuthStore()
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
  ]

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800,
        transition: 'background 300ms ease, border-color 300ms ease',
        background: scrolled ? 'rgba(28,28,26,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="var(--gold)" strokeWidth="1.2"/>
              <path d="M7 14c2-4 5-6 7-6s5 2 7 6c-2 4-5 6-7 6s-5-2-7-6z" stroke="var(--gold)" strokeWidth="1.2" fill="none"/>
              <circle cx="14" cy="14" r="2" fill="var(--gold)"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', letterSpacing: '0.02em', color: 'var(--surface)' }}>
              Tatafil
            </span>
          </Link>

          {/* Nav desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', marginRight: '2.5rem' }} className="desktop-nav">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: pathname === href ? 'var(--gold)' : 'var(--text-muted)',
                transition: 'color var(--transition)',
              }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            {/* Account */}
            <Link href="/compte" style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem', fontWeight: 500,
              color: pathname === '/compte' ? 'var(--gold)' : 'var(--text-muted)',
              transition: 'color var(--transition)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
              {/* Afficher le prénom seulement après hydratation pour éviter le mismatch */}
              <span className="desktop-nav" style={{ fontSize: '0.8rem' }}>
                {mounted && user ? user.firstName : 'Compte'}
              </span>
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: 'var(--radius)',
                color: 'var(--text-muted)', transition: 'color var(--transition)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              aria-label="Ouvrir le panier"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
              </svg>
              {/* Badge panier : seulement après hydratation */}
              {mounted && itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--gold)', color: 'var(--text-dark)',
                  fontSize: '0.6rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, color: 'var(--text-muted)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileOpen
                  ? <path d="M18 6L6 18M6 6l12 12"/>
                  : <path d="M3 12h18M3 6h18M3 18h18"/>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem 1.5rem' }}>
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} style={{
                display: 'block', padding: '0.75rem 0',
                fontSize: '1rem', fontFamily: 'var(--font-display)',
                borderBottom: '1px solid var(--border)',
                color: pathname === href ? 'var(--gold)' : 'var(--text)',
              }}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-menu-btn { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: flex; }
        }
      `}</style>
    </>
  )
}
