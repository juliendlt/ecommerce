import Link from 'next/link'
import { productsApi, categoriesApi } from '@/lib/api'
import { ProductCard } from '@/components/shop/ProductCard'
import { formatPrice } from '@/lib/utils'

async function getData() {
  try {
    const [products, categories] = await Promise.all([
      productsApi.getAll(),
      categoriesApi.getAll(),
    ])
    return { products: products.slice(0, 3), categories, error: null }
  } catch {
    return { products: [], categories: [], error: true }
  }
}

export default async function HomePage() {
  const { products, categories } = await getData()

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Animated thread SVG */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-100,400 C100,200 200,600 400,350 C600,100 700,500 900,300 C1100,100 1200,400 1400,250"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1.2"
            opacity="0.25"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            style={{ animation: 'drawLine 3s ease forwards 0.3s' }}
          />
          <path
            d="M-100,550 C150,450 250,650 500,500 C700,380 800,580 1000,480 C1150,400 1250,520 1400,430"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="0.6"
            opacity="0.12"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            style={{ animation: 'drawLine 3.5s ease forwards 0.8s' }}
          />
          {/* Needle motif */}
          <g transform="translate(900,180) rotate(-35)" opacity="0.18">
            <rect x="-1" y="-40" width="2" height="80" rx="1" fill="var(--gold)"/>
            <ellipse cx="0" cy="-34" rx="5" ry="3" fill="none" stroke="var(--gold)" strokeWidth="1.2"/>
          </g>
        </svg>

        {/* Radial gradient background accent */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ maxWidth: 680 }}>
            <p className="label" style={{ marginBottom: '1.5rem', display: 'block' }}>
              Créations artisanales · Faites main
            </p>

            <h1 className="display-xl" style={{ marginBottom: '1.5rem', color: 'var(--surface)' }}>
              Chaque point,{' '}
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>une histoire</em>
              <br />racontée à l'aiguille
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 520, marginBottom: '2.5rem' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nos créations de couture sont conçues pour durer, personnalisées selon vos désirs et livrées avec amour.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/boutique" className="btn btn-gold" style={{ fontSize: '0.82rem' }}>
                Découvrir la boutique
              </Link>
              <Link href="/boutique" className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
                Voir les nouveautés
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, var(--bg))',
          pointerEvents: 'none',
        }} />
      </section>

      {/* ── Valeurs ───────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: 'Fait main',
                text: 'Lorem ipsum dolor sit amet consectetur. Chaque création est réalisée à la main avec soin et attention.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                ),
                title: 'Personnalisable',
                text: 'Lorem ipsum dolor sit amet. Choisissez vos tissus, couleurs et finitions pour une pièce unique.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                ),
                title: 'Avec amour',
                text: 'Lorem ipsum dolor sit amet consectetur adipiscing. Chaque pièce est cousue avec passion et minutie.',
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                ),
                title: 'Livraison soignée',
                text: 'Lorem ipsum dolor. Vos créations sont emballées avec soin et expédiées rapidement.',
              },
            ].map(({ icon, title, text }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                  background: 'rgba(201,168,124,0.08)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon}
                </div>
                <div>
                  <h3 className="display-md" style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{title}</h3>
                  <p className="body-sm">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catégories ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '4rem 0', background: 'var(--bg-warm)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p className="label" style={{ marginBottom: '0.5rem' }}>Collections</p>
                <h2 className="display-lg">Parcourir par catégorie</h2>
              </div>
              <Link href="/boutique" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
                Tout voir →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/boutique?categorie=${cat.slug}`}
                  className="cat-pill"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Produits vedettes ─────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p className="label" style={{ marginBottom: '0.5rem' }}>À la une</p>
              <h2 className="display-lg">Nos créations du moment</h2>
            </div>
            <Link href="/boutique" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
              Voir tout →
            </Link>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <p>Lorem ipsum dolor sit amet — les produits arrivent bientôt.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{
        margin: '0 0 5rem',
        background: 'var(--bg-warm)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: 1200,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 'calc(100% - 3rem)',
      }}>
        <div style={{ padding: 'clamp(2.5rem, 6vw, 4rem)', textAlign: 'center' }}>
          <p className="label" style={{ marginBottom: '1rem' }}>Sur mesure</p>
          <h2 className="display-lg" style={{ marginBottom: '1rem', maxWidth: 480, margin: '0 auto 1rem' }}>
            Une idée ? Parlons-en.
          </h2>
          <p className="body-sm" style={{ maxWidth: 420, margin: '0 auto 2rem' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nous pouvons créer la pièce de couture de vos rêves, entièrement personnalisée selon vos souhaits.
          </p>
          <Link href="/boutique" className="btn btn-gold">
            Explorer la boutique
          </Link>
        </div>
      </section>
    </>
  )
}
