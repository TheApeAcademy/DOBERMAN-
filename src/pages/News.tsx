import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ChromeBlob } from '../components/ui/ChromeBlob'
import { PageWrapper } from '../components/ui/PageWrapper'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { formatRelativeTime } from '../lib/utils'

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

export interface FeedArticle {
  title: string
  description: string
  url: string
  source: string
  published_at: string
  image?: string
}

const VERDICT_COLORS: Record<string, string> = {
  CREDIBLE: 'var(--safe)',
  MISLEADING: 'var(--warning)',
  LIKELY_FALSE: 'var(--danger)',
  UNVERIFIABLE: 'var(--chrome-dim)',
}

export default function News() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<'verify' | 'feed'>(
    (location.state as { tab?: string } | null)?.tab === 'feed' ? 'feed' : 'verify'
  )

  // VERIFY state
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NewsResult | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<NewsCheck[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const historyRef = useScrollReveal()

  // FEED state
  const [feedArticles, setFeedArticles] = useState<FeedArticle[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedLoaded, setFeedLoaded] = useState(false)
  const [feedError, setFeedError] = useState('')

  const verdictColor = result ? (VERDICT_COLORS[result.verdict] || 'var(--chrome-mid)') : 'var(--chrome-mid)'

  useEffect(() => {
    if (activeTab === 'feed' && !feedLoaded) {
      loadFeed()
    }
  }, [activeTab])

  async function loadFeed() {
    setFeedLoading(true)
    setFeedError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('news-feed')
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setFeedArticles(data?.articles || [])
      setFeedLoaded(true)
    } catch (e) {
      setFeedError(e instanceof Error ? e.message : 'Failed to load feed.')
    } finally {
      setFeedLoading(false)
    }
  }

  function refreshFeed() {
    setFeedLoaded(false)
    loadFeed()
  }

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
    setLoading(true)
    setError('')
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
      setError(e instanceof Error ? e.message : 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div style={{ minHeight: '100vh', background: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
        <ChromeBlob size={600} speed={0.3} distort={0.5}
          style={{ top: -100, right: -100, opacity: 0.08, zIndex: 0 }} />
        <ChromeBlob size={300} speed={0.6} distort={0.7}
          style={{ bottom: '20%', left: -80, opacity: 0.06, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>

          {/* Hero video */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 36 }}>
            <video autoPlay muted loop playsInline style={{ width: '100%', maxWidth: 460, borderRadius: 28, pointerEvents: 'none' }}>
              <source src="/assets/video/blob-news.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'var(--danger)', marginBottom: 12 }}>
              [ FAKE NEWS DETECTION ]
            </p>
            <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.92, marginBottom: 16 }}>
              NEWS
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: 'var(--text-2)', maxWidth: 500 }}>
              Paste any headline, claim, or article URL for instant credibility analysis.
            </p>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
            {(['verify', 'feed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  fontWeight: activeTab === tab ? 600 : 400,
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--text-1)' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
                  cursor: 'pointer',
                  marginBottom: -1,
                  transition: 'all 0.2s',
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'verify' ? (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Input card */}
                <div className="glass" style={{ borderRadius: 24, padding: 36, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
                  <label style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-3)', display: 'block', marginBottom: 12 }}>
                    HEADLINE, CLAIM, OR URL
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste any news headline, claim, or article URL..."
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      color: 'var(--text-1)',
                      fontFamily: 'Inter',
                      fontSize: 15,
                      resize: 'vertical',
                      outline: 'none',
                      marginBottom: 20,
                      lineHeight: 1.6,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--glass-border-bright)' }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)' }}
                  />
                  {error && (
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>
                      {error}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-3)' }}>
                      3 verifications/day on free tier
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleVerify}
                      disabled={loading || !content.trim()}
                      style={{
                        padding: '12px 36px',
                        background: loading ? 'var(--void-4)' : 'white',
                        color: loading ? 'var(--text-3)' : 'black',
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        fontSize: 14,
                        border: 'none',
                        borderRadius: 10,
                        transition: 'all 0.2s',
                      }}
                    >
                      {loading ? 'ANALYZING...' : 'VERIFY NOW'}
                    </motion.button>
                  </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                      className="glass"
                      style={{ borderRadius: 24, padding: 36, marginBottom: 32 }}
                    >
                      {/* Score + verdict */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-3)', marginBottom: 4 }}>
                            CREDIBILITY SCORE
                          </p>
                          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 72, color: verdictColor, lineHeight: 1 }}>
                            {result.credibility_score}
                          </span>
                          <span style={{ fontFamily: 'Inter', fontSize: 28, color: verdictColor }}>/100</span>
                        </div>
                        <div>
                          <span style={{
                            fontFamily: 'Bebas Neue',
                            fontSize: 24,
                            letterSpacing: '0.15em',
                            color: verdictColor,
                            background: `${verdictColor}22`,
                            border: `1px solid ${verdictColor}44`,
                            padding: '6px 16px',
                            borderRadius: 8,
                            display: 'inline-block',
                          }}>
                            {result.verdict.replace(/_/g, ' ')}
                          </span>
                          <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                            SOURCE QUALITY: <span style={{ color: 'var(--text-2)' }}>{result.source_quality}</span>
                          </p>
                        </div>
                      </div>

                      {/* Summary */}
                      <p style={{ fontFamily: 'Inter', fontSize: 16, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 32, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: `3px solid ${verdictColor}` }}>
                        {result.summary}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                        {result.red_flags.length > 0 && (
                          <div className="glass" style={{ padding: 20, borderRadius: 16 }}>
                            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--danger)', marginBottom: 14 }}>
                              RED FLAGS ({result.red_flags.length})
                            </p>
                            {result.red_flags.map((flag, i) => (
                              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                                <span style={{ color: 'var(--danger)', fontSize: 10, marginTop: 3, flexShrink: 0 }}>●</span>
                                <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{flag}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {result.positive_signals.length > 0 && (
                          <div className="glass" style={{ padding: 20, borderRadius: 16 }}>
                            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--safe)', marginBottom: 14 }}>
                              POSITIVE SIGNALS ({result.positive_signals.length})
                            </p>
                            {result.positive_signals.map((sig, i) => (
                              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                                <span style={{ color: 'var(--safe)', fontSize: 10, marginTop: 3, flexShrink: 0 }}>●</span>
                                <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{sig}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recommendation */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.03em', color: 'var(--chrome-dim)', whiteSpace: 'nowrap', marginTop: 2 }}>NEXT STEP</span>
                        <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)', lineHeight: 1.6 }}>{result.recommendation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* History */}
                <div ref={historyRef}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-3)' }}>
                      PAST VERIFICATIONS
                    </p>
                    {!historyLoaded && (
                      <button
                        onClick={loadHistory}
                        style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: '1px solid var(--glass-border)', padding: '6px 14px', borderRadius: 6 }}
                      >
                        Load History
                      </button>
                    )}
                  </div>
                  {historyLoaded && history.length === 0 && (
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)' }}>No verifications yet.</p>
                  )}
                  {history.map((item, i) => {
                    const color = VERDICT_COLORS[item.verdict] || 'var(--chrome-dim)'
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="glass"
                        style={{ borderRadius: 14, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}
                      >
                        <span style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color, minWidth: 40 }}>
                          {item.credibility_score}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.content.slice(0, 80)}{item.content.length > 80 ? '...' : ''}
                          </p>
                          <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-3)' }}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.03em', color, background: `${color}22`, border: `1px solid ${color}44`, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                          {item.verdict.replace(/_/g, ' ')}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Feed header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.28)' }}>
                    LIVE INTELLIGENCE FEED
                  </p>
                  <button
                    onClick={refreshFeed}
                    disabled={feedLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: '1px solid var(--glass-border)', padding: '6px 14px', borderRadius: 6, cursor: feedLoading ? 'not-allowed' : 'pointer', opacity: feedLoading ? 0.5 : 1 }}
                  >
                    <RefreshCw size={12} style={{ animation: feedLoading ? 'spin 1s linear infinite' : 'none' }} />
                    REFRESH
                  </button>
                </div>

                {feedError && (
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>{feedError}</p>
                )}

                {feedLoading && feedArticles.length === 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ height: 160, background: 'rgba(255,255,255,0.03)' }} />
                        <div style={{ padding: 20 }}>
                          <div style={{ height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 4, marginBottom: 10, width: '40%' }} />
                          <div style={{ height: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 4, marginBottom: 8 }} />
                          <div style={{ height: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '70%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : feedArticles.length === 0 && feedLoaded ? (
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No articles available.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {feedArticles.map((article, i) => (
                      <motion.div
                        key={article.url + i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="glass"
                        style={{ borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                      >
                        {/* Article image */}
                        <div style={{ height: 160, background: '#0a0a0a', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                          {article.image ? (
                            <img
                              src={article.image}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.06)' }}>NEWS</span>
                            </div>
                          )}
                        </div>

                        {/* Article content */}
                        <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.05em', color: 'var(--chrome-dim)', background: 'rgba(255,255,255,0.06)', padding: '3px 7px', borderRadius: 4, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {article.source}
                            </span>
                            <span style={{ fontFamily: 'Inter', fontSize: 9, color: 'rgba(255,255,255,0.28)' }}>
                              {article.published_at ? formatRelativeTime(article.published_at) : ''}
                            </span>
                          </div>
                          <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.title}
                          </p>
                          {article.description && (
                            <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                              {article.description}
                            </p>
                          )}
                          <button
                            onClick={() => navigate(`/news/article?url=${encodeURIComponent(article.url)}`, { state: { article } })}
                            style={{
                              marginTop: 'auto',
                              padding: '8px 0',
                              background: 'none',
                              border: '1px solid var(--glass-border)',
                              borderRadius: 8,
                              color: 'rgba(255,255,255,0.5)',
                              fontFamily: 'Inter',
                              fontSize: 10,
                              letterSpacing: '0.05em',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border-bright)'; e.currentTarget.style.color = 'var(--text-1)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                          >
                            READ ARTICLE
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageWrapper>
  )
}
