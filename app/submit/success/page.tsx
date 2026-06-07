import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div style={{ background: '#f5f3ef', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '0.03em', marginBottom: '1rem' }}>
          Event Submitted!
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#6b6b6b', lineHeight: 1.6, marginBottom: '2rem' }}>
          Thank you — your payment was successful and your event is now in our review queue.
          We&apos;ll have it live on the site within 24 hours. Check your email for confirmation.
        </p>
        <Link href="/" style={{ background: '#CC0000', color: '#fff', padding: '0.75rem 2rem', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.08em', textDecoration: 'none', display: 'inline-block' }}>
          Back to Events
        </Link>
      </div>
    </div>
  )
}
