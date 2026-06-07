'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: '', type: '', date: '', time: '', venue: '',
    description: '', price: '', capacity: '',
    organiser_name: '', organiser_email: '', club: '', source_url: '',
    address_line_1: '', address_line_2: '', town: '', county: '', postcode: '',
    what3words: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const finderReady = useRef(false)

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  // Initialise Ideal Postcodes Address Finder once on mount
  useEffect(() => {
    if (finderReady.current) return
    finderReady.current = true

    let cancelled = false
    ;(async () => {
      try {
        const { AddressFinder } = await import('@ideal-postcodes/address-finder')
        if (cancelled) return

        AddressFinder.setup({
          apiKey: process.env.NEXT_PUBLIC_IDEAL_POSTCODES_KEY || 'ak_test',
          // Bind the finder to our search input
          inputField: '#address-finder',
          // Map address parts to our form inputs
          outputFields: {
            line_1: '#line_1',
            line_2: '#line_2',
            post_town: '#post_town',
            county: '#county',
            postcode: '#postcode',
          },
          // Sync the filled DOM values back into React state so they submit
          onAddressRetrieved: (address: Record<string, any>) => {
            setForm(f => ({
              ...f,
              address_line_1: address.line_1 || '',
              address_line_2: address.line_2 || '',
              town: address.post_town || '',
              county: address.county || '',
              postcode: address.postcode || '',
            }))
          },
          onFailedCheck: () => {
            console.warn('Address Finder key check failed — manual entry only.')
          },
        })
      } catch (err) {
        console.error('Address Finder failed to load:', err)
      }
    })()

    return () => { cancelled = true }
  }, [])

  // what3words live validation
  const w3wCleaned = form.what3words.trim().replace(/^\/+/, '')
  const w3wValid = /^[^.\s/]+\.[^.\s/]+\.[^.\s/]+$/.test(w3wCleaned)

  async function handleSubmit() {
    if (!form.title || !form.type || !form.date || !form.venue || !form.description || !form.organiser_name || !form.organiser_email) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.what3words.trim() && !w3wValid) {
      setError('what3words address must be three words separated by dots, e.g. filled.count.soap')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, what3words: w3wCleaned }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Submission failed')

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

  const sectionHeading = {
    fontFamily: "var(--font-display), 'Sora', sans-serif", fontSize: '1.2rem',
    letterSpacing: '0.03em', marginBottom: '1rem', paddingBottom: '0.5rem',
    borderBottom: '2px solid #0a0a0a',
  }

  return (
    <div style={{ background: '#f5f3ef', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '56px', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "var(--font-display), 'Sora', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textDecoration: 'none' }}>
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
          <h1 style={{ fontFamily: "var(--font-display), 'Sora', sans-serif", fontSize: '2.6rem', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.05, marginBottom: '0.75rem' }}>
            List Your Porsche Event
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6b6b6b', lineHeight: 1.6 }}>
            Reach thousands of Porsche enthusiasts across the UK. Your event will be reviewed and published within 24 hours.
          </p>
        </div>

        {/* PRICE CALLOUT */}
        <div style={{ background: '#0a0a0a', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', borderRadius: '8px' }}>
          <div style={{ fontFamily: "var(--font-display), 'Sora', sans-serif", fontSize: '2.6rem', fontWeight: 800, color: '#CC0000' }}>£1</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
            <strong style={{ color: '#fff', fontWeight: 500 }}>One-time listing fee per event.</strong><br />
            Featured listing, permanent page, shareable link,<br />and inclusion in our weekly email digest.
          </div>
        </div>

        {/* EVENT DETAILS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeading}>Event Details</h2>
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
                <option value="show">Show &amp; Shine</option>
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
            <label style={labelStyle}>Venue Name *</label>
            <input style={inputStyle} type="text" placeholder="e.g. Silverstone Circuit" value={form.venue} onChange={e => update('venue', e.target.value)} />
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

        {/* LOCATION & ADDRESS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeading}>Location &amp; Address</h2>

          {/* Address Finder binds to this input and fills the fields below */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Find Address</label>
            <input
              id="address-finder"
              style={inputStyle}
              type="text"
              placeholder="Start typing a postcode or address..."
              autoComplete="off"
            />
            <span style={{ fontSize: '0.72rem', color: '#6b6b6b' }}>Start typing and select your address to auto-fill the fields below.</span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Address Line 1</label>
            <input id="line_1" style={inputStyle} type="text" value={form.address_line_1} onChange={e => update('address_line_1', e.target.value)} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Address Line 2</label>
            <input id="line_2" style={inputStyle} type="text" value={form.address_line_2} onChange={e => update('address_line_2', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Town / City</label>
              <input id="post_town" style={inputStyle} type="text" value={form.town} onChange={e => update('town', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>County</label>
              <input id="county" style={inputStyle} type="text" value={form.county} onChange={e => update('county', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Postcode</label>
            <input id="postcode" style={{ ...inputStyle, maxWidth: '200px' }} type="text" value={form.postcode} onChange={e => update('postcode', e.target.value)} />
          </div>

          {/* what3words */}
          <div>
            <label style={labelStyle}>what3words Address <span style={{ textTransform: 'none', color: '#6b6b6b', fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.7rem', background: '#0a0a0a', color: '#CC0000', fontWeight: 700, border: '1px solid #0a0a0a', borderRight: 'none' }}>///</span>
              <input
                style={{ ...inputStyle, borderLeft: 'none' }}
                type="text"
                placeholder="filled.count.soap"
                value={form.what3words}
                onChange={e => update('what3words', e.target.value)}
              />
            </div>
            <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', lineHeight: 1.5 }}>
              <span style={{ color: '#6b6b6b' }}>
                Pinpoint the exact meeting spot (paddock gate, car park entrance, field).{' '}
                <a href="https://what3words.com" target="_blank" rel="noopener noreferrer" style={{ color: '#CC0000' }}>Find yours →</a>
              </span>
              {form.what3words.trim() && (
                w3wValid ? (
                  <div style={{ color: '#2d5a27', marginTop: '0.25rem' }}>
                    ✓ Looks good ·{' '}
                    <a href={`https://what3words.com/${w3wCleaned}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2d5a27', textDecoration: 'underline' }}>
                      View on map
                    </a>
                  </div>
                ) : (
                  <div style={{ color: '#CC0000', marginTop: '0.25rem' }}>
                    ✗ Must be three words separated by dots (e.g. filled.count.soap)
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ORGANISER DETAILS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={sectionHeading}>Organiser Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input style={inputStyle} type="text" placeholder="First &amp; last name" value={form.organiser_name} onChange={e => update('organiser_name', e.target.value)} />
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
          <h2 style={sectionHeading}>Payment</h2>
          <div style={{ background: '#f5f3ef', border: '2px dashed #e0ddd6', padding: '1.5rem', textAlign: 'center', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💳</div>
            <p style={{ fontSize: '0.85rem', color: '#6b6b6b', lineHeight: 1.5 }}>
              Secure <strong style={{ color: '#0a0a0a' }}>£1 payment</strong> processed via Stripe.<br />
              You&apos;ll be redirected to Stripe Checkout to complete payment.<br />
              Your event goes live within 24 hours of approval.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#CC0000', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', background: loading ? '#999' : '#CC0000', color: '#fff', border: 'none', padding: '1rem', fontFamily: "var(--font-display), 'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderRadius: '6px' }}
        >
          {loading ? 'Processing...' : '→ Submit & Pay £1'}
        </button>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['🔒 Secure payment', '⏱ 24hr review', '👥 4,000+ monthly visitors'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6b6b6b' }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
