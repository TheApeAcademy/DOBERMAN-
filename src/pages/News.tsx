import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Newspaper, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/layout/Layout'

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

const VERDICT_CONFIG: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle; label: string }> = {
  CREDIBLE:     { color: '#1A9F57', bg: 'rgba(26,159,87,0.06)',    border: 'rgba(26,159,87,0.18)',    icon: CheckCircle,  label: 'CREDIBLE' },
  MISLEADING:   { color: '#CC7A00', bg: 'rgba(204,122,0,0.06)',    border: 'rgba(204,122,0,0.18)',    icon: AlertCircle,  label: 'MISLEADING' },
  LIKELY_FALSE: { color: '#E5292A', bg: 'rgba(229,41,42,0.06)',    border: 'rgba(229,41,42,0.18)',    icon: XCircle,      label: 'LIKELY FALSE' },
  UNVERIFIABLE: { color: '#6B6B70', bg: 'rgba(107,107,112,0.06)', border: 'rgba(107,107,112,0.18)', icon: HelpCircle,   label: 'UNVERIFIABLE' },
}

const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
}

export default function News() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NewsResult | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<NewsCheck[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const verdictKey = result?.verdict || ''
  const verdictConfig = VERDICT_CONFIG[verdictKey] || VERDICT_CONFIG.UNVERIFIABLE
  const VerdictIcon = verdictConfig.icon

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

  const handleAskDoberman = () => {
    if (!result) return
    const snippet = content.length > 300 ? content.slice(0, 300) + '...' : content
    const msg = `I just verified a news claim using D0B3RMAN. The content was: "${snippet}". It was rated ${result.credibility_score}/100 and classified as "${verdictConfig.label}". Source quality: ${result.source_quality}. The analysis said: "${result.summary}". Can you dig deeper into this and explain what I should do with this information?`
    navigate('/brain', { state: { prefill: msg } })
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="NEWS — CONTENT VERIFICATION">
      <div style={{ padding: '28px 28px 48px', maxWidth: 900, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ position: 'relative', height: 240, borderRadius: 20, overflow: 'hidden', marginBottom: 28, background: '#0C0C0E' }}>
          <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
            <source src="/assets/video/blob-news.mp4" type="video/mp4" />
          </video>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 18, left: 22, zIndex: 2 }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.1em', color: '#FFFFFF', lineHeight: 1 }}>NEWS</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>FAKE NEWS + MISINFORMATION DETECTION</p>
          </div>
        </div>

        {/* Input card */}
        <div style={{ ...card, padding: '28px 30px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,149,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Newspaper size={16} style={{ color: '#FF9500' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#0F0F0F', lineHeight: 1 }}>Verify a Claim</p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93', marginTop: 2, letterSpacing: '0.08em' }}>PASTE ANY HEADLINE, CLAIM, OR ARTICLE URL</p>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. 'Scientists confirm 5G towers cause brain tumors' or paste an article URL..."
            rows={4}
            className="input-light"
            style={{ marginBottom: 16, lineHeight: 1.65, fontSize: 14, fontFamily: 'Syne' }}
          />

          {error && (
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#E5292A', marginBottom: 14 }}>{error}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93', letterSpacing: '0.06em' }}>
              3 verifications / day · free tier
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !content.trim()}
              style={{
                padding: '12px 32px',
                background: loading || !content.trim() ? '#E8E8EA' : '#0F0F0F',
                color: loading || !content.trim() ? '#8E8E93' : '#FFFFFF',
                fontFamily: 'JetBrains Mono',
                fontWeight: 600,
                fontSize: 12,
                letterSpacing: '0.12em',
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ ...card, padding: '28px 30px', marginBottom: 20 }}
            >
              {/* Score + verdict */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 72, lineHeight: 1, color: verdictConfig.color }}>{result.credibility_score}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93', letterSpacing: '0.1em' }}>OUT OF 100</p>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <VerdictIcon size={18} style={{ color: verdictConfig.color }} />
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.1em', color: verdictConfig.color }}>{verdictConfig.label}</span>
                  </div>
                  <div style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: 12 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: '#6B6B70' }}>SOURCE QUALITY: {result.source_quality}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${result.credibility_score}%`, background: verdictConfig.color, borderRadius: 2, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: '16px 18px', borderRadius: 14, background: verdictConfig.bg, border: `1px solid ${verdictConfig.border}`, marginBottom: 18 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: verdictConfig.color, marginBottom: 8, textTransform: 'uppercase' }}>Analysis Summary</p>
                <p style={{ fontFamily: 'Syne', fontSize: 14, color: '#0F0F0F', lineHeight: 1.7 }}>{result.summary}</p>
              </div>

              {/* Red flags + positive */}
              <div style={{ display: 'grid', gridTemplateColumns: result.red_flags.length > 0 && result.positive_signals.length > 0 ? '1fr 1fr' : '1fr', gap: 14, marginBottom: 18 }}>
                {result.red_flags.length > 0 && (
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(229,41,42,0.04)', border: '1px solid rgba(229,41,42,0.12)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: '#E5292A', marginBottom: 12, textTransform: 'uppercase' }}>Red Flags ({result.red_flags.length})</p>
                    {result.red_flags.map((flag, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ color: '#E5292A', fontSize: 8, marginTop: 5, flexShrink: 0 }}>●</span>
                        <p style={{ fontFamily: 'Syne', fontSize: 13, color: '#44454B', lineHeight: 1.6 }}>{flag}</p>
                      </div>
                    ))}
                  </div>
                )}
                {result.positive_signals.length > 0 && (
                  <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(26,159,87,0.04)', border: '1px solid rgba(26,159,87,0.12)' }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: '#1A9F57', marginBottom: 12, textTransform: 'uppercase' }}>Positive Signals ({result.positive_signals.length})</p>
                    {result.positive_signals.map((sig, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ color: '#1A9F57', fontSize: 8, marginTop: 5, flexShrink: 0 }}>●</span>
                        <p style={{ fontFamily: 'Syne', fontSize: 13, color: '#44454B', lineHeight: 1.6 }}>{sig}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendation */}
              <div style={{ padding: '14px 18px', borderRadius: 12, background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.06)', marginBottom: 18 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.14em', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase' }}>Recommended Next Step</p>
                <p style={{ fontFamily: 'Syne', fontSize: 14, color: '#0F0F0F', lineHeight: 1.6 }}>{result.recommendation}</p>
              </div>

              {/* Ask DOBERMAN */}
              <button onClick={handleAskDoberman} className="ask-doberman-btn" style={{ width: '100%', justifyContent: 'center', padding: '13px 18px' }}>
                <Brain size={14} />
                DIG DEEPER WITH DOBERMAN INTELLIGENCE
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <div style={{ ...card, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: '#8E8E93', textTransform: 'uppercase' }}>Past Verifications</p>
            {!historyLoaded && (
              <button onClick={loadHistory} style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#44454B', background: 'none', border: '1px solid rgba(0,0,0,0.1)', padding: '5px 12px', borderRadius: 6, letterSpacing: '0.06em' }}>
                LOAD HISTORY
              </button>
            )}
          </div>
          {!historyLoaded && (
            <p style={{ fontFamily: 'Syne', fontSize: 13, color: '#8E8E93', textAlign: 'center', padding: '20px 0' }}>Click "Load History" to see past verifications.</p>
          )}
          {historyLoaded && history.length === 0 && (
            <p style={{ fontFamily: 'Syne', fontSize: 13, color: '#8E8E93', textAlign: 'center', padding: '20px 0' }}>No verifications yet.</p>
          )}
          {history.map((item) => {
            const conf = VERDICT_CONFIG[item.verdict] || VERDICT_CONFIG.UNVERIFIABLE
            return (
              <div key={item.id} onClick={() => setContent(item.content)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, lineHeight: 1, color: conf.color, flexShrink: 0, width: 36, textAlign: 'right' }}>{item.credibility_score}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: '#0F0F0F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                    {item.content.slice(0, 80)}{item.content.length > 80 ? '...' : ''}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em', color: conf.color, background: conf.bg, border: `1px solid ${conf.border}`, padding: '3px 8px', borderRadius: 5, flexShrink: 0 }}>
                  {conf.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
