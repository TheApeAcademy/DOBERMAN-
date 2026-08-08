import { useEffect, useState } from 'react'
import { Brain, X, MessageSquarePlus, Link2, Shield, AlertTriangle, CheckCircle, Loader } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { BrainChat } from '../components/brain/BrainChat'
import { BrainHistory } from '../components/brain/BrainHistory'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useBrain } from '../hooks/useBrain'
import { supabase } from '../lib/supabase'
import { dayeNotify } from '../components/daye/DayeAssistant'
import type { BrainConversation, ScamLinkCheck } from '../lib/supabase'

const card: React.CSSProperties = {
  background: 'var(--ovw-0p03)',
  border: '1px solid var(--ovw-0p08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 var(--ovw-0p07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
}

const VERDICT_COLORS = {
  safe: '#30D158',
  suspicious: '#FF9500',
  dangerous: '#FF2D2D',
  phishing: '#FF2D2D',
  malware: '#FF2D2D',
}

const VERDICT_ICONS = {
  safe: CheckCircle,
  suspicious: AlertTriangle,
  dangerous: Shield,
  phishing: Shield,
  malware: Shield,
}

export default function DayePage() {
  const { user, profile, signOut } = useAuth()
  const {
    loading: chatLoading,
    error: chatError,
    activeConversation,
    sendMessage,
    getHistory,
    loadConversation,
    newConversation,
    getDailyCount,
  } = useBrain(user?.id)

  const [activeTab, setActiveTab] = useState<'chat' | 'scam'>('chat')
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)

  // Scam Link Analyzer state
  const [scamUrl, setScamUrl] = useState('')
  const [scamLoading, setScamLoading] = useState(false)
  const [scamResult, setScamResult] = useState<ScamLinkCheck | null>(null)
  const [scamError, setScamError] = useState('')
  const [scamHistory, setScamHistory] = useState<ScamLinkCheck[]>([])

  useEffect(() => {
    if (user) getDailyCount().then(setDailyCount)
  }, [user])

  useEffect(() => {
    if (activeTab === 'scam' && user) loadScamHistory()
  }, [activeTab, user])

  const loadScamHistory = async () => {
    if (!user) return
    const { data } = await supabase
      .from('scam_link_checks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8)
    if (data) setScamHistory(data)
  }

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

  const handleScamAnalyze = async () => {
    if (!scamUrl.trim() || !user) return
    setScamLoading(true)
    setScamError('')
    setScamResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scam-link-analyze', {
        body: { url: scamUrl.trim(), user_id: user.id },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setScamResult(data.check)
      dayeNotify({
        context_type: 'scam_link_result',
        data: { domain: data.check.domain, risk_score: data.check.risk_score, verdict: data.check.verdict },
        message: data.check.daye_analysis,
      })
      await loadScamHistory()
    } catch (err) {
      setScamError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setScamLoading(false)
    }
  }

  const dailyRemaining = Math.max(0, 10 - dailyCount)

  const sidebarStyle: React.CSSProperties = {
    width: 240,
    flexShrink: 0,
    borderRight: '1px solid var(--ovw-0p06)',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--ovw-0p01)',
  }

  const VerdictIcon = scamResult ? (VERDICT_ICONS[scamResult.verdict] || Shield) : Shield
  const verdictColor = scamResult ? (VERDICT_COLORS[scamResult.verdict] || '#ABABAB') : '#ABABAB'

  return (
    <Layout profile={profile} onSignOut={signOut} title="DAYE">
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

        {/* Desktop conversations sidebar (chat tab only) */}
        {activeTab === 'chat' && (
          <div style={{ ...sidebarStyle }} className="lg-show-daye">
            <style>{`@media (max-width: 1023px) { .lg-show-daye { display: none !important; } }`}</style>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--ovw-0p06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={14} style={{ color: 'var(--text-3)' }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Conversations</span>
              </div>
              <button
                onClick={() => newConversation()}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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
        )}

        {/* Mobile history drawer */}
        {historyOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setHistoryOpen(false)} />
            <div style={{ position: 'relative', zIndex: 51, width: 260, background: 'var(--void-1)', borderRight: '1px solid var(--ovw-0p08)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--ovw-0p06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Conversations</span>
                <button onClick={() => setHistoryOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={16} /></button>
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

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Module header — square identity tile + title, no decorative video */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', borderBottom: '1px solid var(--ovw-0p06)', flexShrink: 0 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, flexShrink: 0,
              background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={28} color="#30D158" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: '0.12em', color: 'var(--text-1)', lineHeight: 1 }}>DAYE</h1>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ovw-0p4)', marginTop: 4 }}>AI CYBERSECURITY ANALYST</p>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--ovw-0p07)', background: 'var(--void)', flexShrink: 0 }}>
            {[
              { id: 'chat', label: 'INTELLIGENCE CHAT', icon: Brain },
              { id: 'scam', label: 'SCAM LINK ANALYZER', icon: Link2 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'chat' | 'scam')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '12px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === id ? '2px solid var(--text-1)' : '2px solid transparent',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: activeTab === id ? 'var(--text-1)' : 'var(--text-3)',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  marginBottom: -1,
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}

            {/* Mobile toolbar (chat tab) */}
            {activeTab === 'chat' && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }} className="lg-hide-daye">
                <style>{`@media (min-width: 1024px) { .lg-hide-daye { display: none !important; } }`}</style>
                <button
                  onClick={() => setHistoryOpen(true)}
                  style={{ background: 'var(--ovw-0p06)', border: '1px solid var(--ovw-0p1)', borderRadius: 7, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', cursor: 'pointer' }}
                >
                  <Brain size={11} />
                  HISTORY
                </button>
              </div>
            )}
          </div>

          {/* Tab content */}
          {activeTab === 'chat' ? (
            <BrainChat
              messages={activeConversation?.messages || []}
              onSend={handleSend}
              loading={chatLoading}
              error={chatError}
              dailyRemaining={dailyRemaining}
              onUpgradeClick={() => setUpgradeOpen(true)}
            />
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* DAYE scam link intro */}
                <div style={{ padding: '14px 18px', background: 'rgba(48,209,88,0.05)', border: '1px solid rgba(48,209,88,0.15)', borderRadius: 14 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#30D158', letterSpacing: '0.12em', marginBottom: 4 }}>DAYE THREAT ANALYSIS</p>
                  <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    Paste any suspicious URL below. DAYE will analyze phishing patterns, domain risk, SSL validity, and structural anomalies - then give you a direct threat assessment.
                  </p>
                </div>

                {/* URL input */}
                <div style={card}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase' }}>Paste Suspicious Link</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Link2 size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                      <input
                        value={scamUrl}
                        onChange={(e) => setScamUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScamAnalyze()}
                        placeholder="https://suspicious-link.com/verify-account"
                        style={{
                          width: '100%',
                          background: 'var(--ovw-0p04)',
                          border: '1px solid var(--ovw-0p1)',
                          borderRadius: 10,
                          padding: '11px 14px 11px 36px',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 12,
                          color: 'var(--text-1)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleScamAnalyze}
                      disabled={scamLoading || !scamUrl.trim()}
                      style={{
                        padding: '11px 20px',
                        background: scamLoading ? 'var(--ovw-0p04)' : 'var(--ovw-0p08)',
                        border: '1px solid var(--ovw-0p15)',
                        borderRadius: 10,
                        fontFamily: 'JetBrains Mono',
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        color: scamLoading ? 'var(--text-3)' : 'var(--text-1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        cursor: scamLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      {scamLoading ? <Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Shield size={13} />}
                      {scamLoading ? 'ANALYZING...' : 'ANALYZE'}
                    </button>
                  </div>
                  {scamError && (
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)', marginTop: 10 }}>{scamError}</p>
                  )}
                </div>

                {/* Result */}
                {scamResult && (
                  <div style={{ ...card, border: `1px solid ${verdictColor}33` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <VerdictIcon size={18} style={{ color: verdictColor }} />
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.1em', color: verdictColor }}>
                            {scamResult.verdict.toUpperCase()}
                          </span>
                          {scamResult.threat_type && (
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: verdictColor, background: `${verdictColor}18`, padding: '3px 8px', borderRadius: 6, border: `1px solid ${verdictColor}30` }}>
                              {scamResult.threat_type}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', wordBreak: 'break-all' }}>{scamResult.domain}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: '0.05em', color: verdictColor, lineHeight: 1 }}>{scamResult.risk_score}</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>RISK SCORE</p>
                      </div>
                    </div>

                    {/* Risk bar */}
                    <div style={{ height: 4, background: 'var(--void-4)', borderRadius: 2, marginBottom: 20 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: verdictColor, width: `${scamResult.risk_score}%`, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${verdictColor}60` }} />
                    </div>

                    {/* Indicators */}
                    {scamResult.indicators && scamResult.indicators.length > 0 && (
                      <div style={{ marginBottom: 18 }}>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>THREAT INDICATORS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {scamResult.indicators.map((ind, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                              <AlertTriangle size={11} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                              <span style={{ fontFamily: 'Syne', fontSize: 12, color: 'var(--text-2)' }}>{ind}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DAYE Analysis */}
                    {scamResult.daye_analysis && (
                      <div style={{ padding: '14px 16px', background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p08)', borderRadius: 12 }}>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>DAYE ANALYSIS</p>
                        <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{scamResult.daye_analysis}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan history */}
                {scamHistory.length > 0 && (
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12 }}>RECENT SCANS</p>
                    <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                      {scamHistory.map((item, i) => {
                        const color = VERDICT_COLORS[item.verdict] || '#ABABAB'
                        return (
                          <button
                            key={item.id}
                            onClick={() => setScamResult(item)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 14,
                              padding: '12px 18px',
                              background: 'none',
                              border: 'none',
                              borderBottom: i < scamHistory.length - 1 ? '1px solid var(--ovw-0p06)' : 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.domain}</span>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color, flexShrink: 0 }}>{item.risk_score}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}
