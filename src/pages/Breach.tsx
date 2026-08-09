import { useEffect, useMemo, useState } from 'react'
import { Shield, Mail, Lock, Phone, AlertTriangle, CheckCircle, ChevronRight, Brain, Clock, BadgeCheck, BadgeAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useBreach } from '../hooks/useBreach'
import { UpgradeModal } from '../components/ui/Modal'
import { dayeNotify, dayeAskAbout } from '../components/daye/DayeAssistant'

/* Coffee-brown identity — dedicated to this module, not the neutral chrome
   palette used everywhere else. Values come from CSS vars in index.css so
   dark mode reads as a true deep espresso (not near-black) and light mode
   reads as a warm latte/cream (not plain white). */
const B = {
  void: 'var(--breach-void)',
  voidMid: 'var(--breach-void-mid)',
  surface: 'var(--breach-surface)',
  accent: 'var(--breach-accent)',
  bright: 'var(--breach-bright)',
  heading: 'var(--breach-heading)',
  text: 'var(--breach-text)',
  dim: 'var(--breach-dim)',
  border: 'var(--breach-border)',
  glow: 'var(--breach-glow)',
  safe: 'var(--breach-safe)',
  warn: 'var(--breach-warn)',
  critical: 'var(--breach-critical)',
  muted: 'var(--breach-muted)',
}

function mix(color: string, pct: number) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`
}

type ScanType = 'email' | 'password' | 'phone'

const TABS: { type: ScanType; label: string; icon: typeof Mail; placeholder: string; hint: string }[] = [
  { type: 'email', label: 'EMAIL ADDRESS', icon: Mail, placeholder: 'user@example.com', hint: 'Check if your email has appeared in known data breaches' },
  { type: 'password', label: 'PASSWORD', icon: Lock, placeholder: '••••••••••••', hint: 'K-anonymity lookup — your full password never leaves your device' },
  { type: 'phone', label: 'PHONE NUMBER', icon: Phone, placeholder: '+1 555 000 0000', hint: 'Check if your phone number appears in breach databases' },
]

function Pill({ severity }: { severity: string }) {
  const cfg: Record<string, { label: string; color: string }> = {
    none: { label: 'NO BREACH', color: B.safe },
    low: { label: 'LOW RISK', color: B.warn },
    medium: { label: 'MEDIUM RISK', color: B.warn },
    critical: { label: 'CRITICAL', color: B.critical },
    unavailable: { label: 'CHECK UNAVAILABLE', color: B.muted },
  }
  const { label, color } = cfg[severity] ?? cfg.none
  return (
    <span style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.18em',
      color, background: mix(color, 16), border: `1px solid ${mix(color, 40)}`,
      padding: '5px 12px', borderRadius: 3, textTransform: 'uppercase',
    }}>
      {label}
    </span>
  )
}

/* Severity meter for the password check — where the occurrence count
   lands on the none → low → medium → critical scale, log-compressed so
   a handful of exposures and a million both read sensibly. */
function OccurrenceMeter({ occurrences, severity }: { occurrences: number; severity: string }) {
  const pct = occurrences === 0 ? 0 : Math.min(100, (Math.log10(occurrences + 1) / Math.log10(2_000_000)) * 100)
  const color = severity === 'critical' ? B.critical : severity === 'medium' ? B.warn : severity === 'low' ? B.warn : B.safe
  const bands = [
    { label: 'NONE', threshold: 0 },
    { label: 'LOW < 10', threshold: 10 },
    { label: 'MEDIUM < 1K', threshold: 1000 },
    { label: 'CRITICAL 1K+', threshold: 1000 },
  ]
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ height: 8, borderRadius: 4, background: mix(B.accent, 12), overflow: 'hidden', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 4, background: color, boxShadow: `0 0 10px ${mix(color, 55)}` }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {bands.map((b) => (
          <span key={b.label} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 8, letterSpacing: '0.08em', color: B.dim }}>{b.label}</span>
        ))}
      </div>
    </div>
  )
}

export default function Breach() {
  const { user, profile, signOut } = useAuth()
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
    dayeAskAbout({
      context_type: 'breach_result',
      data: {
        check_type: result.type,
        breach_count: result.breach_count ?? result.occurrences ?? (result.sources as string[] | undefined)?.length ?? 0,
        risk_level: result.severity,
      },
    })
  }

  const tab = TABS.find((t) => t.type === activeTab)!

  /* More analysis: aggregate exactly what data types are exposed across
     every breach found, and how many are independently verified — the
     single most actionable summary a user can act on at a glance. */
  const exposureSummary = useMemo(() => {
    if (!result?.breaches?.length) return null
    const counts = new Map<string, number>()
    let verifiedCount = 0
    let mostRecent: string | null = null
    for (const b of result.breaches) {
      verifiedCount += b.is_verified ? 1 : 0
      for (const dc of b.data_classes ?? []) counts.set(dc, (counts.get(dc) ?? 0) + 1)
      if (b.breach_date && (!mostRecent || b.breach_date > mostRecent)) mostRecent = b.breach_date
    }
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
    return { sorted, verifiedCount, total: result.breaches.length, mostRecent }
  }, [result])

  return (
    <Layout profile={profile} onSignOut={signOut} title="BREACH DETECTION">

      {/* Full-page coffee-brown gradient — fades in from deep espresso, fades back out */}
      <div style={{ position: 'relative', minHeight: 'calc(100vh - 56px)', overflow: 'hidden', background: B.void }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `linear-gradient(to bottom, ${B.void} 0%, ${B.voidMid} 26%, ${B.voidMid} 74%, ${B.void} 100%)`,
        }} />
        {/* Ambient warm radial */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '50%', zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse at center top, ${B.glow} 0%, transparent 65%)`,
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,56px) 96px', maxWidth: 800, margin: '0 auto' }}>

          {/* Kicker */}
          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 600, fontSize: 10, letterSpacing: '0.32em', color: B.dim, marginBottom: 20, textTransform: 'uppercase' }}>
            MODULE 04 · BREACH DETECTION
          </p>

          {/* Hero title */}
          <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 800, fontSize: 'clamp(48px,10vw,100px)', letterSpacing: '-0.01em', lineHeight: 0.9, color: B.heading, marginBottom: 24 }}>
            BREACH<br /><span style={{ color: B.bright }}>SCAN</span>
          </h1>

          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 400, fontSize: 16, color: B.text, lineHeight: 1.7, maxWidth: 500, marginBottom: 10 }}>
            Scan any email, password, or phone number against HaveIBeenPwned and credential leak databases.
          </p>

          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 500, fontSize: 11, letterSpacing: '0.1em', color: B.dim, marginBottom: 52 }}>
            HAVEIBEENPWNED · BREACH DATABASES · CREDENTIAL EXPOSURE
          </p>

          {/* Quota bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <span style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em',
              color: remaining > 0 ? B.bright : B.critical,
              background: remaining > 0 ? mix(B.accent, 12) : mix(B.critical, 10),
              border: `1px solid ${remaining > 0 ? B.border : mix(B.critical, 30)}`,
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
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: active ? 700 : 500,
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
          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 500, fontSize: 13, color: B.dim, marginBottom: 18, letterSpacing: '0.02em' }}>
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
                  background: mix(B.accent, 5),
                  border: `1px solid ${B.border}`,
                  borderRadius: 8,
                  color: B.heading, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 500, fontSize: 15,
                  outline: 'none', transition: 'border-color 0.15s, background 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = B.bright; e.currentTarget.style.background = mix(B.accent, 10) }}
                onBlur={(e) => { e.currentTarget.style.borderColor = B.border; e.currentTarget.style.background = mix(B.accent, 5) }}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !inputValue.trim()}
              style={{
                padding: '13px 26px', flexShrink: 0,
                background: scanning || !inputValue.trim() ? mix(B.accent, 10) : `linear-gradient(135deg, ${B.accent} 0%, color-mix(in srgb, ${B.accent} 70%, black) 100%)`,
                border: `1px solid ${B.border}`,
                borderRadius: 8,
                color: scanning || !inputValue.trim() ? B.dim : '#F5F0EB',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.14em',
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
                style={{ marginBottom: 32, padding: '13px 18px', background: mix(B.critical, 8), border: `1px solid ${mix(B.critical, 22)}`, borderRadius: 8 }}
              >
                <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: B.critical }}>{error}</p>
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
                  <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 600, fontSize: 9, letterSpacing: '0.28em', color: B.dim }}>SCAN RESULT</span>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${B.border}, transparent)` }} />
                </div>

                {/* Status row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  {result.unavailable
                    ? <Shield size={26} style={{ color: B.muted, flexShrink: 0 }} />
                    : result.breached
                    ? <AlertTriangle size={26} style={{ color: result.severity === 'critical' ? B.critical : B.warn, flexShrink: 0 }} />
                    : <CheckCircle size={26} style={{ color: B.safe, flexShrink: 0 }} />
                  }
                  <Pill severity={result.severity} />
                </div>

                {/* Main message */}
                <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 20, color: B.heading, lineHeight: 1.4, marginBottom: 32 }}>
                  {result.message}
                </p>

                {/* Email — aggregate exposure summary (more analysis) */}
                {result.type === 'email' && exposureSummary && (
                  <div style={{ marginBottom: 32, padding: '18px 20px', background: mix(B.accent, 6), border: `1px solid ${B.border}`, borderRadius: 12 }}>
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 14 }}>WHAT'S EXPOSED — ACROSS ALL BREACHES</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: exposureSummary.sorted.length ? 14 : 0 }}>
                      {exposureSummary.sorted.map(([dc, count]) => (
                        <span key={dc} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 10, fontWeight: 600, color: B.bright, background: mix(B.accent, 14), border: `1px solid ${mix(B.accent, 24)}`, padding: '4px 10px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {dc}
                          {count > 1 && <span style={{ color: B.dim }}>×{count}</span>}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 12, color: B.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BadgeCheck size={13} style={{ color: B.safe }} /> {exposureSummary.verifiedCount} of {exposureSummary.total} verified
                      </span>
                      {exposureSummary.mostRecent && (
                        <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 12, color: B.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} style={{ color: B.dim }} /> Most recent: {exposureSummary.mostRecent}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Email — breach list */}
                {result.type === 'email' && (result.breach_count ?? 0) > 0 && (
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 18 }}>
                      BREACHES FOUND ({result.breach_count})
                    </p>
                    {result.breaches?.map((breach, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0', borderBottom: `1px solid ${mix(B.accent, 16)}` }}>
                        <div style={{ width: 34, height: 34, borderRadius: 6, background: mix(B.accent, 14), border: `1px solid ${B.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 800, fontSize: 11, color: B.bright }}>{breach.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 15, color: B.heading }}>{breach.name}</p>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
                              color: breach.is_verified ? B.safe : B.dim,
                              background: mix(breach.is_verified ? B.safe : B.dim, 12),
                              padding: '2px 7px', borderRadius: 3,
                            }}>
                              {breach.is_verified ? <BadgeCheck size={9} /> : <BadgeAlert size={9} />}
                              {breach.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
                            </span>
                          </div>
                          <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 400, fontSize: 11, color: B.dim, marginBottom: 8 }}>
                            {breach.domain}{breach.breach_date ? ` · ${breach.breach_date}` : ''}
                          </p>
                          {breach.description && (
                            <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 400, fontSize: 12.5, color: B.text, lineHeight: 1.6, marginBottom: breach.data_classes?.length ? 10 : 0 }}>
                              {stripHtml(breach.description)}
                            </p>
                          )}
                          {!!breach.data_classes?.length && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {breach.data_classes.map((dc) => (
                                <span key={dc} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 10, color: B.bright, background: mix(B.accent, 14), border: `1px solid ${mix(B.accent, 24)}`, padding: '2px 8px', borderRadius: 3 }}>{dc}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Password — exposure count + severity meter (more analysis) */}
                {result.type === 'password' && result.breached && (
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 14 }}>TIMES SEEN IN BREACH DATA</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                      <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 800, fontSize: 54, lineHeight: 1, color: result.severity === 'critical' ? B.critical : B.warn }}>
                        {((result.occurrences as number) || 0).toLocaleString()}
                      </span>
                      <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 13, color: B.dim }}>exposures in known databases</span>
                    </div>
                    <OccurrenceMeter occurrences={(result.occurrences as number) || 0} severity={result.severity} />
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 12.5, color: B.text, lineHeight: 1.6, marginTop: 16 }}>
                      {result.severity === 'critical'
                        ? 'This password is in wide circulation across credential-stuffing lists — attackers try it automatically against thousands of accounts. Treat every account that used it as compromised.'
                        : result.severity === 'medium'
                        ? 'This password has leaked enough times that automated attacks will eventually try it. Retire it from any account still using it.'
                        : 'This password has appeared in at least one known breach dump. It is no longer safe to reuse, even if the exposure count is low.'}
                    </p>
                  </div>
                )}

                {/* Phone — sources */}
                {result.type === 'phone' && (result.sources as string[] | undefined)?.length ? (
                  <div style={{ marginBottom: 36 }}>
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 16 }}>FOUND IN SOURCES</p>
                    {(result.sources as string[]).map((src, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${mix(B.accent, 16)}` }}>
                        <AlertTriangle size={13} style={{ color: B.warn, flexShrink: 0 }} />
                        <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 400, fontSize: 14, color: B.heading }}>{src}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Recommendations */}
                {(result.recommendations as string[]).length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 9, letterSpacing: '0.26em', color: B.dim, marginBottom: 16 }}>RECOMMENDED ACTIONS</p>
                    {(result.recommendations as string[]).map((rec, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                        <ChevronRight size={13} style={{ color: B.bright, marginTop: 3, flexShrink: 0 }} />
                        <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 400, fontSize: 14, color: B.text, lineHeight: 1.6 }}>{rec}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ask DOBERMAN */}
                <div style={{ paddingTop: 28, borderTop: `1px solid ${mix(B.accent, 22)}` }}>
                  <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 600, fontSize: 9, letterSpacing: '0.24em', color: B.dim, marginBottom: 14 }}>WANT EXPERT ANALYSIS?</p>
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
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = mix(B.accent, 16); (e.currentTarget as HTMLButtonElement).style.borderColor = B.bright }}
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
                  <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 600, fontSize: 9, letterSpacing: '0.28em', color: B.dim }}>SCAN HISTORY</span>
                  <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, ${B.border}, transparent)` }} />
                </div>
                {history.map((item, i) => {
                  const icons = { email: Mail, password: Lock, phone: Phone }
                  const Icon = icons[item.scan_type as keyof typeof icons] || Shield
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < history.length - 1 ? `1px solid ${mix(B.accent, 10)}` : 'none' }}>
                      <Icon size={12} style={{ color: B.dim, flexShrink: 0 }} />
                      <p style={{ flex: 1, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 500, fontSize: 12, color: B.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.scan_type.toUpperCase()}: {item.query}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        <Clock size={10} style={{ color: B.dim }} />
                        <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 500, fontSize: 10, color: B.dim }}>{fmtRel(item.created_at)}</span>
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

/* HIBP breach descriptions are HTML strings (mostly a paragraph with an
   <a> link) — strip tags rather than render them, so third-party content
   is never injected into the DOM as markup. */
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function fmtRel(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
