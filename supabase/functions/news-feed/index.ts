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

function extractCdata(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
  if (cdata) return cdata[1].trim()
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'))
  return plain ? plain[1].trim() : ''
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]+${attr}="([^"]*)"`, 'i'))
  return m ? m[1] : ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Doberman/1.0; +https://doberman.app)' },
            signal: AbortSignal.timeout(12000),
          })
          if (!res.ok) return []
          const xml = await res.text()

          const articles: Array<{
            title: string
            description: string
            image_url: string | null
            source_name: string
            source_url: string
            article_url: string
            published_at: string
            category: string
          }> = []

          const itemRegex = /<item>([\s\S]*?)<\/item>/gi
          let match
          while ((match = itemRegex.exec(xml)) !== null && articles.length < 6) {
            const item = match[1]
            const title = extractCdata(item, 'title')
            // <link> in RSS 2 is a text node, not an attribute
            const linkMatch = item.match(/<link>([^<]+)<\/link>/i) || item.match(/<link[^>]+href="([^"]+)"/i)
            const link = linkMatch ? linkMatch[1].trim() : ''
            const description = extractCdata(item, 'description').replace(/<[^>]+>/g, '').slice(0, 200)
            const pubDate = extractCdata(item, 'pubDate') || extractCdata(item, 'dc:date')

            const mediaUrl = extractAttr(item, 'media:content', 'url') || extractAttr(item, 'media:thumbnail', 'url')
            const enclosureUrl = extractAttr(item, 'enclosure', 'url')
            const image_url = mediaUrl || enclosureUrl || null

            if (title && link) {
              articles.push({
                title,
                description,
                image_url,
                source_name: feed.source,
                source_url: feed.url,
                article_url: link,
                published_at: pubDate || new Date().toISOString(),
                category: 'cybersecurity',
              })
            }
          }
          return articles
        } catch {
          return []
        }
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
