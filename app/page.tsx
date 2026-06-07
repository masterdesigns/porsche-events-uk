'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Event } from '@/lib/supabase'

const TYPE_LABELS: Record<string, string> = {
  track: 'Track Day',
  meet: 'Car Meet',
  drive: 'Club Drive',
  show: 'Show',
}

const TYPE_COLORS: Record<string, string> = {
  track: '#0a0a0a',
  meet: '#1a3c5e',
  drive: '#2d5a27',
  show: '#5a1a4a',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [filtered, setFiltered] = useState<Event[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        // Show mock data if Supabase tables not set up yet
        setEvents(getMockEvents())
      } else {
        setEvents(data || getMockEvents())
      }
      setLoading(false)
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    let result = events
    if (filter !== 'all') result = result.filter(e => e.type === filter)
    if (search) result = result.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [events, filter, search])

  return (
    <div style={{ background: '#f5f3ef', minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{ background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '56px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: '#fff', letterSpacing: '0.05em' }}>
          Porsche<span style={{ color: '#CC0000' }}>Events</span>.co.uk
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '0.8rem', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}>Events</Link>
          <Link href="/submit" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none' }}>List Your Event</Link>
          <Link href="/submit" style={{ background: '#CC0000', color: '#fff', padding: '0.45rem 1.1rem', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.05em' }}>
            Post Event — £1
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#0a0a0a', padding: '3.5rem 2rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-1rem', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '14rem', color: 'rgba(255,255,255,0.03)', lineHeight: 1, pointerEvents: 'none' }}>911</div>
        <div style={{ fontSize: '0.72rem', color: '#CC0000', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '0.6rem' }}>United Kingdom&apos;s #1 Porsche Community</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.8rem', color: '#fff', lineHeight: 0.95, letterSpacing: '0.02em', marginBottom: '1rem' }}>
          Every<br /><span style={{ color: '#CC0000' }}>Porsche</span><br />Event.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', maxWidth: '480px', lineHeight: 1.6, marginBottom: '1.8rem' }}>
          Track days, car meets, factory tours, club drives — every Porsche event across the UK in one place. Updated daily.
        </p>
        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {[
            { num: events.length || '—', label: 'Events Listed' },
            { num: events.filter(e => new Date(e.date) > new Date() && new Date(e.date) < new Date(Date.now() + 30 * 86400000)).length || '—', label: 'This Month' },
            { num: 8, label: 'Sources Scraped' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#fff', letterSpacing: '0.02em' }}>{s.num}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0ddd6', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f3ef', border: '1px solid #e0ddd6', padding: '0.5rem 0.9rem', flex: 1, minWidth: '200px' }}>
          <span style={{ color: '#6b6b6b', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search events, venues, locations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'track', 'meet', 'drive', 'show'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.38rem 0.9rem', fontSize: '0.78rem',
                border: '1px solid #e0ddd6',
                background: filter === f ? '#0a0a0a' : '#fff',
                color: filter === f ? '#fff' : '#6b6b6b',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, letterSpacing: '0.03em',
              }}
            >
              {f === 'all' ? 'All' : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#6b6b6b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          Showing {filtered.length} events
        </div>
      </div>

      {/* EVENTS GRID */}
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.03em' }}>Upcoming Events</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b6b6b' }}>Loading events...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(event => (
              <div key={event.id} className="event-card" style={{ background: '#fff', border: '1px solid #e0ddd6', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem 0' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.6rem', background: TYPE_COLORS[event.type] || '#333', color: '#fff', fontFamily: 'monospace' }}>
                    {TYPE_LABELS[event.type] || event.type}
                  </span>
                  <span style={{ fontSize: '0.65rem', background: event.is_scraped ? '#f0f4ff' : '#fff8e6', color: event.is_scraped ? '#2952a3' : '#854F0B', padding: '0.18rem 0.5rem', fontFamily: 'monospace', border: `1px solid ${event.is_scraped ? '#c8d5f0' : '#FAC775'}` }}>
                    {event.is_scraped ? 'auto-found' : 'organiser'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${TYPE_COLORS[event.type]}15`, fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', letterSpacing: '0.1em', color: `${TYPE_COLORS[event.type]}40` }}>
                  911
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6b6b6b', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                    📅 {formatDate(event.date)}
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6b6b6b' }}>
                    📍 {event.venue}
                  </div>
                </div>
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e0ddd6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: event.price === 'Free' ? '#2d5a27' : '#0a0a0a' }}>
                    {event.price === 'Free' ? 'Free entry' : event.price}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#6b6b6b', fontFamily: 'monospace' }}>{event.source_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0a0a0a', padding: '2rem', marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          Porsche<span style={{ color: '#CC0000' }}>Events</span>.co.uk
        </div>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
          © 2025 PorscheEvents.co.uk · Not affiliated with Porsche AG · Events updated daily
        </p>
      </footer>
    </div>
  )
}

// Mock events shown before DB is set up
function getMockEvents(): Event[] {
  return [
    { id: '1', title: 'Silverstone Porsche Track Day', type: 'track', date: '2025-07-19', venue: 'Silverstone Circuit, Northants', price: '£295', source_name: 'TrackDay.co.uk', status: 'approved', is_scraped: true, description: '', created_at: '' },
    { id: '2', title: 'South East Porsche Meet', type: 'meet', date: '2025-07-26', venue: 'Goodwood Motor Circuit', price: 'Free', source_name: 'Submitted', status: 'approved', is_scraped: false, description: '', created_at: '' },
    { id: '3', title: 'Yorkshire Dales Drive', type: 'drive', date: '2025-08-09', venue: 'Harrogate, North Yorkshire', price: 'Free', source_name: 'Porsche Club GB', status: 'approved', is_scraped: true, description: '', created_at: '' },
    { id: '4', title: 'Porsche Show & Shine 2025', type: 'show', date: '2025-08-02', venue: 'Chatsworth Estate, Derbyshire', price: '£15', source_name: 'PistonHeads', status: 'approved', is_scraped: true, description: '', created_at: '' },
  ]
}
