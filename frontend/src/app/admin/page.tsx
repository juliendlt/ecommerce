'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminProductsApi, adminCategoriesApi, adminOptionsApi, adminOrdersApi } from '@/lib/api'
import type { Product, Category, OptionValue, AdminOrder } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [options, setOptions] = useState<OptionValue[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminProductsApi.getAll(),
      adminCategoriesApi.getAll(),
      adminOptionsApi.getAll(),
      adminOrdersApi.getAll(),
    ]).then(([p, c, o, ord]) => {
      setProducts(p); setCategories(c); setOptions(o); setOrders(ord)
    }).finally(() => setLoading(false))
  }, [])

  const revenue = orders
    .filter(o => ['PAID','PROCESSING','SHIPPED','DELIVERED'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0)

  const pendingCount = orders.filter(o => o.status === 'PENDING').length

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const SHORTCUTS = [
    { href: '/admin/produits', label: 'Gérer les produits', desc: 'Créer, modifier, désactiver' },
    { href: '/admin/categories', label: 'Gérer les catégories', desc: 'Organiser le catalogue' },
    { href: '/admin/options', label: 'Gérer les options', desc: 'Tissus, couleurs, finitions' },
    { href: '/admin/commandes', label: 'Voir les commandes', desc: 'Suivre et mettre à jour' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p className="admin-section-title">Vue d'ensemble</p>
        <h1 className="admin-page-title">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          label="Produits actifs"
          value={loading ? '…' : products.filter(p => p.isActive).length}
          sub={loading ? '' : `${products.length} au total`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
            </svg>
          }
        />
        <StatCard
          label="Commandes"
          value={loading ? '…' : orders.length}
          sub={loading ? '' : `${pendingCount} en attente`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          }
          color="#a8c5a0"
        />
        <StatCard
          label="Chiffre d'affaires"
          value={loading ? '…' : formatPrice(revenue)}
          sub="commandes confirmées"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          }
        />
        <StatCard
          label="Catégories"
          value={loading ? '…' : categories.length}
          sub={loading ? '' : `${options.length} options`}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          }
          color="#8b9dc3"
        />
      </div>

      {/* Raccourcis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        {SHORTCUTS.map(({ href, label, desc }) => (
          <Link key={href} href={href} className="card" style={{
            padding: '1.25rem', display: 'block',
            transition: 'border-color var(--transition)',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{label}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>
          </Link>
        ))}
      </div>

      {/* Dernières commandes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <p className="admin-section-title">Dernières commandes</p>
          <Link href="/admin/commandes" style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>
            Voir tout →
          </Link>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Chargement…
            </p>
          ) : recentOrders.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Aucune commande pour l'instant
            </p>
          ) : recentOrders.map((o, i) => (
            <div key={o.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.85rem 1rem', gap: '1rem', flexWrap: 'wrap',
              borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  #{o.id.slice(-6).toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {o.user.firstName} {o.user.lastName}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  padding: '0.2rem 0.55rem', borderRadius: 'var(--radius)',
                  fontSize: '0.68rem', fontWeight: 600,
                  background: `${getOrderStatusColor(o.status)}20`,
                  color: getOrderStatusColor(o.status),
                }}>
                  {getOrderStatusLabel(o.status)}
                </span>
                <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {formatPrice(o.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
