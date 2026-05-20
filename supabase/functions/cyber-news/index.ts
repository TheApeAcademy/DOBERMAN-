const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Article {
  id: string
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category: string
  image: string | null
}

const FEEDS = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', category: 'threat-intel' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'Bleeping Computer', category: 'vulnerabilities' },
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', category: 'cybercrime' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading', category: 'industry' },
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA', category: 'advisories' },
]

function getTag(xml: string, tag: string): string {
  const m =
    xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i')) ||
    xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function strip(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .trim()
}

function extractImage(xml: string): string | null {
  const patterns = [
    /url=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"']*)?)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
    /<media:(?:content|thumbnail)[^>]+url=["']([^"']+)["']/i,
  ]
  for (const p of patterns) {
    const m = xml.match(p)
    if (m?.[1]?.startsWith('http')) return m[1]
  }
  return null
}

function parseRSS(xml: string, source: string, category: string): Article[] {
  const out: Article[] = []
  const re = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) && out.length < 10) {
    const x = m[1]
    const title = strip(getTag(x, 'title'))
    const link = getTag(x, 'link') || getTag(x, 'guid')
    const desc = strip(getTag(x, 'description') || getTag(x, 'content:encoded') || '').slice(0, 400)
    const pub = getTag(x, 'pubDate') || getTag(x, 'dc:date') || ''
    const image = extractImage(x)
    if (title && link?.startsWith('http')) {
      let pubIso = new Date().toISOString()
      try { if (pub) pubIso = new Date(pub).toISOString() } catch { /* keep now */ }
      out.push({
        id: btoa(encodeURIComponent(link.slice(0, 80))).replace(/\W/g, '').slice(0, 32),
        title: title.slice(0, 200),
        link,
        description: desc,
        pubDate: pubIso,
        source,
        category,
        image,
      })
    }
  }
  return out
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async ({ url, source, category }) => {
        const r = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DOBERMAN-CyberWatch/1.0)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(10000),
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return parseRSS(await r.text(), source, category)
      })
    )
    const articles = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => (r as PromiseFulfilledResult<Article[]>).value)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    return new Response(JSON.stringify({ articles, count: articles.length }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, articles: [] }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
