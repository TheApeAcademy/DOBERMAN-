import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ChromeBlob } from '../components/ui/ChromeBlob'
import { PageWrapper } from '../components/ui/PageWrapper'
import { useScrollReveal } from '../hooks/useScrollReveal'

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

export default function News() {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NewsResult | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<NewsCheck[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const historyRef = useScrollReveal()

  const verdictColor = result ? (VERDICT_COLORS[result.verdict] || 'var(--chrome-mid)') : 'var(--chrome-mid)'

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

          {/* Hero image */}
          <div style={{ position: 'relative', height: 280, borderRadius: 24, overflow: 'hidden', marginBottom: 40, background: '#060606' }}>
            <img src="/assets/video/cdd8c26722152919a8539f357363c238.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24 }} />
            <div style={{ position: 'absolute', bottom: 16, left: 20, fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', zIndex: 2 }}>
              NEWS -- VERIFY CONTENT
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
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
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.15em', color: verdictColor, background: `${verdictColor}22`, border: `1px solid ${verdictColor}44`, padding: '6px 16px', borderRadius: 8, display: 'inline-block' }}>
                      {result.verdict.replace(/_/g, ' ')}
                    </span>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                      SOURCE QUALITY: <span style={{ color: 'var(--text-2)' }}>{result.source_quality}</span>
                    </p>
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 16, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 32, padding: '20px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: `3px solid ${verdictColor}` }}>
                  {result.summary}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  {result.red_flags.length > 0 && (
                    <div className="glass" style={{ padding: 20, borderRadius: 16 }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--danger)', marginBottom: 14 }}>RED FLAGS ({result.red_flags.length})</p>
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
                      <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--safe)', marginBottom: 14 }}>POSITIVE SIGNALS ({result.positive_signals.length})</p>
                      {result.positive_signals.map((sig, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                          <span style={{ color: 'var(--safe)', fontSize: 10, marginTop: 3, flexShrink: 0 }}>●</span>
                          <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{sig}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.04em', color: 'var(--text-3)' }}>PAST VERIFICATIONS</p>
              {!historyLoaded && (
                <button onClick={loadHistory} style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: '1px solid var(--glass-border)', padding: '6px 14px', borderRadius: 6 }}>Load History</button>
              )}
            </div>
            {historyLoaded && history.length === 0 && (
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text-3)' }}>No verifications yet.</p>
            )}
            {history.map((item, i) => {
              const color = VERDICT_COLORS[item.verdict] || 'var(--chrome-dim)'
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="glass" style={{ borderRadius: 14, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color, minWidth: 40 }}>{item.credibility_score}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content.slice(0, 80)}{item.content.length > 80 ? '...' : ''}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--text-3)' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.03em', color, background: `${color}22`, border: `1px solid ${color}44`, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>{item.verdict.replace(/_/g, ' ')}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
