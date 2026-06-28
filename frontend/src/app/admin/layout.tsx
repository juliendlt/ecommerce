'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { ToastContainer } from '@/components/ui/Toast'

const NAV = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/admin/produits',
    label: 'Produits',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    href: '/admin/categories',
    label: 'Catégories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    href: '/admin/options',
    label: 'Options',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/>
      </svg>
    ),
  },
  {
    href: '/admin/commandes',
    label: 'Commandes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
    ),
  },
  {
    href: '/admin/utilisateurs',
    label: 'Utilisateurs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/compte'); return }
    if (user.role !== 'ADMIN') { router.push('/'); return }
    setReady(true)
  }, [user, router])

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vérification des droits…</p>
      </div>
    )
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

        {/* Sidebar */}
        <>
          {/* Overlay mobile */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            />
          )}

          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 240,
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            zIndex: 50,
            transform: sidebarOpen ? 'translateX(0)' : undefined,
            transition: 'transform 250ms ease',
          }}
            className="admin-sidebar"
          >
            {/* Logo */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="13" stroke="var(--gold)" strokeWidth="1.2"/>
                  <path d="M7 14c2-4 5-6 7-6s5 2 7 6c-2 4-5 6-7 6s-5-2-7-6z" stroke="var(--gold)" strokeWidth="1.2" fill="none"/>
                  <circle cx="14" cy="14" r="2" fill="var(--gold)"/>
                </svg>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', lineHeight: 1 }}>Tatafil</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin</p>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {NAV.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem', fontWeight: 500,
                    transition: 'all var(--transition)',
                    background: isActive(href) ? 'rgba(201,168,124,0.12)' : 'transparent',
                    color: isActive(href) ? 'var(--gold)' : 'var(--text-muted)',
                    borderLeft: `2px solid ${isActive(href) ? 'var(--gold)' : 'transparent'}`,
                  }}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </nav>

            {/* Footer sidebar */}
            <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ padding: '0.75rem 0.85rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user?.firstName} {user?.lastName}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
              <button
                onClick={() => { logout(); router.push('/') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius)', fontSize: '0.85rem',
                  color: 'var(--text-muted)', transition: 'color var(--transition)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Déconnexion
              </button>
            </div>
          </aside>
        </>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="admin-main">
          {/* Top bar */}
          <header style={{
            height: 56, borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center',
            padding: '0 1.5rem', gap: '1rem',
            background: 'var(--bg-card)',
            position: 'sticky', top: 0, zIndex: 30,
          }}>
            <button
              className="admin-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ color: 'var(--text-muted)', display: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {NAV.find(n => isActive(n.href))?.label ?? 'Admin'}
            </p>
            <div style={{ marginLeft: 'auto' }}>
              <Link href="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ← Voir la boutique
              </Link>
            </div>
          </header>

          <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: 1100, width: '100%' }}>
            {children}
          </main>
        </div>
      </div>

      <ToastContainer />

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .admin-main {
            margin-left: 240px;
          }
        }
      `}</style>
    </>
  )
}
