import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Client-side Supabase client (uses publishable key)
export const supabase = createClient(supabaseUrl, supabasePublishableKey)

// Server-side Supabase client (uses secret key — only use in API routes)
export const supabaseAdmin = () => {
  const secretKey = process.env.SUPABASE_SECRET_KEY!
  return createClient(supabaseUrl, secretKey)
}

export type Event = {
  id: string
  title: string
  type: 'track' | 'meet' | 'drive' | 'show'
  date: string
  time?: string
  venue: string
  description: string
  price: string
  capacity?: number
  source_name: string
  source_url?: string
  organiser_name?: string
  organiser_email?: string
  club?: string
  status: 'pending' | 'approved' | 'rejected'
  is_scraped: boolean
  created_at: string
}

export type Submission = {
  id: string
  event_id: string
  organiser_name: string
  organiser_email: string
  club?: string
  stripe_payment_id?: string
  paid: boolean
  submitted_at: string
}
