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

const TYPE_ACCENT: Record<string, string> = {
  track: '#CC0000',
  meet: '#1a3c5e',
  drive: '#2d5a27',
  show: '#5a1a4a',
}

// Unsplash images are free for commercial use. Each type gets a distinct shot.
const TYPE_IMAGE: Record<string, string> = {
  track: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=70',
  meet: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=70',
  drive: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=70',
  show: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=70',
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?auto=format&fit=crop&w=1600&q=75'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function eventImage(e: Event) {
  return (e as any).image_url || TYPE_IMAGE[e.type] || TYPE_IMAGE.meet
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
        setEvents(getMockEvents())
      } else {
        setEvents(data && data.length ? data : getMockEvents())
      }
      setLoading(false)
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    let result = events
    if (filter !== 'all') result = result.filter((e) => e.type === filter)
    if (search)
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.venue.toLowerCase().includes(search.toLowerCase())
      )
    setFiltered(result)
  }, [events, filter, search])

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh', color: '#0a0a0a' }}>
      {/* NAV */}
      <nav
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #ece9e3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.7rem',
            letterSpacing: '0.04em',
          }}
        >
          Porsche<span style={{ color: '#CC0000' }}>Events</span>
          <span style={{ color: '#999', fontSize: '1.1rem' }}>.co.uk</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              fontSize: '0.78rem',
              color: '#0a0a0a',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Events
          </Link>
          <Link
            href="/submit"
            style={{
              fontSize: '0.78rem',
              color: '#6b6b6b',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            List Your Event
          </Link>
          <Link
            href="/submit"
            style={{
              background: '#CC0000',
              color: '#fff',
              padding: '0.55rem 1.3rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              borderRadius: '4px',
            }}
          >
            Post Event — £1
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div
        style={{
          position: 'relative',
          height: '460px',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HERO_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.35) 50%, rgba(10,10,10,0.15) 100%)',
          }}
        />
        <div style={{ position: 'relative', padding: '2.5rem', maxWidth: '760px' }}>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#fff',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '0.8rem',
              opacity: 0.85,
            }}
          >
            The UK&apos;s #1 Porsche Community
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '4.5rem',
              color: '#fff',
              lineHeight: 0.95,
              letterSpacing: '0.01em',
              marginBottom: '1rem',
            }}
          >
            Every Porsche event,<br />
            <span style={{ color: '#ff3333' }}>one place.</span>
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1rem',
              maxWidth: '520px',
              lineHeight: 1.6,
            }}
          >
            Track days, car meets, factory tours and club drives — every Porsche
            event across the UK, gathered and updated daily.
          </p>
        </div>
      </div>

      {/* STAT BAR */}
      <div
        style={{
          background: '#0a0a0a',
          display: 'flex',
          justifyContent: 'center',
          gap: '4rem',
          padding: '1.4rem 2rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { num: events.length || '—', label: 'Events Listed' },
          {
            num:
              events.filter(
                (e) =>
                  new Date(e.date) > new Date() &&
                  new Date(e.date) < new Date(Date.now() + 30 * 86400000)
              ).length || '—',
            label: 'This Month',
          },
          { num: 8, label: 'Sources Scraped' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '2.2rem',
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {s.num}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'rgba(255,255,255,0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: '0.3rem',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 2rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#fff',
            border: '1px solid #ece9e3',
            borderRadius: '6px',
            padding: '0.6rem 1rem',
            flex: 1,
            minWidth: '220px',
          }}
        >
          <span style={{ color: '#aaa', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search events, venues, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'track', 'meet', 'drive', 'show'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.78rem',
                border: '1px solid #ece9e3',
                borderRadius: '6px',
                background: filter === f ? '#0a0a0a' : '#fff',
                color: filter === f ? '#fff' : '#6b6b6b',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                letterSpacing: '0.03em',
                transition: 'all 0.15s ease',
              }}
            >
              {f === 'all' ? 'All' : TYPE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* EVENTS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem 4rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#aaa' }}>
            Loading events...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#aaa' }}>
            No events match your search.
          </div>
        ) : (
          <>
            {/* FEATURED */}
            {featured && (
              <div
                className="event-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr',
                  background: '#fff',
                  border: '1px solid #ece9e3',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '2.5rem',
                  cursor: 'pointer',
                  minHeight: '320px',
                }}
              >
                <div
                  style={{
                    backgroundImage: `url(${eventImage(featured)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '260px',
                  }}
                />
                <div
                  style={{
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      alignSelf: 'flex-start',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '4px',
                      background: TYPE_ACCENT[featured.type] || '#333',
                      color: '#fff',
                      marginBottom: '1rem',
                    }}
                  >
                    Featured · {TYPE_LABELS[featured.type]}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '2.6rem',
                      lineHeight: 1,
                      letterSpacing: '0.01em',
                      marginBottom: '0.8rem',
                    }}
                  >
                    {featured.title}
                  </div>
                  <div style={{ color: '#6b6b6b', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                    📅 {formatDate(featured.date)}
                  </div>
                  <div style={{ color: '#6b6b6b', fontSize: '0.95rem', marginBottom: '1.2rem' }}>
                    📍 {featured.venue}
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color:
                        featured.price === 'Free' ? '#2d5a27' : '#0a0a0a',
                    }}
                  >
                    {featured.price === 'Free' ? 'Free entry' : featured.price}
                  </div>
                </div>
              </div>
            )}

            {/* GRID */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {rest.map((event) => (
                <div
                  key={event.id}
                  className="event-card"
                  style={{
                    background: '#fff',
                    border: '1px solid #ece9e3',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        height: '170px',
                        backgroundImage: `url(${eventImage(event)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '0.28rem 0.6rem',
                        borderRadius: '4px',
                        background: TYPE_ACCENT[event.type] || '#333',
                        color: '#fff',
                      }}
                    >
                      {TYPE_LABELS[event.type] || event.type}
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        fontSize: '0.6rem',
                        background: 'rgba(255,255,255,0.92)',
                        color: '#6b6b6b',
                        padding: '0.22rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      {event.is_scraped ? 'auto-found' : 'organiser'}
                    </span>
                  </div>
                  <div style={{ padding: '1.1rem' }}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: '#999',
                        marginBottom: '0.5rem',
                      }}
                    >
                      📅 {formatDate(event.date)}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '1.35rem',
                        letterSpacing: '0.01em',
                        lineHeight: 1.1,
                        marginBottom: '0.5rem',
                      }}
                    >
                      {event.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: '#6b6b6b',
                        marginBottom: '0.9rem',
                      }}
                    >
                      📍 {event.venue}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #f0ede7',
                        paddingTop: '0.8rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: event.price === 'Free' ? '#2d5a27' : '#0a0a0a',
                        }}
                      >
                        {event.price === 'Free' ? 'Free entry' : event.price}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#bbb' }}>
                        {event.source_name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          background: '#0a0a0a',
          padding: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.05em',
          }}
        >
          Porsche<span style={{ color: '#CC0000' }}>Events</span>.co.uk
        </div>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} PorscheEvents.co.uk · Not affiliated with
          Porsche AG · Events updated daily
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
