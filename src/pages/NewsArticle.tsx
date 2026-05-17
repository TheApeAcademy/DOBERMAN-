import { useState, useEffect, useRef } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/layout/Layout'
import { PageWrapper } from '../components/ui/PageWrapper'

interface Article {
  title: string
  description: string
  image_url: string | null
  source_name: string
  source_url: string
  article_url: string
  published_at: string
  category: string | null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function NewsArticle() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const article: Article | null = location.state?.article || null
  const articleUrl = searchParams.get('url') || article?.article_url || ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (articleUrl && user) {
      initChat()
    }
  }, [articleUrl, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function initChat() {
    setInitLoading(true)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('news-intelligence', {
        body: {
          article_url: articleUrl,
          article_title: article?.title,
          article_description: article?.description,
          user_id: user!.id,
        },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      if (data?.messages) setMessages(data.messages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load intelligence.')
    } finally {
      setInitLoading(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || !user || chatLoading) return
    const userMsg = input.trim()
    setInput('')
    setChatLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])

    try {
      const { data, error: fnError } = await supabase.functions.invoke('news-intelligence', {
        body: {
          article_url: articleUrl,
          article_title: article?.title,
          article_description: article?.description,
          user_id: user.id,
          message: userMsg,
        },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      if (data?.messages) setMessages(data.messages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get response.')
    } finally {
      setChatLoading(false)
    }
  }

  const publishedDate = article?.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <Layout profile={profile} onSignOut={signOut} title="NEWS // INTELLIGENCE">
      <PageWrapper>
        <div style={{ minHeight: '100vh', background: 'var(--void)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px' }}>

            {/* Back button */}
            <button
              onClick={() => navigate('/news', { state: { tab: 'feed' } })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24,
                background: 'none', border: 'none', color: 'var(--text-3)',
                fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.05em',
                cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-1)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
            >
              <ArrowLeft size={14} />
              BACK TO FEED
            </button>

            {/* Two-panel layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'clamp(300px, 60%, 700px) 1fr',
              gap: 24,
              alignItems: 'start',
            }}>

              {/* LEFT: Article */}
              <div className="glass" style={{ borderRadius: 24, overflow: 'hidden' }}>
                {article?.image_url && (
                  <div style={{ height: 260, overflow: 'hidden', background: '#060606' }}>
                    <img
                      src={article.image_url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
                <div style={{ padding: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em',
                      color: 'var(--chrome-dim)', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: 4,
                    }}>
                      {article?.source_name?.toUpperCase() || 'SOURCE'}
                    </span>
                    {publishedDate && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>
                        {publishedDate}
                      </span>
                    )}
                  </div>

                  <h1 style={{
                    fontFamily: 'Syne', fontWeight: 800,
                    fontSize: 'clamp(20px, 3vw, 28px)',
                    lineHeight: 1.25, color: 'var(--text-1)', marginBottom: 20,
                  }}>
                    {article?.title || 'Article'}
                  </h1>

                  {article?.category && (
                    <span style={{
                      fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
                      color: 'var(--danger)', background: 'rgba(255,45,45,0.08)',
                      border: '1px solid rgba(255,45,45,0.2)', padding: '3px 8px', borderRadius: 4,
                      display: 'inline-block', marginBottom: 20,
                    }}>
                      {article.category.toUpperCase()}
                    </span>
                  )}

                  {article?.description && (
                    <p style={{
                      fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)',
                      lineHeight: 1.75, marginBottom: 28,
                      padding: '16px 20px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: 12, borderLeft: '3px solid var(--glass-border-bright)',
                    }}>
                      {article.description}
                    </p>
                  )}

                  {articleUrl && (
                    <a
                      href={articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 10, color: 'var(--text-1)',
                        fontFamily: 'JetBrains Mono', fontSize: 12,
                        textDecoration: 'none', transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--glass-border-bright)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--glass-border)' }}
                    >
                      <ExternalLink size={14} />
                      VIEW ORIGINAL ARTICLE
                    </a>
                  )}
                </div>
              </div>

              {/* RIGHT: Intelligence Chat */}
              <div className="glass" style={{ borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: 500 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--danger)', marginBottom: 4 }}>
                    [ INTELLIGENCE ANALYST ]
                  </p>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.1em' }}>
                    Ask about this article
                  </p>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {initLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.08)',
                        borderTop: '2px solid var(--danger)',
                        animation: 'spin 0.8s linear infinite',
                        flexShrink: 0,
                      }} />
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>
                        Analyzing article...
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                        >
                          <div style={{
                            maxWidth: '88%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: msg.role === 'user'
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                          }}>
                            {msg.role === 'assistant' && (
                              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--danger)', marginBottom: 8 }}>
                                INTELLIGENCE
                              </p>
                            )}
                            <p style={{
                              fontFamily: 'Syne', fontSize: 13, lineHeight: 1.65,
                              color: msg.role === 'user' ? 'var(--text-1)' : 'var(--text-2)',
                              whiteSpace: 'pre-wrap',
                            }}>
                              {msg.content}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {chatLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{ display: 'flex', gap: 6, padding: '8px 0' }}
                        >
                          {[0, 1, 2].map((i) => (
                            <div key={i} style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: 'var(--text-3)',
                              animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                            }} />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  {error && (
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)' }}>
                      {error}
                    </p>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Ask about this article..."
                      disabled={initLoading || chatLoading}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 10,
                        padding: '10px 14px',
                        color: 'var(--text-1)',
                        fontFamily: 'Syne', fontSize: 13, outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--glass-border-bright)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || chatLoading || initLoading}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: input.trim() ? 'white' : 'rgba(255,255,255,0.06)',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: input.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0,
                      }}
                    >
                      <Send size={16} style={{ color: input.trim() ? 'black' : 'var(--text-3)' }} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 8 }}>
                    10 intelligence queries/day
                  </p>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
            @media (max-width: 768px) {
              .article-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </PageWrapper>
    </Layout>
  )
}
