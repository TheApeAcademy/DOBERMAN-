import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Phone, AlertTriangle, CheckCircle, ChevronRight, Brain, Clock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useBreach } from '../hooks/useBreach'
import { UpgradeModal } from '../components/ui/Modal'

const BROWN = {
  dark: '#0d0500',
  mid: '#1a0900',
  accent: '#8B4513',
  bright: '#CD853F',
  glow: 'rgba(139, 69, 19, 0.25)',
  border: 'rgba(139, 69, 19, 0.3)',
  text: '#DEB887',
  textDim: '#A0522D',
}

type ScanType = 'email' | 'password' | 'phone'

const SCAN_TABS: { type: ScanType; label: string; icon: typeof Mail; placeholder: string; hint: string }[] = [
  { type: 'email', label: 'EMAIL ADDRESS', icon: Mail, placeholder: 'user@example.com', hint: 'Check if your email has been exposed in known data breaches' },
  { type: 'password', label: 'PASSWORD', icon: Lock, placeholder: '••••••••••••', hint: 'Checked via k-anonymity — your password is never transmitted in full' },
  { type: 'phone', label: 'PHONE NUMBER', icon: Phone, placeholder: '+1 555 000 0000', hint: 'Check if your phone number appears in known breach databases' },
]

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    none: { label: 'CLEAR', color: '#30D158', bg: 'rgba(48,209,88,0.12)' },
    low: { label: 'LOW RISK', color: '#FF9500', bg: 'rgba(255,149,0,0.12)' },
    medium: { label: 'MEDIUM RISK', color: '#FF9500', bg: 'rgba(255,149,0,0.12)' },
    critical: { label: 'CRITICAL', color: '#FF2D2D', bg: 'rgba(255,45,45,0.12)' },
  }
  const { label, color, bg } = map[severity] || map.none
  return (
    <span style={{
      fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
      color, background: bg, border: `1px solid ${color}44`,
      padding: '4px 10px', borderRadius: 4,
    }}>
      {label}
    </span>
  )
}

export default function Breach() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { scanning, result, error, scan, getHistory, getDailyCount } = useBreach(user?.id)

  const [activeTab, setActiveTab] = useState<ScanType>('email')
  const [inputValue, setInputValue] = useState('')
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [history, setHistory] = useState<Array<{ id: string; scan_type: string; query: string; created_at: string }>>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      getDailyCount().then(setDailyCount)
      getHistory().then((h) => { setHistory(h); setHistoryLoaded(true) })
    }
  }, [user])

  const remainingScans = Math.max(0, 3 - dailyCount)

  const handleScan = async () => {
    if (!inputValue.trim()) return
    if (remainingScans <= 0) { setUpgradeOpen(true); return }
    await scan(activeTab, inputValue.trim())
    const count = await getDailyCount()
    setDailyCount(count)
    const h = await getHistory()
    setHistory(h)
  }

  const handleAskBrain = () => {
    if (!result) return
    const context = result.type === 'password'
      ? `I just ran a breach check on a password. It has appeared ${(result as { occurrences?: number }).occurrences || 0} times in known data breaches. Severity: ${result.severity}. Please advise me on next steps.`
      : result.type === 'email'
      ? `I ran a breach check on an email. It appeared in ${(result as { breach_count?: number }).breach_count || 0} data breaches. Severity: ${result.severity}. Please help me understand the risk and what I should do.`
      : `I checked a phone number for breaches and found: ${result.message} Severity: ${result.severity}. What should I do?`
    navigate('/brain', { state: { prefillMessage: context } })
  }

  const activeTabDef = SCAN_TABS.find((t) => t.type === activeTab)!

  return (
    <Layout profile={profile} onSignOut={signOut} title="BREACH DETECTION">

      {/* Top fade: black → brown */}
      <div style={{ position: 'sticky', top: 0, height: 0, zIndex: 5, pointerEvents: 'none' }}>
        <div style={{ height: 80, background: 'linear-gradient(to bottom, #000000, transparent)', marginTop: -80 }} />
      </div>

      <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)' }}>

        {/* Background: black → brown → black */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #000000 0%, #0d0500 12%, #1a0900 30%, #1f0b00 50%, #1a0900 70%, #0d0500 88%, #000000 100%)',
        }} />

        {/* Brown radial glow at center */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
          width: '60%', height: 400, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(139,69,19,0.15) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(32px, 5vw, 56px) clamp(20px, 5vw, 48px) 80px', maxWidth: 860, margin: '0 auto' }}>

          {/* Module label */}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.25em', color: BROWN.textDim, marginBottom: 16, textTransform: 'uppercase' }}>
            04 — BREACH DETECTION
          </p>

          {/* Hero headline */}
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(52px, 10vw, 96px)', letterSpacing: '0.06em', color: '#F5F0EB', lineHeight: 0.92, marginBottom: 20 }}>
            BREACH<br />DETECTION
          </h1>

          <p style={{ fontFamily: 'Syne', fontSize: 16, color: BROWN.text, lineHeight: 1.65, maxWidth: 540, marginBottom: 12, opacity: 0.85 }}>
            Scan any email address, password, or phone number against known data breach databases. D0B3RMAN checks against HaveIBeenPwned, credential leak databases, and more.
          </p>

          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: BROWN.textDim, letterSpacing: '0.12em', marginBottom: 48 }}>
            HaveIBeenPwned · Breach Databases · Credential Exposure
          </p>

          {/* Scan count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 8,
              background: remainingScans > 0 ? 'rgba(139,69,19,0.12)' : 'rgba(255,45,45,0.07)',
              border: `1px solid ${remainingScans > 0 ? BROWN.border : 'rgba(255,45,45,0.2)'}`,
              fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
              color: remainingScans > 0 ? BROWN.bright : '#FF2D2D',
            }}>
              {remainingScans} / 3 SCANS TODAY
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(139,69,19,0.4), transparent)' }} />
          </div>

          {/* ── Scan type tabs ── */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: `1px solid ${BROWN.border}` }}>
            {SCAN_TABS.map(({ type, label, icon: Icon }) => {
              const active = activeTab === type
              return (
                <button
                  key={type}
                  onClick={() => { setActiveTab(type); setInputValue('') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 20px',
                    background: 'none', border: 'none',
                    borderBottom: active ? `2px solid ${BROWN.bright}` : '2px solid transparent',
                    marginBottom: -1,
                    fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.12em',
                    color: active ? BROWN.bright : BROWN.textDim,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Hint */}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: BROWN.textDim, letterSpacing: '0.1em', marginBottom: 20 }}>
            {activeTabDef.hint}
          </p>

          {/* ── Input row ── */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 40 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <activeTabDef.icon
                size={15}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: BROWN.textDim, pointerEvents: 'none' }}
              />
              <input
                ref={inputRef}
                type={activeTab === 'password' ? 'password' : activeTab === 'email' ? 'email' : 'tel'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleScan() }}
                placeholder={activeTabDef.placeholder}
                style={{
                  width: '100%', padding: '14px 16px 14px 40px',
                  background: 'rgba(139,69,19,0.06)',
                  border: `1px solid ${BROWN.border}`,
                  borderRadius: 10,
                  color: '#F5F0EB', fontFamily: 'JetBrains Mono', fontSize: 14,
                  outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = BROWN.bright; e.currentTarget.style.background = 'rgba(139,69,19,0.10)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = BROWN.border; e.currentTarget.style.background = 'rgba(139,69,19,0.06)' }}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !inputValue.trim()}
              style={{
                padding: '14px 28px',
                background: scanning || !inputValue.trim() ? 'rgba(139,69,19,0.15)' : `linear-gradient(135deg, ${BROWN.accent}, #A0522D)`,
                border: `1px solid ${BROWN.border}`,
                borderRadius: 10,
                color: scanning || !inputValue.trim() ? BROWN.textDim : '#F5F0EB',
                fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.1em',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              }}
            >
              {scanning ? (
                <>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${BROWN.textDim}`, borderTopColor: BROWN.bright, animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  SCANNING
                </>
              ) : (
                <>
                  <Shield size={14} />
                  SCAN
                </>
              )}
            </button>
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ marginBottom: 32, padding: '14px 18px', background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: 10 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#FF2D2D' }}>{error}</p>
            </div>
          )}

          {/* ── Results ── */}
          {result && (
            <div style={{ marginBottom: 48 }}>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${BROWN.border}, transparent)` }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: BROWN.textDim }}>SCAN RESULT</span>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${BROWN.border}, transparent)` }} />
              </div>

              {/* Status icon + severity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                {result.breached ? (
                  <AlertTriangle size={28} style={{ color: result.severity === 'critical' ? '#FF2D2D' : '#FF9500', flexShrink: 0 }} />
                ) : (
                  <CheckCircle size={28} style={{ color: '#30D158', flexShrink: 0 }} />
                )}
                <div>
                  <SeverityBadge severity={result.severity} />
                </div>
              </div>

              {/* Main message */}
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: '#F5F0EB', lineHeight: 1.4, marginBottom: 28 }}>
                {result.message}
              </p>

              {/* Email-specific: breach list */}
              {result.type === 'email' && (result.breach_count ?? 0) > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: BROWN.textDim, marginBottom: 16 }}>
                    BREACHES FOUND ({result.breach_count})
                  </p>
                  {result.breaches?.map((breach: { name: string; domain: string; breach_date?: string; data_classes?: string[]; description?: string }, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 0',
                        borderBottom: `1px solid rgba(139,69,19,0.2)`,
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,69,19,0.15)', border: `1px solid ${BROWN.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: BROWN.bright, fontWeight: 700 }}>
                          {breach.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#F5F0EB', marginBottom: 4 }}>{breach.name}</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: BROWN.textDim, marginBottom: breach.data_classes?.length ? 8 : 0 }}>
                          {breach.domain} {breach.breach_date ? `· ${breach.breach_date}` : ''}
                        </p>
                        {breach.data_classes && breach.data_classes.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {breach.data_classes.map((dc: string) => (
                              <span key={dc} style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: BROWN.bright, background: 'rgba(139,69,19,0.15)', border: `1px solid rgba(139,69,19,0.25)`, padding: '2px 8px', borderRadius: 4 }}>{dc}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Password: count bar */}
              {result.type === 'password' && result.breached && (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: BROWN.textDim, marginBottom: 12 }}>
                    TIMES SEEN IN BREACH DATA
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: '0.06em', color: result.severity === 'critical' ? '#FF2D2D' : '#FF9500', lineHeight: 1 }}>
                      {(result.occurrences as number).toLocaleString()}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: BROWN.textDim }}>exposures in known breach databases</span>
                  </div>
                </div>
              )}

              {/* Phone: sources */}
              {result.type === 'phone' && result.sources && (result.sources as string[]).length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: BROWN.textDim, marginBottom: 16 }}>
                    FOUND IN SOURCES
                  </p>
                  {(result.sources as string[]).map((src: string, idx: number) => (
                    <div key={idx} style={{ padding: '12px 0', borderBottom: `1px solid rgba(139,69,19,0.2)`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AlertTriangle size={14} style={{ color: '#FF9500', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Syne', fontSize: 14, color: '#F5F0EB' }}>{src}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && (result.recommendations as string[]).length > 0 && (
                <div style={{ marginBottom: 36 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: BROWN.textDim, marginBottom: 16 }}>
                    RECOMMENDED ACTIONS
                  </p>
                  {(result.recommendations as string[]).map((rec: string, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                      <ChevronRight size={14} style={{ color: BROWN.bright, marginTop: 2, flexShrink: 0 }} />
                      <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'rgba(245,240,235,0.75)', lineHeight: 1.55 }}>{rec}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Ask DOBERMAN Intelligence button */}
              <div style={{ paddingTop: 24, borderTop: `1px solid rgba(139,69,19,0.25)` }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: BROWN.textDim, marginBottom: 14 }}>
                  WANT EXPERT ANALYSIS?
                </p>
                <button
                  onClick={handleAskBrain}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    padding: '13px 24px',
                    background: 'rgba(139,69,19,0.12)',
                    border: `1px solid ${BROWN.border}`,
                    borderRadius: 10,
                    color: BROWN.bright,
                    fontFamily: 'JetBrains Mono', fontSize: 12, letterSpacing: '0.08em',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,69,19,0.22)'; e.currentTarget.style.borderColor = BROWN.bright }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,69,19,0.12)'; e.currentTarget.style.borderColor = BROWN.border }}
                >
                  <Brain size={15} />
                  Ask DOBERMAN Intelligence
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ── Scan History ── */}
          {historyLoaded && history.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${BROWN.border}, transparent)` }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: BROWN.textDim }}>SCAN HISTORY</span>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${BROWN.border}, transparent)` }} />
              </div>

              {history.map((item, i) => {
                const icons = { email: Mail, password: Lock, phone: Phone }
                const Icon = icons[item.scan_type as keyof typeof icons] || Shield
                const rel = formatRelative(item.created_at)
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 0',
                      borderBottom: i < history.length - 1 ? `1px solid rgba(139,69,19,0.15)` : 'none',
                    }}
                  >
                    <Icon size={13} style={{ color: BROWN.textDim, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: BROWN.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.scan_type.toUpperCase()}: {item.query}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <Clock size={10} style={{ color: BROWN.textDim }} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: BROWN.textDim }}>{rel}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
