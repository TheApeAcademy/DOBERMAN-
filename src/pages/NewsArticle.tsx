import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { PageWrapper } from '../components/ui/PageWrapper'
import type { FeedArticle } from './News'

const DAILY_LIMIT = 10

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function NewsArticle() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const article = (location.state as { article?: FeedArticle } | null)?.article

  const [panelOpen, setPanelOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [briefingDone, setBriefingDone] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (!panelOpen || briefingDone || !user || !article) return
    fetchAutoBriefing()
  }, [panelOpen])

  async function fetchUsageCount() {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('usage_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('module', 'news-intelligence')
      .gte('created_at', today.toISOString())
    setUsageCount(count || 0)
  }

  async function fetchAutoBriefing() {
    if (!user || !article) return
    setBriefingDone(true)
    setChatLoading(true)
    await fetchUsageCount()
    try {
      const { data, error } = await supabase.functions.invoke('news-intelligence', {
        body: {
          article_url: article.url,
          article_title: article.title,
          article_description: article.description,
          user_id: user.id,
        },
      })
      if (error) throw new Error(error.message)
      const reply = data?.response || data?.message || data?.content || 'Unable to generate briefing.'
      setMessages([{ role: 'assistant', content: reply }])
      setUsageCount((c) => c + 1)
    } catch {
      setMessages([{ role: 'assistant', content: 'Failed to generate briefing. Try asking a question below.' }])
    } finally {
      setChatLoading(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || !user || !article || chatLoading) return
    if (usageCount >= DAILY_LIMIT) return

    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setChatLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('news-intelligence', {
        body: {
          article_url: article.url,
          article_title: article.title,
          article_description: article.description,
          user_id: user.id,
          message: userMsg,
        },
      })
      if (error) throw new Error(error.message)
      const reply = data?.response || data?.message || data?.content || 'No response.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      setUsageCount((c) => c + 1)
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error getting response. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  if (!article) {
    return (
      <PageWrapper>
        <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--ovw-0p3)' }}>Article not found.</p>
          <button onClick={() => navigate('/news', { state: { tab: 'feed' } })} style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--chrome-dim)', background: 'none', border: '1px solid var(--glass-border)', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>
            ← Back to Feed
          </button>
        </div>
      </PageWrapper>
    )
  }

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <PageWrapper>
      <div style={{ minHeight: '100vh', background: 'var(--void)', position: 'relative' }}>

        {/* Back bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '16px 24px', background: 'var(--void-1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--ovw-0p06)' }}>
          <button
            onClick={() => navigate('/news', { state: { tab: 'feed' } })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--ovw-0p45)', fontFamily: 'Inter', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0, letterSpacing: '0.03em' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ovw-0p9)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ovw-0p45)' }}
          >
            <ArrowLeft size={14} />
            BACK TO FEED
          </button>
        </div>

        {/* Article body */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 120px' }}>

          {/* Source + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', fontWeight: 600, color: 'var(--ovw-0p55)', background: 'var(--ovw-0p06)', padding: '4px 10px', borderRadius: 4 }}>
              {article.source}
            </span>
            {publishedDate && (
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p28)' }}>
                {publishedDate}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.15, color: 'var(--text-1)', marginBottom: 32 }}>
            {article.title}
          </h1>

          {/* Hero image */}
          {article.image && (
            <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 36, background: '#0a0a0a' }}>
              <img
                src={article.image}
                alt=""
                style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
              />
            </div>
          )}

          {/* Article body */}
          {article.description && (
            <p style={{ fontFamily: 'Inter', fontSize: 17, color: 'var(--ovw-0p6)', lineHeight: 1.8, marginBottom: 40 }}>
              {article.description}
            </p>
          )}

          {/* View original */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em', color: 'var(--ovw-0p4)', textDecoration: 'none', border: '1px solid var(--ovw-0p1)', padding: '10px 20px', borderRadius: 8, display: 'inline-block', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ovw-0p25)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ovw-0p85)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ovw-0p1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ovw-0p4)' }}
          >
            VIEW ORIGINAL ARTICLE ↗
          </a>
        </div>

        {/* Floating Intelligence button + chat panel */}
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 40 }}>

          {/* Chat panel */}
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  position: 'absolute',
                  bottom: 80,
                  right: 0,
                  width: 380,
                  height: 500,
                  background: 'var(--void-1)',
                  border: '1px solid var(--ovw-0p1)',
                  borderRadius: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  backdropFilter: 'blur(40px)',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                }}
              >
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ovw-0p08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <div>
                    <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, letterSpacing: '0.03em', color: 'var(--text-1)' }}>
                      INTELLIGENCE
                    </p>
                    <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--ovw-0p3)', marginTop: 2 }}>
                      Ask about this article
                    </p>
                  </div>
                  <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ovw-0p3)', cursor: 'pointer', padding: 4 }}>
                    <X size={14} />
                  </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatLoading && messages.length === 0 && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 0' }}>
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ovw-0p3)', animation: `pulse 1s infinite ${delay}s` }} />
                      ))}
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: msg.role === 'user' ? 'var(--ovw-0p08)' : 'var(--ovw-0p04)',
                        border: '1px solid var(--ovw-0p08)',
                        fontFamily: 'Inter',
                        fontSize: 13,
                        color: 'var(--ovw-0p85)',
                        lineHeight: 1.6,
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && messages.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, padding: '8px 0' }}>
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ovw-0p3)', animation: `pulse 1s infinite ${delay}s` }} />
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--ovw-0p08)', flexShrink: 0 }}>
                  {usageCount >= DAILY_LIMIT ? (
                    <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--danger)', textAlign: 'center', padding: '8px 0' }}>
                      Daily limit reached ({DAILY_LIMIT} queries/day)
                    </p>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this article..."
                        rows={1}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        style={{
                          flex: 1,
                          background: 'var(--ovw-0p04)',
                          border: '1px solid var(--ovw-0p1)',
                          borderRadius: 10,
                          padding: '9px 12px',
                          color: 'var(--text-1)',
                          fontFamily: 'Inter',
                          fontSize: 13,
                          resize: 'none',
                          outline: 'none',
                          lineHeight: 1.5,
                          maxHeight: 80,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--ovw-0p25)' }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--ovw-0p1)' }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={chatLoading || !input.trim()}
                        style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() && !chatLoading ? '#fff' : 'var(--ovw-0p06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !chatLoading ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'all 0.2s' }}
                      >
                        <Send size={14} style={{ color: input.trim() && !chatLoading ? '#000' : 'var(--ovw-0p25)' }} />
                      </button>
                    </div>
                  )}
                  <p style={{ fontFamily: 'Inter', fontSize: 9, color: 'var(--ovw-0p2)', marginTop: 8, textAlign: 'right' }}>
                    {usageCount}/{DAILY_LIMIT} queries today
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brain video button */}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            title="DOBERMAN Intelligence"
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              overflow: 'hidden',
              border: panelOpen ? '2px solid var(--ovw-0p35)' : '2px solid var(--ovw-0p12)',
              padding: 0,
              cursor: 'pointer',
              position: 'relative',
              boxShadow: panelOpen ? '0 0 28px var(--ovw-0p18)' : '0 4px 20px rgba(0,0,0,0.5)',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ovw-0p35)'; e.currentTarget.style.boxShadow = '0 0 28px var(--ovw-0p18)' }}
            onMouseLeave={(e) => {
              if (!panelOpen) {
                e.currentTarget.style.borderColor = 'var(--ovw-0p12)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)'
              }
            }}
          >
            <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}>
              <source src="/assets/video/Brain_Parts_360_visualization-_Kritrimvault.mp4" type="video/mp4" />
            </video>
          </button>
        </div>

        <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }`}</style>
      </div>
    </PageWrapper>
  )
}
