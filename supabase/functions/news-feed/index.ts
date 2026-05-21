import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'Bleeping Computer' },
  { url: 'https://feeds.feedburner.com/KrebsOnSecurity', source: 'Krebs on Security' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading' },
  { url: 'https://feeds.feedburner.com/SecurityWeek', source: 'SecurityWeek' },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=6`,
          { signal: AbortSignal.timeout(8000) }
        )
        const data = await res.json()
        if (data.status !== 'ok' || !data.items) return []
        return data.items.map((item) => ({
          title: (item.title || '').trim(),
          description: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 200),
          image_url: item.thumbnail || item.enclosure?.link || null,
          source_name: feed.source,
          source_url: data.feed?.link || '',
          article_url: item.link,
          published_at: item.pubDate,
          category: 'cybersecurity',
        }))
      })
    )

    const articles = results
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 24)

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('news-feed error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch news', articles: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
