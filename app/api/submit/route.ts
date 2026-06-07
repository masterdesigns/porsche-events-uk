import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, type, date, time, venue, description, price, capacity,
      organiser_name, organiser_email, club, source_url,
      what3words, address_line_1, address_line_2, town, county, postcode,
    } = body

    // Validate required fields
    if (!title || !type || !date || !venue || !description || !organiser_name || !organiser_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Light what3words validation (optional field): expect three dot-separated words
    let w3w: string | null = null
    if (what3words && what3words.trim()) {
      const cleaned = what3words.trim().replace(/^\/+/, '') // strip leading slashes
      if (/^[^.\s/]+\.[^.\s/]+\.[^.\s/]+$/.test(cleaned)) {
        w3w = cleaned
      } else {
        return NextResponse.json(
          { error: 'what3words address must be three words separated by dots, e.g. filled.count.soap' },
          { status: 400 }
        )
      }
    }

    const db = supabaseAdmin()

    // Save event as pending in Supabase
    const { data: event, error: eventError } = await db
      .from('events')
      .insert({
        title,
        type,
        date,
        time: time || null,
        venue,
        description,
        price: price || 'TBC',
        capacity: capacity ? parseInt(capacity) : null,
        source_name: 'Submitted',
        source_url: source_url || null,
        organiser_name,
        organiser_email,
        club: club || null,
        what3words: w3w,
        address_line_1: address_line_1 || null,
        address_line_2: address_line_2 || null,
        town: town || null,
        county: county || null,
        postcode: postcode || null,
        status: 'pending',
        is_scraped: false,
      })
      .select()
      .single()

    if (eventError) {
      console.error('Supabase error:', eventError)
      return NextResponse.json({ error: 'Failed to save event' }, { status: 500 })
    }

    // Create Stripe Checkout session for £1
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Event Listing: ${title}`,
            description: `PorscheEvents.co.uk listing for "${title}" on ${date}`,
          },
          unit_amount: 100, // £1.00 in pence
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/submit/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/submit`,
      metadata: {
        event_id: event.id,
        organiser_email,
        organiser_name,
      },
      customer_email: organiser_email,
    })

    // Save submission record
    await db.from('submissions').insert({
      event_id: event.id,
      organiser_name,
      organiser_email,
      club: club || null,
      stripe_session_id: session.id,
      paid: false,
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error) {
    console.error('Submit API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
