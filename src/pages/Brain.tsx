import { useEffect, useState } from 'react'
import { Zap, X, Plus, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { BrainChat } from '../components/brain/BrainChat'
import { BrainHistory } from '../components/brain/BrainHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useBrain } from '../hooks/useBrain'
import type { BrainConversation } from '../lib/supabase'

export default function BrainPage() {
  const { user, profile, signOut } = useAuth()
  const {
    loading,
    error,
    activeConversation,
    sendMessage,
    getHistory,
    loadConversation,
    newConversation,
    getDailyCount,
  } = useBrain(user?.id)

  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (user) getDailyCount().then(setDailyCount)
  }, [user])

  // Auto-open chat if there's already an active conversation
  useEffect(() => {
    if (activeConversation) setChatOpen(true)
  }, [activeConversation])

  const handleSend = async (content: string) => {
    await sendMessage(content, activeConversation?.id)
    const count = await getDailyCount()
    setDailyCount(count)
    setHistoryKey((k) => k + 1)
  }

  const handleSelect = (conv: BrainConversation) => {
    loadConversation(conv.id)
    setHistoryOpen(false)
    setChatOpen(true)
  }

  const dailyRemaining = Math.max(0, 10 - dailyCount)

  const sidebarStyle: React.CSSProperties = {
    width: 256,
    flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(0,0,0,0.4)',
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="D0B3RMAN INTELLIGENCE">
      <div style={{ height: 'calc(100vh - 56px)', position: 'relative', overflow: 'hidden' }}>

        <AnimatePresence mode="wait">
          {!chatOpen ? (
            /* ─── INTRO STATE: big video + access button ─── */
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#000',
                overflowY: 'auto',
              }}
            >
              {/* Standalone brain video — 3× original size */}
              <div style={{
                width: '100%',
                position: 'relative',
                height: 'clamp(380px, 60vw, 640px)',
                overflow: 'hidden',
                background: '#060606',
                flexShrink: 0,
              }}>
                <video
                  autoPlay muted loop playsInline preload="auto"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: 'screen',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                >
                  <source src="/assets/video/blob-di.mp4" type="video/mp4" />
                </video>
                {/* gradient fade bottom */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '50%',
                  background: 'linear-gradient(to bottom, transparent, #000)',
                  pointerEvents: 'none',
                }} />
                {/* gradient fade top */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '20%',
                  background: 'linear-gradient(to top, transparent, rgba(0,0,0,0.5))',
                  pointerEvents: 'none',
                }} />
                {/* Corner label */}
                <div style={{
                  position: 'absolute',
                  top: 20, left: 24,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.3)',
                  zIndex: 2,
                }}>
                  D0B3RMAN INTELLIGENCE
                </div>
              </div>

              {/* Title + CTA below video */}
              <div style={{
                padding: '0 24px 60px',
                textAlign: 'center',
                maxWidth: 680,
                width: '100%',
                marginTop: -20,
                position: 'relative',
                zIndex: 2,
              }}>
                <p style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  letterSpacing: '0.25em',
                  color: 'rgba(0,212,106,0.6)',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                }}>
                  [ AI SECURITY ANALYST ]
                </p>
                <h1 style={{
                  fontFamily: 'Bebas Neue',
                  fontSize: 'clamp(48px, 8vw, 96px)',
                  letterSpacing: '0.15em',
                  color: 'white',
                  lineHeight: 0.95,
                  marginBottom: 20,
                }}>
                  D0B3RMAN<br />
                  <span style={{ color: 'var(--safe)' }}>INTELLIGENCE</span>
                </h1>
                <p style={{
                  fontFamily: 'Syne',
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.7,
                  marginBottom: 40,
                  maxWidth: 480,
                  margin: '0 auto 40px',
                }}>
                  Ask anything about threats, CVEs, network defense, or cybersecurity best practices. Your AI analyst is always on.
                </p>

                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(0,212,106,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { newConversation(); setChatOpen(true) }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 44px',
                    background: 'var(--safe)',
                    color: '#000',
                    fontFamily: 'Syne',
                    fontWeight: 800,
                    fontSize: 15,
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  <Zap size={18} />
                  ENTER D0B3RMAN INTELLIGENCE
                  <ChevronRight size={18} />
                </motion.button>

                <p style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.18)',
                  marginTop: 20,
                  letterSpacing: '0.05em',
                }}>
                  {dailyRemaining}/10 queries remaining today
                </p>
              </div>
            </motion.div>

          ) : (
            /* ─── CHAT STATE: ChatGPT-style layout ─── */
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', height: '100%' }}
            >
              {/* Desktop sidebar */}
              <div style={{ ...sidebarStyle }} className="lg-show">
                <style>{`@media (max-width: 1023px) { .lg-show { display: none !important; } }`}</style>
                <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={14} style={{ color: 'var(--safe)' }} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Threads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => newConversation()}
                      style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }}
                    >
                      <Plus size={11} />
                      NEW
                    </button>
                    <button
                      onClick={() => setChatOpen(false)}
                      style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '5px 6px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      title="Back to intro"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
                <BrainHistory
                  key={historyKey}
                  userId={user?.id || ''}
                  activeId={activeConversation?.id}
                  getHistory={getHistory}
                  onSelect={handleSelect}
                  onNew={() => newConversation()}
                />
              </div>

              {/* Mobile history drawer */}
              {historyOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setHistoryOpen(false)} />
                  <div style={{ position: 'relative', zIndex: 51, width: 260, background: 'rgba(0,0,0,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Threads</span>
                      <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)' }}>
                        <X size={16} />
                      </button>
                    </div>
                    <BrainHistory
                      key={historyKey}
                      userId={user?.id || ''}
                      activeId={activeConversation?.id}
                      getHistory={getHistory}
                      onSelect={handleSelect}
                      onNew={() => { newConversation(); setHistoryOpen(false) }}
                    />
                  </div>
                </div>
              )}

              {/* Chat area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Mobile toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="lg-hide-brain">
                  <style>{`@media (min-width: 1024px) { .lg-hide-brain { display: none !important; } }`}</style>
                  <button
                    onClick={() => setHistoryOpen(true)}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em' }}
                  >
                    <Zap size={12} style={{ color: 'var(--safe)' }} />
                    THREADS
                  </button>
                  <button
                    onClick={() => setChatOpen(false)}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em' }}
                  >
                    <X size={12} />
                    BACK
                  </button>
                </div>

                <BrainChat
                  messages={activeConversation?.messages || []}
                  onSend={handleSend}
                  loading={loading}
                  error={error}
                  dailyRemaining={dailyRemaining}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}
