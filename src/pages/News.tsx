import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, RefreshCw, X, Clock, AlertTriangle } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useCyberNews, type CyberArticle, SOURCE_COLORS, SOURCE_GRADIENTS, timeAgo } from '../hooks/useCyberNews'
import { AskDayeButton } from '../components/daye/AskDayeButton'
import { GridLines } from '../components/ui/GridLines'

/* ── FeedArticle compat export (used by NewsArticle.tsx) ────────── */
export interface FeedArticle {
  title: string
  description: string
  url: string
  source: string
  published_at: string
  image?: string
}

export function toFeedArticle(a: CyberArticle): FeedArticle {
  return {
    title: a.title,
    description: a.description,
    url: a.article_url,
    source: a.source_name,
    published_at: a.published_at,
    image: a.image_url ?? undefined,
  }
}

/* ── Verify types ──────────────────────────────────────────────── */
interface NewsResult {
  credibility_score: number
  verdict: string
  summary: string
  red_flags: string[]
  positive_signals: string[]
  source_quality: string
  recommendation: string
}
interface NewsCheck {
  id: string
  content: string
  credibility_score: number
  verdict: string
  summary: string
  created_at: string
}
const VERDICT_COLORS: Record<string, string> = {
  CREDIBLE: 'var(--safe)',
  MISLEADING: 'var(--warning)',
  LIKELY_FALSE: 'var(--danger)',
  UNVERIFIABLE: 'var(--chrome-dim)',
}

/* ── NewsCard ──────────────────────────────────────────────────── */
function NewsCard({ article, onClick }: { article: CyberArticle; onClick: () => void }) {
  const srcColor = SOURCE_COLORS[article.source_name] || 'var(--chrome-mid)'
  const fallback = SOURCE_GRADIENTS[article.source_name] || 'linear-gradient(135deg,#0a0a0a,#1a1a1a)'

  return (
    <motion.button
      whileHover={{ y: -4, borderColor: 'var(--ovw-0p12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass"
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', textAlign: 'left', padding: 0, width: '100%', transition: 'all 0.2s' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 172, background: article.image_url ? '#060606' : fallback, flexShrink: 0 }}>
        {article.image_url && (
          <img
            src={article.image_url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              el.parentElement!.style.background = fallback
            }}
          />
        )}
        {!article.image_url && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.2em', color: 'var(--ovw-0p04)' }}>D0B3RMAN</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75))' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {article.category && (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--ovw-0p5)', background: 'rgba(0,0,0,0.55)', padding: '3px 7px', borderRadius: 4 }}>
              {article.category.toUpperCase().slice(0, 20)}
            </span>
          )}
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--ovw-0p35)', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Clock size={8} /> {timeAgo(article.published_at)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: srcColor, flexShrink: 0 }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: srcColor }}>
            {article.source_name.toUpperCase()}
          </span>
        </div>
        <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text-1)', lineHeight: 1.45, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.title}
        </p>
        <p style={{ fontFamily: 'Syne', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.description}
        </p>
      </div>
    </motion.button>
  )
}

/* ── ArticleModal ──────────────────────────────────────────────── */
function ArticleModal({ article, onClose }: { article: CyberArticle; onClose: () => void }) {
  const srcColor = SOURCE_COLORS[article.source_name] || 'var(--chrome-mid)'
  const fallback = SOURCE_GRADIENTS[article.source_name] || 'linear-gradient(135deg,#0a0a0a,#1a1a1a)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(24px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass"
        style={{ maxWidth: 620, width: '100%', borderRadius: 24, overflow: 'hidden', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'relative', height: 240, background: article.image_url ? '#060606' : fallback }}>
          {article.image_url && (
            <img src={article.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          {!article.image_url && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 56, letterSpacing: '0.2em', color: 'var(--ovw-0p04)' }}>D0B3RMAN</span>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))' }} />
          <button onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '1px solid var(--ovw-0p1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: srcColor, flexShrink: 0 }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.12em', color: srcColor }}>{article.source_name.toUpperCase()}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>·</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>
              {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {article.category && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.1em', color: 'var(--ovw-0p35)', background: 'var(--ovw-0p06)', padding: '2px 8px', borderRadius: 4, marginLeft: 'auto' }}>
                {article.category.toUpperCase().slice(0, 24)}
              </span>
            )}
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, lineHeight: 1.3, color: 'var(--text-1)', marginBottom: 16 }}>
            {article.title}
          </h2>
          <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28 }}>
            {article.description}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <motion.a
              href={article.article_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px var(--ovw-0p12)' }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', background: 'var(--chrome-white)', color: 'var(--void)', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, borderRadius: 10, textDecoration: 'none' }}
            >
              <ExternalLink size={14} />
              READ FULL ARTICLE
            </motion.a>
            <button onClick={onClose}
              style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-3)', fontFamily: 'Syne', fontSize: 13, borderRadius: 10, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Skeleton ──────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 172, background: 'var(--void-2)', animation: 'shimmer 1.8s infinite' }} />
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ height: 8, background: 'var(--void-3)', borderRadius: 4, width: '40%', marginBottom: 12, animation: 'shimmer 1.8s infinite' }} />
        <div style={{ height: 13, background: 'var(--void-3)', borderRadius: 4, marginBottom: 6, animation: 'shimmer 1.8s infinite' }} />
        <div style={{ height: 13, background: 'var(--void-2)', borderRadius: 4, width: '80%', animation: 'shimmer 1.8s infinite' }} />
      </div>
    </div>
  )
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function News() {
  const { user, profile, signOut } = useAuth()
  const { articles, loading, error, setArticles } = useCyberNews()
  const [activeTab, setActiveTab] = useState<'feed' | 'verify'>('feed')
  const [selectedArticle, setSelectedArticle] = useState<CyberArticle | null>(null)
  const [filterSource, setFilterSource] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  /* verify state */
  const [content, setContent] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<NewsResult | null>(null)
  const [verifyError, setVerifyError] = useState('')
  const [history, setHistory] = useState<NewsCheck[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const sources = ['all', ...Array.from(new Set(articles.map((a) => a.source_name)))]
  const filtered = filterSource === 'all' ? articles : articles.filter((a) => a.source_name === filterSource)

  const verdictColor = result ? VERDICT_COLORS[result.verdict] || 'var(--chrome-mid)' : 'var(--chrome-mid)'

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const { data } = await supabase.functions.invoke('news-feed')
      if (data?.articles) setArticles(data.articles)
    } finally {
      setRefreshing(false)
    }
  }, [setArticles])

  async function loadHistory() {
    if (historyLoaded || !user) return
    const { data } = await supabase
      .from('news_checks')
      .select('id, content, credibility_score, verdict, summary, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistory(data)
    setHistoryLoaded(true)
  }

  async function handleVerify() {
    if (!content.trim() || !user) return
    setVerifying(true)
    setVerifyError('')
    setResult(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('news-verify', {
        body: { content: content.trim(), user_id: user.id },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setResult(data.result)
      setHistoryLoaded(false)
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : 'Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="News">
      <div style={{ minHeight: '100%', background: 'var(--void)', position: 'relative' }}>
        {/* Grid lines background — same subtle texture as the Dashboard */}
        <GridLines />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 60px' }}>

          {/* Module header — square identity tile + title, no decorative banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '28px 0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 88, height: 88, borderRadius: 20, overflow: 'hidden', flexShrink: 0, background: '#060606' }}>
              <img src="/assets/video/cdd8c26722152919a8539f357363c238.jpg" alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,45,45,0.14) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20 }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--danger)', marginBottom: 4 }}>[ CYBER INTELLIGENCE ]</p>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, lineHeight: 1.1 }}>NEWS</h1>
            </div>
          </div>

          {/* Tab bar + controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '28px 0 32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--ovw-0p04)', padding: 4, borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              {(['feed', 'verify'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '8px 22px', borderRadius: 7, background: activeTab === tab ? 'var(--ovw-0p1)' : 'transparent', border: `1px solid ${activeTab === tab ? 'var(--ovw-0p12)' : 'transparent'}`, color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {tab === 'feed' ? 'LIVE FEED' : 'VERIFY'}
                </button>
              ))}
            </div>

            {activeTab === 'feed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--danger)' }}>LIVE</span>
                </div>
                {/* Source filters */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {sources.map((src) => (
                    <button key={src} onClick={() => setFilterSource(src)}
                      style={{ padding: '5px 11px', borderRadius: 6, border: `1px solid ${filterSource === src ? 'var(--ovw-0p18)' : 'var(--ovw-0p06)'}`, background: filterSource === src ? 'var(--ovw-0p07)' : 'transparent', color: filterSource === src ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                      {src === 'all' ? 'ALL' : src.toUpperCase().replace('THE ', '')}
                    </button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh} disabled={refreshing}
                  style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--ovw-0p04)', border: '1px solid var(--glass-border)', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                </motion.button>
              </div>
            )}
          </div>

          {/* ── LIVE FEED ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div key="feed" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                {error ? (
                  <div className="glass" style={{ borderRadius: 16, padding: '32px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text-1)', marginBottom: 4 }}>Feed unavailable</p>
                      <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-3)' }}>{error}</p>
                    </div>
                    <button onClick={handleRefresh} style={{ marginLeft: 'auto', padding: '8px 16px', background: 'var(--ovw-0p06)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-2)', fontFamily: 'JetBrains Mono', fontSize: 11, cursor: 'pointer' }}>
                      Retry
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {loading
                      ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
                      : filtered.map((article, i) => (
                          <motion.div key={article.article_url} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.35 }}>
                            <NewsCard article={article} onClick={() => setSelectedArticle(article)} />
                          </motion.div>
                        ))}
                  </div>
                )}
                {!loading && filtered.length === 0 && !error && (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '60px 0' }}>
                    No articles for this source.
                  </p>
                )}
              </motion.div>
            )}

            {/* ── VERIFY ── */}
            {activeTab === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} style={{ maxWidth: 800 }}>
                <div className="glass" style={{ borderRadius: 24, padding: 36, marginBottom: 28 }}>
                  <label style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', display: 'block', marginBottom: 12 }}>
                    HEADLINE, CLAIM, OR URL
                  </label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste any news headline, claim, or article URL..." rows={4}
                    style={{ width: '100%', background: 'var(--ovw-0p03)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '14px 16px', color: 'var(--text-1)', fontFamily: 'Syne', fontSize: 15, resize: 'vertical', outline: 'none', marginBottom: 20, lineHeight: 1.6, boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--glass-border-bright)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)' }}
                  />
                  {verifyError && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>{verifyError}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>3 verifications/day on free tier</p>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={verifying || !content.trim()}
                      style={{ padding: '12px 36px', background: verifying ? 'var(--void-4)' : 'white', color: verifying ? 'var(--text-3)' : 'black', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10, cursor: verifying ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                      {verifying ? 'ANALYZING...' : 'VERIFY NOW'}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
                      className="glass" style={{ borderRadius: 24, padding: 36, marginBottom: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 4 }}>CREDIBILITY SCORE</p>
                          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 72, color: verdictColor, lineHeight: 1 }}>{result.credibility_score}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 28, color: verdictColor }}>/100</span>
                        </div>
                        <div>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.15em', color: verdictColor, background: `${verdictColor}22`, border: `1px solid ${verdictColor}44`, padding: '6px 16px', borderRadius: 8, display: 'inline-block' }}>
                            {result.verdict.replace(/_/g, ' ')}
                          </span>
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                            SOURCE QUALITY: <span style={{ color: 'var(--text-2)' }}>{result.source_quality}</span>
                          </p>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 28, padding: '18px 22px', background: 'var(--ovw-0p03)', borderRadius: 12, borderLeft: `3px solid ${verdictColor}` }}>
                        {result.summary}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {result.red_flags.length > 0 && (
                          <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
                            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', color: 'var(--danger)', marginBottom: 12 }}>RED FLAGS ({result.red_flags.length})</p>
                            {result.red_flags.map((f, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                                <span style={{ color: 'var(--danger)', fontSize: 9, marginTop: 4, flexShrink: 0 }}>●</span>
                                <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{f}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {result.positive_signals.length > 0 && (
                          <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
                            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em', color: 'var(--safe)', marginBottom: 12 }}>POSITIVE SIGNALS ({result.positive_signals.length})</p>
                            {result.positive_signals.map((s, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                                <span style={{ color: 'var(--safe)', fontSize: 9, marginTop: 4, flexShrink: 0 }}>●</span>
                                <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{s}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ background: 'var(--ovw-0p03)', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--chrome-dim)', whiteSpace: 'nowrap', marginTop: 2 }}>NEXT STEP</span>
                        <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-1)', lineHeight: 1.6 }}>{result.recommendation}</p>
                      </div>
                      <AskDayeButton
                        contextType="news_verify_result"
                        data={{
                          credibility_score: result.credibility_score,
                          verdict: result.verdict,
                          source_quality: result.source_quality,
                          content: content.slice(0, 200),
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* History */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)' }}>PAST VERIFICATIONS</p>
                  {!historyLoaded && (
                    <button onClick={loadHistory} style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: '1px solid var(--glass-border)', padding: '5px 12px', borderRadius: 6, cursor: 'pointer' }}>
                      Load History
                    </button>
                  )}
                </div>
                {historyLoaded && history.length === 0 && <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>No verifications yet.</p>}
                {history.map((item, i) => {
                  const col = VERDICT_COLORS[item.verdict] || 'var(--chrome-dim)'
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="glass" style={{ borderRadius: 12, padding: '14px 18px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: col, minWidth: 36 }}>{item.credibility_score}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.content.slice(0, 80)}{item.content.length > 80 ? '…' : ''}
                        </p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em', color: col, background: `${col}22`, border: `1px solid ${col}44`, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                        {item.verdict.replace(/_/g, ' ')}
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </Layout>
  )
}
