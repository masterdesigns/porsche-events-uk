import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { metadata?: { event_id?: string }; id: string }
    const eventId = session.metadata?.event_id

    if (eventId) {
      const db = supabaseAdmin()

      // Mark submission as paid
      await db.from('submissions')
        .update({ paid: true, stripe_payment_id: session.id })
        .eq('event_id', eventId)

      console.log(`Payment confirmed for event ${eventId}`)
    }
  }

  return NextResponse.json({ received: true })
}
