'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Event } from '@/lib/supabase'

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [tab, setTab] = useState<'pending' | 'approved' | 'scraped'>('pending')
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchEvents() }, [tab])

  async function fetchEvents() {
    setLoading(true)
    let query = supabase.from('events').select('*').order('created_at', { ascending: false })

    if (tab === 'pending') query = query.eq('status', 'pending')
    else if (tab === 'approved') query = query.eq('status', 'approved')
    else if (tab === 'scraped') query = query.eq('is_scraped', true)

    const { data } = await query
    setEvents(data || [])
    setLoading(false)
  }

  async function approve(id: string) {
    await supabase.from('events').update({ status: 'approved' }).eq('id', id)
    showToast('Event approved and published!')
    fetchEvents()
  }

  async function reject(id: string) {
    await supabase.from('events').update({ status: 'rejected' }).eq('id', id)
    showToast('Event rejected.')
    fetchEvents()
  }

  async function runScrape() {
    setScraping(true)
    showToast('Scrape started — checking 8 sources...')
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const data = await res.json()
      showToast(`Scrape complete: ${data.added} new events found!`)
    } catch {
      showToast('Scrape failed. Check your Firecrawl API key.')
    }
    setScraping(false)
    fetchEvents()
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const counts = {
    pending: events.filter(e => e.status === 'pending').length,
  }

  return (
    <div style={{ background: '#f5f3ef', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '56px', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', letterSpacing: '0.05em', textDecoration: 'none' }}>
          Porsche<span style={{ color: '#CC0000' }}>Events</span>.co.uk
        </Link>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>🔒 Admin Dashboard</span>
      </nav>

      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.03em', marginBottom: '1.5rem' }}>Admin Dashboard</h1>

        {/* SCRAPE PANEL */}
        <div style={{ background: '#fff', border: '1px solid #e0ddd6', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', letterSpacing: '0.03em', marginBottom: '1rem' }}>Scrape Engine</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {['PistonHeads', 'Porsche Club GB', 'TrackDay.co.uk', 'MSV Motorsport', 'Eventbrite UK', 'Google Events', 'Rennlist.com', 'Facebook Events'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e0ddd6', padding: '0.65rem 0.9rem', fontSize: '0.82rem' }}>
                <span>{s}</span>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < 4 ? '#2d5a27' : i < 7 ? '#BA7517' : '#ccc', boxShadow: i < 4 ? '0 0 0 3px rgba(45,90,39,0.15)' : 'none' }} className={i < 4 ? 'animate-pulse-dot' : ''} />
              </div>
            ))}
          </div>
          <button
            onClick={runScrape}
            disabled={scraping}
            style={{ background: scraping ? '#666' : '#0a0a0a', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500, cursor: scraping ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {scraping ? '⏳ Scraping...' : '↻ Run Manual Scrape'}
          </button>
          <div style={{ fontSize: '0.75rem', color: '#6b6b6b', fontFamily: 'monospace', marginTop: '0.75rem' }}>
            Auto-scrape runs daily at 06:00 UTC via Vercel Cron
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e0ddd6', marginBottom: '1.5rem' }}>
          {(['pending', 'approved', 'scraped'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', borderBottom: `2px solid ${tab === t ? '#CC0000' : 'transparent'}`, marginBottom: '-2px', color: tab === t ? '#0a0a0a' : '#6b6b6b', fontFamily: 'inherit', letterSpacing: '0.03em', textTransform: 'capitalize' }}
            >
              {t === 'pending' ? `Pending Review (${counts.pending})` : t === 'approved' ? 'Live Events' : 'Auto-Scraped'}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div style={{ background: '#fff', border: '1px solid #e0ddd6', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Event', 'Type', 'Date', 'Source', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b6b', padding: '0.7rem 1rem', textAlign: 'left', borderBottom: '1px solid #e0ddd6', background: '#f5f3ef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b6b6b' }}>Loading...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#6b6b6b' }}>No events in this category yet.</td></tr>
              ) : events.map(event => (
                <tr key={event.id} style={{ borderBottom: '1px solid #e0ddd6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 500 }}>{event.title}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.6rem', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
                      {event.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>{formatDate(event.date)}</td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#6b6b6b' }}>{event.source_name}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, padding: '0.2rem 0.6rem', letterSpacing: '0.05em', background: event.status === 'approved' ? '#eaf3de' : event.status === 'rejected' ? '#fff0f0' : '#fff8e6', color: event.status === 'approved' ? '#3B6D11' : event.status === 'rejected' ? '#CC0000' : '#854F0B', border: `1px solid ${event.status === 'approved' ? '#C0DD97' : event.status === 'rejected' ? '#ffcccc' : '#FAC775'}` }}>
                      {event.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {event.status === 'pending' && (
                        <>
                          <button onClick={() => approve(event.id)} style={{ background: '#0a0a0a', color: '#fff', border: 'none', padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Approve</button>
                          <button onClick={() => reject(event.id)} style={{ background: '#fff', color: '#CC0000', border: '1px solid #CC0000', padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Reject</button>
                        </>
                      )}
                      {event.status === 'approved' && (
                        <button onClick={() => reject(event.id)} style={{ background: '#fff', color: '#CC0000', border: '1px solid #CC0000', padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#0a0a0a', color: '#fff', padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', zIndex: 300 }}>
          ✅ {toast}
        </div>
      )}
    </div>
  )
}
