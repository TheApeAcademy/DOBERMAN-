import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RSS_SOURCES = [
  { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews', siteUrl: 'https://thehackernews.com' },
  { name: 'Bleeping Computer', url: 'https://www.bleepingcomputer.com/feed/', siteUrl: 'https://www.bleepingcomputer.com' },
  { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', siteUrl: 'https://www.darkreading.com' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', siteUrl: 'https://krebsonsecurity.com' },
  { name: 'SecurityWeek', url: 'https://feeds.feedburner.com/Securityweek', siteUrl: 'https://www.securityweek.com' },
  { name: 'CISA', url: 'https://www.cisa.gov/cybersecurity-advisories.xml', siteUrl: 'https://www.cisa.gov' },
]

type Article = {
  title: string
  description: string
  image_url: string | null
  source_name: string
  source_url: string
  article_url: string
  published_at: string
  category: string | null
}

function getCdata(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
  return match ? match[1].trim() : ''
}

function getText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)<\\/${tag}>`, 'i'))
  return match ? match[1].trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseXml(xml: string, sourceName: string, sourceUrl: string): Article[] {
  const articles: Article[] = []

  // Try RSS <item> first, then Atom <entry>
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  const matches: string[] = []
  let m: RegExpExecArray | null

  const useEntry = !itemRegex.test(xml)
  const activeRegex = useEntry ? entryRegex : /<item>([\s\S]*?)<\/item>/g

  while ((m = activeRegex.exec(xml)) !== null) {
    matches.push(m[1])
  }

  for (const item of matches.slice(0, 10)) {
    const title = stripHtml(getCdata(item, 'title') || getText(item, 'title'))
    if (!title) continue

    let link = getCdata(item, 'link') || getText(item, 'link') || ''
    if (!link) {
      const atomLink = item.match(/<link[^>]+href="([^"]+)"/)
      if (atomLink) link = atomLink[1]
    }
    if (!link) link = getCdata(item, 'guid') || getText(item, 'guid') || ''
    if (!link) continue

    const rawDesc = getCdata(item, 'description') || getText(item, 'description') ||
      getCdata(item, 'summary') || getText(item, 'summary') || ''
    const description = stripHtml(rawDesc).slice(0, 300)

    const pubDate = getText(item, 'pubDate') || getText(item, 'published') || getText(item, 'updated') || ''
    let publishedAt: string
    try {
      publishedAt = new Date(pubDate).toISOString()
    } catch {
      publishedAt = new Date().toISOString()
    }

    let imageUrl: string | null = null
    const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"/)
    if (enclosureMatch) imageUrl = enclosureMatch[1]
    if (!imageUrl) {
      const mediaContent = item.match(/<media:content[^>]+url="([^"]+)"/)
      if (mediaContent) imageUrl = mediaContent[1]
    }
    if (!imageUrl) {
      const mediaThumbnail = item.match(/<media:thumbnail[^>]+url="([^"]+)"/)
      if (mediaThumbnail) imageUrl = mediaThumbnail[1]
    }
    if (!imageUrl) {
      const imgTag = item.match(/<img[^>]+src="([^"]+)"/)
      if (imgTag) imageUrl = imgTag[1]
    }

    const category = getCdata(item, 'category') || getText(item, 'category') || null

    articles.push({
      title,
      description,
      image_url: imageUrl,
      source_name: sourceName,
      source_url: sourceUrl,
      article_url: link.trim(),
      published_at: publishedAt,
      category,
    })
  }

  return articles
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Return cache if fresh (< 30 min old and has articles)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { count: freshCount } = await supabase
      .from('cached_news_articles')
      .select('*', { count: 'exact', head: true })
      .gte('cached_at', thirtyMinsAgo)

    if (freshCount && freshCount > 10) {
      const { data: cached } = await supabase
        .from('cached_news_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(60)
      return new Response(JSON.stringify({ articles: cached || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch all RSS feeds in parallel
    const fetchResults = await Promise.allSettled(
      RSS_SOURCES.map(async (source) => {
        const res = await fetch(source.url, {
          headers: { 'User-Agent': 'DOBERMAN-Security-Platform/1.0' },
          signal: AbortSignal.timeout(8000),
        })
        const xml = await res.text()
        return parseXml(xml, source.name, source.siteUrl)
      })
    )

    const allArticles: Article[] = fetchResults
      .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

    if (allArticles.length > 0) {
      await supabase
        .from('cached_news_articles')
        .upsert(
          allArticles.map((a) => ({ ...a, cached_at: new Date().toISOString() })),
          { onConflict: 'article_url' }
        )
    }

    return new Response(JSON.stringify({ articles: allArticles.slice(0, 60) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('news-feed error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
