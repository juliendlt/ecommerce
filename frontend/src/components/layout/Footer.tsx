import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '3rem 0 2rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--surface)' }}>
              Tatafil
            </p>
            <p className="body-sm">
              Créations artisanales de couture, faites à la main avec soin. Chaque pièce est unique, personnalisable selon vos envies.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="label" style={{ marginBottom: '1rem' }}>Navigation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['/', 'Accueil'], ['/boutique', 'Boutique'], ['/compte', 'Mon compte']].map(([href, label]) => (
                <Link key={href} href={href} className="body-sm footer-link">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="label" style={{ marginBottom: '1rem' }}>Informations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Politique de livraison', 'Retours & remboursements', 'Mentions légales', 'Contact'].map((item) => (
                <span key={item} className="body-sm" style={{ cursor: 'default' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: '1.5rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Tatafil. Tous droits réservés.
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--gold-dark)' }}>
            Fait avec ♥ et du fil
          </p>
        </div>
      </div>

      <style>{`
        .footer-link { transition: color var(--transition); }
        .footer-link:hover { color: var(--gold) !important; }
      `}</style>
    </footer>
  )
}
