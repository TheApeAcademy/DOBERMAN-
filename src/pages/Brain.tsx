import { useEffect, useState } from 'react'
import { MessageSquarePlus, Target, Link2, X, History } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { BrainChat } from '../components/brain/BrainChat'
import { BrainHistory } from '../components/brain/BrainHistory'
import { ScarAnalyzer } from '../components/brain/ScarAnalyzer'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useBrain } from '../hooks/useBrain'
import { GridLines } from '../components/ui/GridLines'
import type { BrainConversation } from '../lib/supabase'

const SF = `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`

type Tab = 'intelligence' | 'scar'

export default function BrainPage() {
  const { user, profile, signOut } = useAuth()
  const { loading, error, activeConversation, sendMessage, getHistory, loadConversation, newConversation, getDailyCount } = useBrain(user?.id)

  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('intelligence')

  useEffect(() => {
    if (user) getDailyCount().then(setDailyCount)
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

  const tabBtn = (tab: Tab, icon: React.ReactNode, label: string) => {
    const active = activeTab === tab
    return (
      <button
        onClick={() => setActiveTab(tab)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 14px',
          border: 'none',
          borderBottom: `2px solid ${active ? '#30D158' : 'transparent'}`,
          background: 'transparent',
          color: active ? '#F5F5F7' : 'var(--ovw-0p32)',
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          fontFamily: SF,
          letterSpacing: '-0.01em',
          transition: 'color 0.15s, border-color 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="DAYE — AI CYBERSECURITY ANALYST">
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: SF }}>

        {/* Desktop sidebar */}
        <div style={{ width: 236, flexShrink: 0, borderRight: '1px solid var(--ovw-0p06)', display: 'flex', flexDirection: 'column', background: 'var(--ovw-0p01)' }} className="lg-show">
          <style>{`@media (max-width: 1023px) { .lg-show { display: none !important; } }`}</style>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--ovw-0p06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: SF, fontSize: 11, letterSpacing: '0.04em', color: 'var(--ovw-0p25)', textTransform: 'uppercase', fontWeight: 600 }}>Conversations</span>
            <button
              onClick={() => newConversation()}
              style={{ background: 'none', border: 'none', color: 'var(--ovw-0p3)', display: 'flex', alignItems: 'center' }}
              title="New conversation"
            >
              <MessageSquarePlus size={14} />
            </button>
          </div>
          <BrainHistory key={historyKey} userId={user?.id || ''} activeId={activeConversation?.id} getHistory={getHistory} onSelect={handleSelect} onNew={() => newConversation()} />
        </div>

        {/* Mobile history drawer */}
        {historyOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }} onClick={() => setHistoryOpen(false)} />
            <div style={{ position: 'relative', zIndex: 51, width: 275, background: 'var(--void-1)', borderRight: '1px solid var(--ovw-0p08)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--ovw-0p06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: SF, fontSize: 12, color: 'var(--ovw-0p3)', fontWeight: 600 }}>Conversations</span>
                <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ovw-0p4)', display: 'flex' }}>
                  <X size={16} />
                </button>
              </div>
              <BrainHistory key={historyKey} userId={user?.id || ''} activeId={activeConversation?.id} getHistory={getHistory} onSelect={handleSelect} onNew={() => { newConversation(); setHistoryOpen(false) }} />
            </div>
          </div>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
          {/* Grid lines background — same subtle texture as the Dashboard */}
          <GridLines />

          {/* iOS-style page header */}
          <div style={{ padding: '20px 20px 0', background: 'var(--void)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h1 style={{ fontFamily: SF, fontSize: 34, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                  DAYE
                </h1>
                <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 600, color: '#30D158', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 5 }}>
                  AI CYBERSECURITY ANALYST
                </p>
              </div>
              <button
                onClick={() => setHistoryOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 13px',
                  borderRadius: 20,
                  background: 'var(--ovw-0p07)',
                  border: '1px solid var(--ovw-0p1)',
                  color: 'var(--ovw-0p6)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: SF,
                }}
                className="lg-hide-brain"
              >
                <style>{`@media (min-width: 1024px) { .lg-hide-brain { display: none !important; } }`}</style>
                <History size={12} />
                History
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0 }}>
              {tabBtn('intelligence', <Target size={13} />, 'Intelligence Chat')}
              {tabBtn('scar', <Link2 size={13} />, 'Scar Link Analyzer')}
            </div>
            <div style={{ height: 1, background: 'var(--ovw-0p06)' }} />
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 1 }}>
            {activeTab === 'intelligence' ? (
              <BrainChat
                messages={activeConversation?.messages || []}
                onSend={handleSend}
                loading={loading}
                error={error}
                dailyRemaining={dailyRemaining}
                onUpgradeClick={() => setUpgradeOpen(true)}
              />
            ) : (
              <ScarAnalyzer />
            )}
          </div>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}
