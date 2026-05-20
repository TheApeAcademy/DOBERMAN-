import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Shape returned by the 'news-feed' edge function
export interface CyberArticle {
  title: string
  description: string
  image_url: string | null
  source_name: string
  source_url: string
  article_url: string
  published_at: string
  category: string | null
}

export const SOURCE_COLORS: Record<string, string> = {
  'The Hacker News': '#FF2D2D',
  'Bleeping Computer': '#FF9500',
  'Krebs on Security': '#FFD60A',
  'Dark Reading': '#64D2FF',
  'CISA': '#5E5CE6',
  'SecurityWeek': '#30D158',
}

export const SOURCE_GRADIENTS: Record<string, string> = {
  'The Hacker News': 'linear-gradient(135deg, #1a0505 0%, #2d0000 100%)',
  'Bleeping Computer': 'linear-gradient(135deg, #1a0d00 0%, #2d1a00 100%)',
  'Krebs on Security': 'linear-gradient(135deg, #1a1500 0%, #2a2000 100%)',
  'Dark Reading': 'linear-gradient(135deg, #001a1a 0%, #002828 100%)',
  'CISA': 'linear-gradient(135deg, #05050f 0%, #0a0a28 100%)',
  'SecurityWeek': 'linear-gradient(135deg, #051505 0%, #0a250a 100%)',
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
        const { data, error: fnErr } = await supabase.functions.invoke('news-feed')
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
