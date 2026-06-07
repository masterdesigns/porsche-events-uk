-- ============================================
-- PorscheEvents.co.uk — Supabase Database Setup
-- Run this in Supabase: SQL Editor → New Query
-- ============================================

-- EVENTS TABLE
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null check (type in ('track', 'meet', 'drive', 'show')),
  date date not null,
  time text,
  venue text not null,
  description text,
  price text default 'TBC',
  capacity int,
  source_name text not null,
  source_url text,
  organiser_name text,
  organiser_email text,
  club text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_scraped boolean default false,
  created_at timestamptz default now()
);

-- SUBMISSIONS TABLE (tracks £1 payments)
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  organiser_name text not null,
  organiser_email text not null,
  club text,
  stripe_session_id text,
  stripe_payment_id text,
  paid boolean default false,
  submitted_at timestamptz default now()
);

-- SCRAPE RUNS TABLE (logs each scrape)
create table if not exists scrape_runs (
  id uuid default gen_random_uuid() primary key,
  sources_checked int default 0,
  events_found int default 0,
  events_added int default 0,
  duplicates_skipped int default 0,
  ran_at timestamptz default now()
);

-- ROW LEVEL SECURITY POLICIES

-- Events: anyone can read approved events
alter table events enable row level security;

create policy "Public can view approved events"
  on events for select
  using (status = 'approved');

create policy "Service role can do everything on events"
  on events for all
  using (true)
  with check (true);

-- Submissions: only service role
alter table submissions enable row level security;

create policy "Service role only on submissions"
  on submissions for all
  using (true)
  with check (true);

-- Scrape runs: only service role
alter table scrape_runs enable row level security;

create policy "Service role only on scrape_runs"
  on scrape_runs for all
  using (true)
  with check (true);

-- SAMPLE DATA (optional — remove in production)
insert into events (title, type, date, venue, description, price, source_name, status, is_scraped) values
  ('Silverstone Porsche Track Day', 'track', '2025-07-19', 'Silverstone Circuit, Northamptonshire', 'Full GP circuit open for Porsche owners. All models welcome, instructor sessions available.', '£295', 'TrackDay.co.uk', 'approved', true),
  ('South East Porsche Meet', 'meet', '2025-07-26', 'Goodwood Motor Circuit, West Sussex', 'Monthly meet for all Porsche owners. Coffee, cakes and cars from 8am.', 'Free', 'Submitted', 'approved', false),
  ('Yorkshire Dales Club Drive', 'drive', '2025-08-09', 'Harrogate, North Yorkshire', '90 miles of stunning Yorkshire Dales roads. Convoy drive with breakfast stop en route.', 'Free', 'Porsche Club GB', 'approved', true),
  ('Porsche Show & Shine 2025', 'show', '2025-08-02', 'Chatsworth Estate, Derbyshire', 'Annual Porsche concours at the stunning Chatsworth Estate. Judged categories for all eras.', '£15', 'PistonHeads', 'approved', true),
  ('Brands Hatch Porsche Day', 'track', '2025-08-16', 'Brands Hatch, Kent', 'Brands Hatch Indy circuit. Max 25 cars per session. All year groups, all models.', '£245', 'MSV Motorsport', 'approved', true);
