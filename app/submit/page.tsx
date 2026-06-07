'use client'

import { useState } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: '', type: '', date: '', time: '', venue: '',
    description: '', price: '', capacity: '',
    organiser_name: '', organiser_email: '', club: '', source_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.title || !form.type || !form.date || !form.venue || !form.description || !form.organiser_name || !form.organiser_email) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)

    try {
      // Save event to Supabase as pending, get back a session ID for Stripe
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Submission failed')

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe not loaded')

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) throw new Error(stripeError.message)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputStyle = {
    border: '1px solid #e0ddd6', padding: '0.6rem 0.85rem',
    fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none',
    background: '#fff', color: '#0a0a0a', width: '100%',
  }

  const labelStyle = {
    fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.05em',
    textTransform: 'uppercase' as const, color: '#0a0a0a', display: 'block', marginBottom: '0.4rem',
  }

  return (
    <div style={{ background: '#f5f3ef', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '56px', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', letterSpacing: '0.05em', textDecoration: 'none' }}>
          Porsche<span style={{ color: '#CC0000' }}>Events</span>.co.uk
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}>Events</Link>
          <Link href="/submit" style={{ fontSize: '0.8rem', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}>List Your Event</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#CC0000', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '0.5rem' }}>For Event Organisers</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', letterSpacing: '0.02em', lineHeight: 1, marginBottom: '0.75rem' }}>
            List Your<br />Porsche Event
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b6b6b', lineHeight: 1.6 }}>
            Reach thousands of Porsche enthusiasts across the UK. Your event will be reviewed and published within 24 hours.
          </p>
        </div>

        {/* PRICE CALLOUT */}
        <div style={{ background: '#0a0a0a', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: '#CC0000' }}>£1</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            <strong style={{ color: '#fff', fontWeight: 500 }}>One-time listing fee per event.</strong><br />
            Featured listing, permanent page, shareable link,<br />and inclusion in our weekly email digest.
          </div>
        </div>

        {/* EVENT DETAILS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.03em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0a0a0a' }}>Event Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Event Name *</label>
              <input style={inputStyle} type="text" placeholder="e.g. Porsche 911 Morning Drive" value={form.title} onChange={e => update('title', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Event Type *</label>
              <select style={inputStyle} value={form.type} onChange={e => update('type', e.target.value)}>
                <option value="">Select type...</option>
                <option value="track">Track Day</option>
                <option value="meet">Car Meet</option>
                <option value="drive">Club Drive</option>
                <option value="show">Show & Shine</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Date *</label>
              <input style={inputStyle} type="date" value={form.date} onChange={e => update('date', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input style={inputStyle} type="time" value={form.time} onChange={e => update('time', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Venue / Location *</label>
            <input style={inputStyle} type="text" placeholder="e.g. Silverstone Circuit, Northamptonshire" value={form.venue} onChange={e => update('venue', e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description *</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }} placeholder="Tell us about the event — what to expect, who it's for, what Porsche models are welcome..." value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Attendance Price</label>
              <input style={inputStyle} type="text" placeholder="e.g. £25 or Free" value={form.price} onChange={e => update('price', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Max Attendees</label>
              <input style={inputStyle} type="number" placeholder="e.g. 50" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ORGANISER DETAILS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.03em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0a0a0a' }}>Organiser Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input style={inputStyle} type="text" placeholder="First & last name" value={form.organiser_name} onChange={e => update('organiser_name', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={form.organiser_email} onChange={e => update('organiser_email', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Club / Organisation</label>
            <input style={inputStyle} type="text" placeholder="e.g. Porsche Club GB — Yorkshire Region" value={form.club} onChange={e => update('club', e.target.value)} />
            <span style={{ fontSize: '0.72rem', color: '#6b6b6b' }}>Optional — leave blank if independent</span>
          </div>
          <div>
            <label style={labelStyle}>Event / Booking URL</label>
            <input style={inputStyle} type="url" placeholder="https://..." value={form.source_url} onChange={e => update('source_url', e.target.value)} />
          </div>
        </div>

        {/* PAYMENT */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.03em', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0a0a0a' }}>Payment</h2>
          <div style={{ background: '#f5f3ef', border: '2px dashed #e0ddd6', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💳</div>
            <p style={{ fontSize: '0.85rem', color: '#6b6b6b', lineHeight: 1.5 }}>
              Secure <strong style={{ color: '#0a0a0a' }}>£1 payment</strong> processed via Stripe.<br />
              You&apos;ll be redirected to Stripe Checkout to complete payment.<br />
              Your event goes live within 24 hours of approval.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#CC0000', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', background: loading ? '#999' : '#CC0000', color: '#fff', border: 'none', padding: '1rem', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.08em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          {loading ? 'Processing...' : '→ Submit & Pay £1'}
        </button>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', justifyContent: 'center' }}>
          {['🔒 Secure payment', '⏱ 24hr review', '👥 4,000+ monthly visitors'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6b6b6b' }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
