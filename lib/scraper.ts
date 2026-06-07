// Scraper: fetches Porsche events from known UK sources using Firecrawl
// Then uses Claude AI to extract and classify event data

const SOURCES = [
  { name: 'PistonHeads', url: 'https://www.pistonheads.com/events', selector: 'events' },
  { name: 'Porsche Club GB', url: 'https://www.porscheclubgb.com/events', selector: 'events' },
  { name: 'TrackDay.co.uk', url: 'https://www.trackday.co.uk', selector: 'events' },
  { name: 'Eventbrite', url: 'https://www.eventbrite.co.uk/d/united-kingdom/porsche/', selector: 'events' },
]

export type ScrapedEvent = {
  title: string
  type: 'track' | 'meet' | 'drive' | 'show'
  date: string
  venue: string
  description: string
  price: string
  source_name: string
  source_url: string
}

export async function scrapeAllSources(): Promise<ScrapedEvent[]> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY
  if (!firecrawlKey || firecrawlKey === 'your_firecrawl_key_here') {
    console.log('Firecrawl key not set — returning mock data')
    return getMockScrapedEvents()
  }

  const allEvents: ScrapedEvent[] = []

  for (const source of SOURCES) {
    try {
      console.log(`Scraping ${source.name}...`)

      // Step 1: Scrape the page with Firecrawl
      const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({
          url: source.url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      })

      const scrapeData = await scrapeRes.json()
      if (!scrapeData.success || !scrapeData.data?.markdown) continue

      // Step 2: Use Claude AI to extract structured event data
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Extract all Porsche-related UK car events from this webpage content. 
Return ONLY a JSON array of events. Each event must have:
- title (string)
- type (one of: "track", "meet", "drive", "show")
- date (YYYY-MM-DD format, skip if unclear)
- venue (string, UK location)
- description (string, 1-2 sentences)
- price (string, e.g. "£25" or "Free")
- source_url (string, the URL if found, otherwise "${source.url}")

Only include events that are clearly Porsche-related and in the UK.
If no Porsche events found, return an empty array [].
Return ONLY the JSON array, no other text.

Page content:
${scrapeData.data.markdown.substring(0, 8000)}`
          }],
        }),
      })

      const claudeData = await claudeRes.json()
      const content = claudeData.content?.[0]?.text || '[]'

      try {
        const events = JSON.parse(content.trim())
        const tagged = events.map((e: ScrapedEvent) => ({
          ...e,
          source_name: source.name,
          source_url: e.source_url || source.url,
        }))
        allEvents.push(...tagged)
      } catch {
        console.error(`Failed to parse Claude response for ${source.name}`)
      }

    } catch (err) {
      console.error(`Error scraping ${source.name}:`, err)
    }
  }

  return allEvents
}

// Mock data used when Firecrawl key isn't set yet (for testing)
function getMockScrapedEvents(): ScrapedEvent[] {
  return [
    {
      title: 'Silverstone Porsche Track Day',
      type: 'track',
      date: '2025-07-19',
      venue: 'Silverstone Circuit, Northamptonshire',
      description: 'Full GP circuit open for Porsche owners. All models welcome, instructor sessions available.',
      price: '£295',
      source_name: 'TrackDay.co.uk',
      source_url: 'https://www.trackday.co.uk',
    },
    {
      title: 'Porsche Club GB Yorkshire Drive',
      type: 'drive',
      date: '2025-08-09',
      venue: 'Harrogate, North Yorkshire',
      description: 'Scenic drive through the Yorkshire Dales with a breakfast stop. All Porsches welcome.',
      price: 'Free',
      source_name: 'Porsche Club GB',
      source_url: 'https://www.porscheclubgb.com/events',
    },
    {
      title: 'South Coast Porsche Meet',
      type: 'meet',
      date: '2025-08-23',
      venue: 'Goodwood, West Sussex',
      description: 'Monthly Porsche meet at Goodwood. Coffee, cakes, and cars from 8am.',
      price: 'Free',
      source_name: 'PistonHeads',
      source_url: 'https://www.pistonheads.com/events',
    },
  ]
}
