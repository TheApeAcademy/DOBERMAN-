import { useEffect, useState } from 'react'
import { Brain, Menu, X } from 'lucide-react'
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

  useEffect(() => {
    if (user) {
      getDailyCount().then(setDailyCount)
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

  return (
    <Layout profile={profile} onSignOut={signOut} title="BRAIN - AI Security Analyst">
      <div className="flex h-[calc(100vh-56px)] page-fade">
        {/* History sidebar - desktop */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border-color bg-bg-secondary">
          <div className="p-4 border-b border-border-color">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-accent-green" />
              <span className="font-display text-sm tracking-wider text-text-primary">BRAIN</span>
            </div>
          </div>
          <BrainHistory
            key={historyKey}
            userId={user?.id || ''}
            activeId={activeConversation?.id}
            getHistory={getHistory}
            onSelect={handleSelect}
            onNew={() => { newConversation(); }}
          />
        </div>

        {/* Mobile history drawer */}
        {historyOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setHistoryOpen(false)} />
            <div className="relative w-64 bg-bg-secondary border-r border-border-color z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border-color">
                <span className="font-display text-sm tracking-wider text-text-primary">CONVERSATIONS</span>
                <button onClick={() => setHistoryOpen(false)}>
                  <X size={16} className="text-text-muted" />
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile history toggle */}
          <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-border-color">
            <button
              onClick={() => setHistoryOpen(true)}
              className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-2 text-xs font-label"
            >
              <Menu size={14} />
              Conversations
            </button>
            {activeConversation && (
              <span className="text-text-muted font-body text-xs truncate ml-2">
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
