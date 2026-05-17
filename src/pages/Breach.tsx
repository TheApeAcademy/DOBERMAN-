import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Phone, Lock, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { UpgradeModal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useBreach } from '../hooks/useBreach'
import { dayeNotify } from '../components/daye/DayeAssistant'
import type { BreachCheck } from '../lib/supabase'
import { formatRelativeTime } from '../lib/utils'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: 24,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
}

const RISK_COLORS = {
  low: '#30D158',
  medium: '#FF9500',
  high: '#FF2D2D',
}

const CHECK_TYPES = [
  { id: 'email', label: 'EMAIL', icon: Mail, placeholder: 'your@email.com', description: 'Check if your email was in a known data breach' },
  { id: 'phone', label: 'PHONE', icon: Phone, placeholder: '+1 555 123 4567', description: 'Check if your phone number was exposed in leaked databases' },
  { id: 'password', label: 'PASSWORD', icon: Lock, placeholder: 'Enter password to check', description: 'Check if your password was found in breach databases (k-anonymity, never stored)' },
] as const

function BreachResult({ check }: { check: BreachCheck }) {
  const riskColor = RISK_COLORS[check.risk_level] || '#ABABAB'
  const isClean = check.breach_count === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ ...card, border: `1px solid ${riskColor}30` }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            {isClean ? (
              <CheckCircle size={20} style={{ color: '#30D158' }} />
            ) : (
              <AlertTriangle size={20} style={{ color: riskColor }} />
            )}
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.1em', color: riskColor }}>
              {isClean ? 'NO BREACHES FOUND' : `${check.breach_count} BREACH${check.breach_count !== 1 ? 'ES' : ''} FOUND`}
            </span>
          </div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>{check.query_display}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontFamily: 'Bebas Neue', fontSize: 42, letterSpacing: '0.05em', color: riskColor, lineHeight: 1 }}>{check.trust_score}</p>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>TRUST SCORE</p>
        </div>
      </div>

      {/* Risk bar */}
      <div style={{ height: 4, background: 'var(--void-4)', borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: '100%', borderRadius: 2, background: riskColor, width: `${100 - check.trust_score}%`, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${riskColor}50` }} />
      </div>

      {/* Risk level badge */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ padding: '5px 12px', borderRadius: 8, background: `${riskColor}15`, border: `1px solid ${riskColor}30`, fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: riskColor }}>
          {check.risk_level.toUpperCase()} RISK
        </div>
        <div style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)' }}>
          {check.check_type.toUpperCase()} CHECK
        </div>
      </div>

      {/* Breaches list */}
      {check.breaches && check.breaches.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 12 }}>BREACH SOURCES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {check.breaches.map((breach, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,45,45,0.04)', border: '1px solid rgba(255,45,45,0.12)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{breach.name}</span>
                  {breach.date && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>{breach.date}</span>
                  )}
                </div>
                {breach.data_types && breach.data_types.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {breach.data_types.map((dt) => (
                      <span key={dt} style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--warning)', background: 'rgba(255,149,0,0.08)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(255,149,0,0.18)' }}>{dt}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DAYE Analysis */}
      {check.daye_analysis && (
        <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>DAYE SECURITY ADVISORY</p>
          <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{check.daye_analysis}</p>
        </div>
      )}
    </motion.div>
  )
}

function HistoryItem({ check, onSelect }: { check: BreachCheck; onSelect: () => void }) {
  const riskColor = RISK_COLORS[check.risk_level] || '#ABABAB'
  const TypeIcon = check.check_type === 'email' ? Mail : check.check_type === 'phone' ? Phone : Lock

  return (
    <button
      onClick={onSelect}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${riskColor}12`, border: `1px solid ${riskColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <TypeIcon size={14} style={{ color: riskColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{check.query_display}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={10} style={{ color: 'var(--text-3)' }} />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>{formatRelativeTime(check.created_at)}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: riskColor }}>{check.breach_count}</p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.1em' }}>BREACHES</p>
      </div>
    </button>
  )
}

export default function BreachPage() {
  const { user, profile, signOut } = useAuth()
  const { checking, result, error, check, getHistory, getDailyCount, setResult } = useBreach(user?.id)

  const [activeType, setActiveType] = useState<'email' | 'phone' | 'password'>('email')
  const [inputValue, setInputValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [dailyCount, setDailyCount] = useState(0)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [history, setHistory] = useState<BreachCheck[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  useEffect(() => {
    if (user) {
      getDailyCount().then(setDailyCount)
    }
  }, [user])

  useEffect(() => {
    if (user && !historyLoaded) {
      getHistory().then((data) => {
        setHistory(data)
        setHistoryLoaded(true)
      })
    }
  }, [user, historyLoaded])

  useEffect(() => {
    setInputValue('')
  }, [activeType])

  useEffect(() => {
    if (result) {
      dayeNotify({
        context_type: 'breach_result',
        data: {
          check_type: result.check_type,
          breach_count: result.breach_count,
          risk_level: result.risk_level,
        },
        message: result.daye_analysis,
      })
      setHistoryLoaded(false)
    }
  }, [result])

  const handleCheck = async () => {
    if (!inputValue.trim() || !user) return
    if (dailyCount >= 5) { setUpgradeOpen(true); return }
    await check(activeType, inputValue.trim())
    const count = await getDailyCount()
    setDailyCount(count)
  }

  const remaining = Math.max(0, 5 - dailyCount)
  const currentType = CHECK_TYPES.find((t) => t.id === activeType)!
  const CurrentIcon = currentType.icon

  return (
    <Layout profile={profile} onSignOut={signOut} title="BREACH SYSTEM">
      <div style={{ padding: '28px 28px 48px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
            <Database size={24} style={{ color: '#FF2D2D' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: '0.1em', color: 'var(--text-1)', lineHeight: 1 }}>BREACH SYSTEM</h1>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', marginTop: 3 }}>CREDENTIAL EXPOSURE INTELLIGENCE</p>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            background: remaining > 0 ? 'rgba(48,209,88,0.07)' : 'rgba(255,45,45,0.07)',
            border: `1px solid ${remaining > 0 ? 'rgba(48,209,88,0.2)' : 'rgba(255,45,45,0.2)'}`,
            fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em',
            color: remaining > 0 ? 'var(--safe)' : 'var(--danger)',
          }}>
            {remaining} / 5 CHECKS TODAY
          </div>
        </div>

        {/* DAYE briefing */}
        <div style={{ padding: '14px 18px', background: 'rgba(255,45,45,0.04)', border: '1px solid rgba(255,45,45,0.12)', borderRadius: 14, marginBottom: 28 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--danger)', letterSpacing: '0.12em', marginBottom: 4 }}>DAYE SYSTEM</p>
          <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
            The Breach System checks your credentials against known data breach databases. DAYE interprets every result and provides a personal security advisory. Password checks use k-anonymity - your full password is never transmitted.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Input panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Type selector */}
            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 16, textTransform: 'uppercase' }}>Check Type</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CHECK_TYPES.map(({ id, label, icon: Icon, description }) => (
                  <button
                    key={id}
                    onClick={() => setActiveType(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '12px 14px',
                      background: activeType === id ? 'rgba(255,255,255,0.06)' : 'transparent',
                      border: `1px solid ${activeType === id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} style={{ color: activeType === id ? 'var(--text-1)' : 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.08em', color: activeType === id ? 'var(--text-1)' : 'var(--text-2)', marginBottom: 3 }}>{label}</p>
                      <p style={{ fontFamily: 'Syne', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{description}</p>
                    </div>
                    {activeType === id && (
                      <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--text-1)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div style={card}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', marginBottom: 14, textTransform: 'uppercase' }}>
                Enter {currentType.label}
              </p>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <CurrentIcon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type={activeType === 'password' && !showPassword ? 'password' : 'text'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                  placeholder={currentType.placeholder}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    padding: '11px 40px 11px 36px',
                    fontFamily: activeType === 'password' ? 'JetBrains Mono' : 'Syne',
                    fontSize: 13,
                    color: 'var(--text-1)',
                    outline: 'none',
                  }}
                />
                {activeType === 'password' && (
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 9 }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                )}
              </div>

              {activeType === 'password' && (
                <div style={{ padding: '8px 12px', background: 'rgba(48,209,88,0.05)', border: '1px solid rgba(48,209,88,0.12)', borderRadius: 8, marginBottom: 12 }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#30D158', letterSpacing: '0.1em' }}>K-ANONYMITY PROTECTED - Only the first 5 characters of the SHA-1 hash are transmitted</p>
                </div>
              )}

              <button
                onClick={handleCheck}
                disabled={checking || !inputValue.trim() || remaining <= 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: checking ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  color: checking ? 'var(--text-3)' : 'var(--text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: checking || !inputValue.trim() || remaining <= 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {checking ? (
                  <>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--text-2)', animation: 'spin 0.7s linear infinite' }} />
                    CHECKING BREACH DATABASES...
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    RUN BREACH CHECK
                  </>
                )}
              </button>

              {error && (
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--danger)', marginTop: 10 }}>{error}</p>
              )}
            </div>
          </div>

          {/* Results + History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {result ? (
              <BreachResult check={result} />
            ) : (
              <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', gap: 12 }}>
                <Database size={30} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>Select check type and run a breach scan.</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', opacity: 0.6 }}>DAYE WILL INTERPRET ALL RESULTS</p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase' }}>Recent Checks</p>
                <AnimatePresence>
                  {history.slice(0, 5).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <HistoryItem check={item} onSelect={() => setResult(item)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}
