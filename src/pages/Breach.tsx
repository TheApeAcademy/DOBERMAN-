import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Phone, AlertTriangle, CheckCircle, ChevronRight, Brain, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useBreach } from '../hooks/useBreach'
import { UpgradeModal } from '../components/ui/Modal'
import { dayeNotify } from '../components/daye/DayeAssistant'

const B = {
  dark: '#0d0500',
  mid: '#1a0900',
  accent: '#8B4513',
  bright: '#CD853F',
  border: 'rgba(139,69,19,0.3)',
  text: '#DEB887',
  dim: '#A0522D',
}

type ScanType = 'email' | 'password' | 'phone'

const TABS: { type: ScanType; label: string; icon: typeof Mail; placeholder: string; hint: string }[] = [
  { type: 'email', label: 'EMAIL ADDRESS', icon: Mail, placeholder: 'user@example.com', hint: 'Check if your email has appeared in known data breaches' },
  { type: 'password', label: 'PASSWORD', icon: Lock, placeholder: '••••••••••••', hint: 'K-anonymity lookup — your full password never leaves your device' },
  { type: 'phone', label: 'PHONE NUMBER', icon: Phone, placeholder: '+1 555 000 0000', hint: 'Check if your phone number appears in breach databases' },
]

function Pill({ severity }: { severity: string }) {
  const cfg: Record<string, { label: string; color: string }> = {
    none: { label: 'NO BREACH', color: '#30D158' },
    low: { label: 'LOW RISK', color: '#FF9F0A' },
    medium: { label: 'MEDIUM RISK', color: '#FF9F0A' },
    critical: { label: 'CRITICAL', color: '#FF453A' },
  }
  const { label, color } = cfg[severity] ?? cfg.none
  return (
    <span style={{
      fontFamily: 'Oxanium', fontWeight: 700, fontSize: 10, letterSpacing: '0.18em',
      color, background: `${color}18`, border: `1px solid ${color}44`,
      padding: '5px 12px', borderRadius: 3, textTransform: 'uppercase',
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

  useEffect(() => {
    if (user) {
      getDailyCount().then(setDailyCount)
      getHistory().then((h) => { setHistory(h); setHistoryLoaded(true) })
    }
  }, [user])

  const remaining = Math.max(0, 3 - dailyCount)

  const handleScan = async () => {
    if (!inputValue.trim()) return
    if (remaining <= 0) { setUpgradeOpen(true); return }
    await scan(activeTab, inputValue.trim())
    const count = await getDailyCount()
    setDailyCount(count)
    const h = await getHistory()
    setHistory(h)
  }

  useEffect(() => {
    if (result) {
      dayeNotify({ context_type: 'breach_result', data: result })
    }
  }, [result])

  const handleAskBrain = () => {
    if (!result) return
    const ctx = result.type === 'password'
      ? `I ran a breach check on a password — it appeared ${(result.occurrences as number | undefined) ?? 0} times in known databases. Severity: ${result.severity}. What steps should I take?`
      : result.type === 'email'
      ? `I ran a breach check on an email and found it in ${(result.breach_count as number | undefined) ?? 0} breaches. Severity: ${result.severity}. Help me understand the risk and next steps.`
      : `I checked a phone number for breaches: ${result.message} Severity: ${result.severity}. What should I do?`
    navigate('/daye', { state: { prefillMessage: ctx } })
  }

  const tab = TABS.find((t) => t.type === activeTab)!

  return (
    <Layout profile={profile} onSignOut={signOut} title="BREACH DETECTION">

      {/* Full-page brown gradient — fades in from black, fades out to black */}
      <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #000000 0%, #0c0400 10%, #1a0900 28%, #210b00 50%, #1a0900 72%, #0c0400 90%, #000000 100%)',
        }} />
        {/* Ambient warm radial */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '50%', zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center top, rgba(139,69,19,0.18) 0%, transparent 65%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,56px) 96px', maxWidth: 800, margin: '0 auto' }}>

          {/* Kicker */}
          <p style={{ fontFamily: 'Oxanium', fontWeight: 500, fontSize: 10, letterSpacing: '0.32em', color: B.dim, marginBottom: 20, textTransform: 'uppercase' }}>
            MODULE 04 · BREACH DETECTION
          </p>

          {/* Hero title */}
          <h1 style={{ fontFamily: 'Oxanium', fontWeight: 800, fontSize: 'clamp(48px,10vw,100px)', letterSpacing: '-0.01em', lineHeight: 0.9, color: B.text, marginBottom: 24 }}>
            BREACH<br /><span style={{ color: B.bright }}>SCAN</span>
          </h1>

          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 300, fontSize: 16, color: `${B.text}99`, lineHeight: 1.7, maxWidth: 500, marginBottom: 10 }}>
            Scan any email, password, or phone number against HaveIBeenPwned and credential leak databases.
          </p>

          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 11, letterSpacing: '0.1em', color: B.dim, marginBottom: 52 }}>
            HAVEIBEENPWNED · BREACH DATABASES · CREDENTIAL EXPOSURE
          </p>

          {/* Quota bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: 'Oxanium', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em',
              color: remaining > 0 ? B.bright : '#FF453A',
              background: remaining > 0 ? 'rgba(139,69,19,0.12)' : 'rgba(255,69,58,0.08)',
              border: `1px solid ${remaining > 0 ? B.border : 'rgba(255,69,58,0.22)'}`,
              padding: '5px 14px', borderRadius: 4,
            }}>
              {remaining} / 3 SCANS TODAY
            </span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${B.border}, transparent)` }} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: `1px solid ${B.border}` }}>
            {TABS.map(({ type, label, icon: Icon }) => {
              const active = activeTab === type
              return (
                <button
                  key={type}
                  onClick={() => { setActiveTab(type); setInputValue('') }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '11px 18px',
                    background: 'none', border: 'none',
                    borderBottom: active ? `2px solid ${B.bright}` : '2px solid transparent',
                    marginBottom: -1,
                    fontFamily: 'Oxanium', fontWeight: active ? 600 : 400,
                    fontSize: 11, letterSpacing: '0.14em',
                    color: active ? B.bright : B.dim,
                    cursor: 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Hint */}
          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 13, color: B.dim, marginBottom: 18, letterSpacing: '0.02em' }}>
            {tab.hint}
          </p>

          {/* Input */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 48 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <tab.icon size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: B.dim, pointerEvents: 'none' }} />
              <input
                type={activeTab === 'password' ? 'password' : activeTab === 'email' ? 'email' : 'tel'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleScan() }}
                placeholder={tab.placeholder}
                style={{
                  width: '100%', padding: '13px 16px 13px 40px',
                  background: 'rgba(139,69,19,0.05)',
                  border: `1px solid ${B.border}`,
                  borderRadius: 8,
                  color: B.text, fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 15,
                  outline: 'none', transition: 'border-color 0.15s, background 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = B.bright; e.currentTarget.style.background = 'rgba(139,69,19,0.10)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.background = 'rgba(139,69,19,0.05)' }}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !inputValue.trim()}
              style={{
                padding: '13px 26px', flexShrink: 0,
                background: scanning || !inputValue.trim() ? 'rgba(139,69,19,0.1)' : `linear-gradient(135deg, ${B.accent} 0%, #7a3b10 100%)`,
                border: `1px solid ${B.border}`,
                borderRadius: 8,
                color: scanning || !inputValue.trim() ? B.dim : '#F5F0EB',
                fontFamily: 'Oxanium', fontWeight: 700, fontSize: 12, letterSpacing: '0.14em',
                cursor: scanning || !inputValue.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {scanning ? (
                <>
                  <div style={{ width: 13, height: 13, borderRadius: '50%', border: `1.5px solid ${B.dim}`, borderTopColor: B.bright, animation: 'spin 0.7s linear infinite' }} />
                  SCANNING
                </>
              ) : (
                <>
                  <Shield size={13} />
                  SCAN
                </>
              )}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{ marginBottom: 32, padding: '13px 18px', background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 8 }}
              >
                <p style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: '#FF453A' }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results — fade in / fade out */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={`${result.type}-${result.message}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* Section separator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${B.border}, transparent)` }} />
                  <span style={{ fontFamily: 'Oxanium', fontWeight: 500, fontSize: 9, letterSpacing: '0.28em', color: B.dim }}>SCAN RESULT</span>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${B.border}, transparent)` }} />
                </div>

                {/* Status row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  {result.breached
                    ? <AlertTriangle size={26} style={{ color: result.severity === 'critical' ? '#FF453A' : '#FF9F0A', flexShrink: 0 }} />
                    : <CheckCircle size={26} style={{ color: '#30D158', flexShrink: 0 }} />
                  }
                  <Pill severity={result.severity} />
                </div>

                {/* Main message */}
                <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 20, color: '#F5F0EB', lineHeight: 1.4, marginBottom: 32 }}>
                  {result.message}
                </p>

                {/* Email — breach list */}
                {result.type === 'email' && (result.breach_count ?? 0) > 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontFamily: 'Oxanium', fontWeight: 600, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 18 }}>
                      BREACHES FOUND ({result.breach_count})
                    </p>
                    {result.breaches?.map((breach, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: `1px solid rgba(139,69,19,0.18)` }}>
                        <div style={{ width: 34, height: 34, borderRadius: 6, background: 'rgba(139,69,19,0.14)', border: `1px solid ${B.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'Oxanium', fontWeight: 800, fontSize: 11, color: B.bright }}>{breach.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 15, color: '#F5F0EB', marginBottom: 4 }}>{breach.name}</p>
                          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 11, color: B.dim, marginBottom: breach.data_classes?.length ? 8 : 0 }}>
                            {breach.domain}{breach.breach_date ? ` · ${breach.breach_date}` : ''}
                          </p>
                          {!!breach.data_classes?.length && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {breach.data_classes.map((dc) => (
                                <span key={dc} style={{ fontFamily: 'Oxanium', fontSize: 10, color: B.bright, background: 'rgba(139,69,19,0.14)', border: `1px solid rgba(139,69,19,0.24)`, padding: '2px 8px', borderRadius: 3 }}>{dc}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Password — exposure count */}
                {result.type === 'password' && result.breached && (
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontFamily: 'Oxanium', fontWeight: 600, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 14 }}>TIMES SEEN IN BREACH DATA</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                      <span style={{ fontFamily: 'Oxanium', fontWeight: 800, fontSize: 54, lineHeight: 1, color: result.severity === 'critical' ? '#FF453A' : '#FF9F0A' }}>
                        {((result.occurrences as number) || 0).toLocaleString()}
                      </span>
                      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 13, color: B.dim }}>exposures in known databases</span>
                    </div>
                  </div>
                )}

                {/* Phone — sources */}
                {result.type === 'phone' && (result.sources as string[] | undefined)?.length ? (
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontFamily: 'Oxanium', fontWeight: 600, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 16 }}>FOUND IN SOURCES</p>
                    {(result.sources as string[]).map((src, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid rgba(139,69,19,0.18)` }}>
                        <AlertTriangle size={13} style={{ color: '#FF9F0A', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 14, color: '#F5F0EB' }}>{src}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Recommendations */}
                {(result.recommendations as string[]).length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <p style={{ fontFamily: 'Oxanium', fontWeight: 600, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 16 }}>RECOMMENDED ACTIONS</p>
                    {(result.recommendations as string[]).map((rec, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                        <ChevronRight size={13} style={{ color: B.bright, marginTop: 3, flexShrink: 0 }} />
                        <p style={{ fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 14, color: `${B.text}bb`, lineHeight: 1.6 }}>{rec}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ask DOBERMAN */}
                <div style={{ paddingTop: 28, borderTop: `1px solid rgba(139,69,19,0.22)` }}>
                  <p style={{ fontFamily: 'Oxanium', fontWeight: 500, fontSize: 9, letterSpacing: '0.24em', color: B.dim, marginBottom: 14 }}>WANT EXPERT ANALYSIS?</p>
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAskBrain}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      padding: '12px 22px',
                      background: 'transparent',
                      border: `1px solid ${B.border}`,
                      borderRadius: 7,
                      color: B.bright,
                      fontFamily: 'Oxanium', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,69,19,0.16)'; (e.currentTarget as HTMLButtonElement).style.borderColor = B.bright }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = B.border }}
                  >
                    <Brain size={14} />
                    Ask DOBERMAN Intelligence
                    <ChevronRight size={12} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan history */}
          <AnimatePresence>
            {historyLoaded && history.length > 0 && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{ marginTop: result ? 56 : 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${B.border}, transparent)` }} />
                  <span style={{ fontFamily: 'Oxanium', fontWeight: 500, fontSize: 9, letterSpacing: '0.28em', color: B.dim }}>SCAN HISTORY</span>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${B.border}, transparent)` }} />
                </div>
                {history.map((item, i) => {
                  const icons = { email: Mail, password: Lock, phone: Phone }
                  const Icon = icons[item.scan_type as keyof typeof icons] || Shield
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < history.length - 1 ? `1px solid rgba(139,69,19,0.12)` : 'none' }}>
                      <Icon size={12} style={{ color: B.dim, flexShrink: 0 }} />
                      <p style={{ flex: 1, fontFamily: 'Space Grotesk', fontWeight: 400, fontSize: 12, color: B.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.scan_type.toUpperCase()}: {item.query}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        <Clock size={10} style={{ color: B.dim }} />
                        <span style={{ fontFamily: 'Oxanium', fontWeight: 400, fontSize: 10, color: B.dim }}>{fmtRel(item.created_at)}</span>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Layout>
  )
}

function fmtRel(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
