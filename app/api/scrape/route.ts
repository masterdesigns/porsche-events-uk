import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { scrapeAllSources } from '@/lib/scraper'

export async function POST() {
  try {
    const db = supabaseAdmin()
    const scraped = await scrapeAllSources()

    let added = 0
    let duplicates = 0

    for (const event of scraped) {
      // Check for duplicate (same title + date)
      const { data: existing } = await db
        .from('events')
        .select('id')
        .eq('title', event.title)
        .eq('date', event.date)
        .single()

      if (existing) {
        duplicates++
        continue
      }

      // Insert new event as pending for review
      const { error } = await db.from('events').insert({
        title: event.title,
        type: event.type,
        date: event.date,
        venue: event.venue,
        description: event.description,
        price: event.price || 'TBC',
        source_name: event.source_name,
        source_url: event.source_url,
        status: 'pending',
        is_scraped: true,
      })

      if (!error) added++
    }

    // Log scrape run
    await db.from('scrape_runs').insert({
      sources_checked: 8,
      events_found: scraped.length,
      events_added: added,
      duplicates_skipped: duplicates,
    })

    return NextResponse.json({ success: true, added, duplicates, total: scraped.length })

  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Scrape failed' }, { status: 500 })
  }
}

// GET endpoint for Vercel Cron (runs daily at 6am)
export async function GET() {
  return POST()
}
