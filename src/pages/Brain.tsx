import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Brain, X, MessageSquarePlus } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { BrainChat } from '../components/brain/BrainChat'
import { BrainHistory } from '../components/brain/BrainHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useBrain } from '../hooks/useBrain'
import type { BrainConversation } from '../lib/supabase'

export default function BrainPage() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const prefillSentRef = useRef(false)
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

  useEffect(() => {
    if (user) getDailyCount().then(setDailyCount)
  }, [user])

  useEffect(() => {
    const prefill = location.state?.prefill
    if (prefill && user && !prefillSentRef.current) {
      prefillSentRef.current = true
      handleSend(prefill)
      window.history.replaceState({}, document.title)
    }
  }, [user])

  const handleSend = async (content: string) => {
    await sendMessage(content, activeConversation?.id)
    const count = await getDailyCount()
    setDailyCount(count)
    setHistoryKey((k) => k + 1)
  }

  const handleSelect = (conv: BrainConversation) => {
    loadConversation(conv.id)
    setHistoryOpen(false)
  }

  const dailyRemaining = Math.max(0, 10 - dailyCount)

  const sidebarStyle: React.CSSProperties = {
    width: 240,
    flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255,255,255,0.01)',
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="BRAIN — AI SECURITY ANALYST">
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

        {/* Desktop sidebar */}
        <div style={{ ...sidebarStyle }} className="lg-show">
          <style>{`@media (max-width: 1023px) { .lg-show { display: none !important; } }`}</style>

          {/* Sidebar header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={14} style={{ color: 'var(--text-3)' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Conversations</span>
            </div>
            <button
              onClick={() => newConversation()}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}
              title="New conversation"
            >
              <MessageSquarePlus size={14} />
            </button>
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
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setHistoryOpen(false)} />
            <div style={{ position: 'relative', zIndex: 51, width: 260, background: 'var(--void-1)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Conversations</span>
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

          {/* Hero video */}
          <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#060606', flexShrink: 0 }}>
            <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
              <source src="/assets/video/blob-brain.mp4" type="video/mp4" />
            </video>
            <div style={{ position: 'absolute', inset: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', zIndex: 2 }}>
              BRAIN -- AI SECURITY ANALYST
            </div>
          </div>

          {/* Mobile toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }} className="lg-hide-brain">
            <style>{`@media (min-width: 1024px) { .lg-hide-brain { display: none !important; } }`}</style>
            <button
              onClick={() => setHistoryOpen(true)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em' }}
            >
              <Brain size={12} />
              CONVERSATIONS
            </button>
            {activeConversation && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeConversation.title}
              </span>
            )}
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
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}
