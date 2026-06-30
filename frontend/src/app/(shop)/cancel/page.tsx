import Link from 'next/link'

export default function CancelPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>

        {/* Icône annulation */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(196,122,106,0.12)',
          border: '1px solid rgba(196,122,106,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.75rem',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#c47a6a" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </div>

        <p className="label" style={{ marginBottom: '0.75rem', color: '#c47a6a' }}>
          Paiement annulé
        </p>
        <h1 className="display-lg" style={{ marginBottom: '1rem' }}>
          Commande non finalisée
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
          Votre paiement a été annulé. Votre panier a été conservé — vous pouvez reprendre votre commande à tout moment.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/boutique" className="btn btn-outline">
            Retour à la boutique
          </Link>
          <Link href="/checkout" className="btn btn-gold">
            Réessayer
          </Link>
        </div>
      </div>
    </div>
  )
}
