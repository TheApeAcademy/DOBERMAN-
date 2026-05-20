import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface CyberArticle {
  id: string
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  category: string
  image: string | null
}

export const SOURCE_COLORS: Record<string, string> = {
  'The Hacker News': '#FF2D2D',
  'Bleeping Computer': '#FF9500',
  'Krebs on Security': '#FFD60A',
  'Dark Reading': '#64D2FF',
  'CISA': '#5E5CE6',
}

export const CATEGORY_LABELS: Record<string, string> = {
  'threat-intel': 'THREAT INTEL',
  'vulnerabilities': 'VULNERABILITIES',
  'cybercrime': 'CYBERCRIME',
  'industry': 'INDUSTRY',
  'advisories': 'ADVISORY',
}

export const FALLBACK_GRADIENTS: Record<string, string> = {
  'threat-intel': 'linear-gradient(135deg, #1a0505 0%, #2d0000 100%)',
  'vulnerabilities': 'linear-gradient(135deg, #1a0d00 0%, #2d1a00 100%)',
  'cybercrime': 'linear-gradient(135deg, #1a0505 0%, #2d0505 100%)',
  'industry': 'linear-gradient(135deg, #050514 0%, #0a0a20 100%)',
  'advisories': 'linear-gradient(135deg, #050514 0%, #0a0a28 100%)',
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function useCyberNews() {
  const [articles, setArticles] = useState<CyberArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data, error: fnErr } = await supabase.functions.invoke('cyber-news')
        if (!active) return
        if (fnErr) throw new Error(fnErr.message)
        setArticles(data?.articles || [])
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load news')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  return { articles, loading, error, setArticles }
}
