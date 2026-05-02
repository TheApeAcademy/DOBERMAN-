import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ChromeBlob } from '../components/ui/ChromeBlob'
import { PageWrapper } from '../components/ui/PageWrapper'

interface ShareResult {
  type: 'eyes' | 'news'
  score: number
  verdict: string
  explanation: string
}

export default function ShareTarget() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<ShareResult | null>(null)
  const [error, setError] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/auth?ref=share')
      return
    }
    handleSharedContent()
  }, [user])

  async function handleSharedContent() {
    try {
      const params = new URLSearchParams(window.location.search)
      const title = params.get('title') || ''
      const text = params.get('text') || ''
      const url = params.get('url') || ''
      const sharedContent = text || url || title

      if (!sharedContent) {
        setError('No content received. Share an image or text to analyze.')
        setLoading(false)
        return
      }

      const isUrl = sharedContent.startsWith('http')
      const isNewsLike = !isUrl || sharedContent.includes('article') || sharedContent.includes('news') || title

      if (isNewsLike) {
        const { data, error: fnError } = await supabase.functions.invoke('news-verify', {
          body: { content: sharedContent, user_id: user!.id },
        })
        if (fnError) throw new Error(fnError.message)
        if (data?.error) throw new Error(data.error)
        setResult({
          type: 'news',
          score: data.result.credibility_score,
          verdict: data.result.verdict.replace(/_/g, ' '),
          explanation: data.result.summary,
        })
      } else {
        const { data, error: fnError } = await supabase.functions.invoke('eyes-analyze', {
          body: { file_url: sharedContent, file_type: 'image', user_id: user!.id },
        })
        if (fnError) throw new Error(fnError.message)
        if (data?.error) throw new Error(data.error)
        setSavedId(data.scan?.id)
        setResult({
          type: 'eyes',
          score: data.scan.confidence_score,
          verdict: data.scan.result.toUpperCase(),
          explanation: data.scan.explanation,
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.score < 40 ? 'var(--safe)' : result.score < 70 ? 'var(--warning)' : 'var(--danger)'
    : 'var(--chrome-mid)'

  return (
    <PageWrapper>
      <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <ChromeBlob size={600} speed={0.3} distort={0.5} style={{ opacity: 0.1 }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.2em' }}>DOBERMAN</span>
          </div>

          <div className="glass" style={{ borderRadius: 28, padding: 40, textAlign: 'center' }}>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ChromeBlob size={120} speed={1} distort={0.6}
                  style={{ position: 'relative', margin: '0 auto 24px', opacity: 0.8 }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.15em', color: 'var(--text-3)' }}>
                  ANALYZING SHARED CONTENT...
                </p>
              </motion.div>
            )}

            {error && !loading && (
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 24, color: 'var(--danger)', marginBottom: 16 }}>!</p>
                <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)', marginBottom: 24 }}>{error}</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate('/dashboard')}
                  style={{ padding: '12px 32px', background: 'white', color: 'black', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10 }}
                >
                  Go to Dashboard
                </motion.button>
              </div>
            )}

            {result && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>
                  {result.type === 'eyes' ? 'DEEPFAKE CONFIDENCE' : 'CREDIBILITY SCORE'}
                </p>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 80, fontWeight: 700, color: scoreColor, lineHeight: 1, marginBottom: 4 }}>
                  {result.score}
                </div>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.15em', color: scoreColor }}>
                  {result.verdict}
                </span>
                <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, margin: '20px 0 32px' }}>
                  {result.explanation}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => navigate(result.type === 'eyes' ? '/eyes' : '/news')}
                    style={{ padding: '12px 28px', background: 'white', color: 'black', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10 }}
                  >
                    View Full Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    className="glass"
                    onClick={() => navigate('/dashboard')}
                    style={{ padding: '12px 28px', color: 'var(--text-2)', fontFamily: 'Syne', fontSize: 13, border: 'none', borderRadius: 10 }}
                  >
                    Dashboard
                  </motion.button>
                </div>
                {savedId && (
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 16 }}>
                    Saved to history
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
