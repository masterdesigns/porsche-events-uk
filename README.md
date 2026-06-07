# PorscheEvents.co.uk

The UK's only dedicated Porsche events directory. Track days, car meets, club drives and shows — updated daily via automated scraping.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (£1 per listing)
- **Scraping**: Firecrawl + Claude AI (event extraction)
- **Hosting**: Vercel (with daily cron job)

---

## Setup Instructions

### 1. Database (Supabase)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**

### 2. Environment Variables

Create `.env.local` in the project root (already done — do NOT commit this file):

```
NEXT_PUBLIC_SUPABASE_URL=https://fwdvxtyqjucvkyhgkjpp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhook dashboard)

FIRECRAWL_API_KEY=your_firecrawl_key

NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Install & Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### 4. Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → Import your GitHub repo
3. Add all environment variables from `.env.local` in Vercel's dashboard
4. Deploy!

### 5. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-site.vercel.app/api/webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel env vars

### 6. Add Firecrawl Key

1. Sign up at firecrawl.dev
2. Copy your API key
3. Add as `FIRECRAWL_API_KEY` in Vercel env vars

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Events directory with filters |
| `/submit` | Organiser submission form + £1 Stripe payment |
| `/submit/success` | Post-payment confirmation |
| `/admin` | Admin dashboard — review queue, scrape controls |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/submit` | POST | Save event + create Stripe session |
| `/api/webhook` | POST | Stripe webhook — marks payment complete |
| `/api/scrape` | POST/GET | Runs scraper across all sources |

## Automated Scraping

The scraper runs daily at 06:00 UTC via Vercel Cron (configured in `vercel.json`).
It checks 8 sources, uses Claude AI to extract Porsche events, and adds new ones to the pending queue for admin review.

Sources scraped:
- PistonHeads
- Porsche Club GB
- TrackDay.co.uk
- MSV Motorsport
- Eventbrite UK
- Google Events
- Rennlist.com
- Facebook Events (limited)
