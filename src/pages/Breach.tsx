import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Scan, CheckSquare, Square, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/layout/Layout'
import { ChromeBlob } from '../components/ui/ChromeBlob'
import { PageWrapper } from '../components/ui/PageWrapper'

interface BreachResult {
  breaches: BreachDetail[]
  risk_score: number
  summary: string
  action_plan: string[]
}

interface BreachDetail {
  Name: string
  Title: string
  Domain: string
  BreachDate: string
  PwnCount: number
  DataClasses: string[]
  Description: string
  IsVerified: boolean
}

function getRiskColor(score: number): string {
  if (score < 30) return 'var(--safe)'
  if (score < 70) return 'var(--warning)'
  return 'var(--danger)'
}

function getRiskLabel(score: number): string {
  if (score < 30) return 'LOW RISK'
  if (score < 70) return 'MEDIUM RISK'
  return 'HIGH RISK'
}

export default function Breach() {
  const { user, profile, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BreachResult | null>(null)
  const [error, setError] = useState('')
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>([])
  const [expandedBreach, setExpandedBreach] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const today = new Date(); today.setHours(0, 0, 0, 0)
    supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('module', 'breach')
      .gte('created_at', today.toISOString())
      .then(({ count }) => setScanCount(count || 0))
  }, [user])

  async function handleScan() {
    if (!email.trim() || !user) return
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    setError('')
    setResult(null)
    setCheckedSteps([])

    try {
      const { data, error: fnError } = await supabase.functions.invoke('breach-check', {
        body: { email: email.trim(), user_id: user.id },
      })
      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)
      setResult(data)
      setCheckedSteps(new Array(data.action_plan?.length || 0).fill(false))
      setScanCount((c) => c + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const riskColor = result ? getRiskColor(result.risk_score) : 'var(--chrome-mid)'

  return (
    <Layout profile={profile} onSignOut={signOut} title="BREACH">
      <PageWrapper>
        <div style={{ minHeight: '100vh', background: 'var(--void)', position: 'relative', overflow: 'hidden' }}>
          <ChromeBlob size={500} speed={0.3} distort={0.5}
            style={{ top: -100, right: -100, opacity: 0.07, zIndex: 0 }} />
          <ChromeBlob size={300} speed={0.6} distort={0.7}
            style={{ bottom: '20%', left: -80, opacity: 0.05, zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

            {/* Header */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <Shield size={28} style={{ color: 'var(--danger)' }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'var(--danger)' }}>
                  [ DATA BREACH SCANNER ]
                </p>
              </div>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(40px, 7vw, 80px)', lineHeight: 0.92, marginBottom: 16 }}>
                BREACH
              </h1>
              <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)', maxWidth: 500 }}>
                Check if your credentials have been exposed in known public data breaches.
              </p>
            </div>

            {/* Input card */}
            <div className="glass" style={{ borderRadius: 24, padding: 36, marginBottom: 32 }}>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', display: 'block', marginBottom: 12 }}>
                EMAIL ADDRESS TO SCAN
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  placeholder="your@email.com"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12,
                    padding: '14px 18px',
                    color: 'var(--text-1)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--glass-border-bright)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)' }}
                />
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleScan}
                  disabled={loading || !email.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 32px',
                    background: loading ? 'var(--void-4)' : 'white',
                    color: loading ? 'var(--text-3)' : 'black',
                    fontFamily: 'Syne', fontWeight: 700, fontSize: 14,
                    border: 'none', borderRadius: 12, transition: 'all 0.2s',
                  }}
                >
                  <Scan size={16} />
                  {loading ? 'SCANNING...' : 'SCAN'}
                </motion.button>
              </div>
              {error && (
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--danger)', marginTop: 14 }}>
                  {error}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>
                  3 checks/day · Email is never stored, only a one-way hash
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>
                  {scanCount}/3 today
                </p>
              </div>
            </div>

            {/* Loading state */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass"
                  style={{ borderRadius: 24, padding: 48, textAlign: 'center', marginBottom: 32 }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.08)',
                      borderTop: '2px solid var(--danger)',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 13, letterSpacing: '0.15em', color: 'var(--danger)', marginBottom: 8 }}>
                        SCANNING DATABASES...
                      </p>
                      <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-3)' }}>
                        Checking against millions of known breaches
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Risk Score */}
                  <div className="glass" style={{ borderRadius: 24, padding: 36, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 28 }}>
                      <div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 4 }}>
                          RISK SCORE
                        </p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 80, color: riskColor, lineHeight: 1 }}>
                            {result.risk_score}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 28, color: riskColor, marginBottom: 8 }}>/100</span>
                        </div>
                        <div style={{ width: 180, height: 4, background: 'var(--void-4)', borderRadius: 2, marginTop: 8 }}>
                          <div style={{
                            height: '100%', borderRadius: 2, background: riskColor,
                            width: `${result.risk_score}%`, transition: 'width 1s ease'
                          }} />
                        </div>
                      </div>
                      <div>
                        <span style={{
                          fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.15em',
                          color: riskColor, background: `${riskColor}22`,
                          border: `1px solid ${riskColor}44`, padding: '6px 18px', borderRadius: 8, display: 'inline-block'
                        }}>
                          {getRiskLabel(result.risk_score)}
                        </span>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                          BREACHES FOUND: <span style={{ color: riskColor }}>{result.breaches.length}</span>
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <p style={{
                      fontFamily: 'Syne', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7,
                      padding: '20px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                      borderLeft: `3px solid ${riskColor}`
                    }}>
                      {result.summary}
                    </p>
                  </div>

                  {/* Action Plan */}
                  <div className="glass" style={{ borderRadius: 24, padding: 36, marginBottom: 20 }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 20 }}>
                      ACTION PLAN
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {result.action_plan.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => {
                            const next = [...checkedSteps]
                            next[i] = !next[i]
                            setCheckedSteps(next)
                          }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 14,
                            padding: '14px 18px', borderRadius: 12,
                            background: checkedSteps[i] ? 'rgba(48,209,88,0.05)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${checkedSteps[i] ? 'rgba(48,209,88,0.2)' : 'var(--glass-border)'}`,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >
                          {checkedSteps[i]
                            ? <CheckSquare size={18} style={{ color: 'var(--safe)', flexShrink: 0, marginTop: 1 }} />
                            : <Square size={18} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
                          }
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', marginTop: 2, minWidth: 16 }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <p style={{
                              fontFamily: 'Syne', fontSize: 14, lineHeight: 1.5,
                              color: checkedSteps[i] ? 'var(--text-3)' : 'var(--text-1)',
                              textDecoration: checkedSteps[i] ? 'line-through' : 'none',
                            }}>
                              {step}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Breach History */}
                  {result.breaches.length > 0 && (
                    <div className="glass" style={{ borderRadius: 24, padding: 36 }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 20 }}>
                        DETAILED BREACH HISTORY ({result.breaches.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {result.breaches.map((breach: BreachDetail) => (
                          <motion.div
                            key={breach.Name}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass"
                            style={{ borderRadius: 16, overflow: 'hidden' }}
                          >
                            <div
                              onClick={() => setExpandedBreach(expandedBreach === breach.Name ? null : breach.Name)}
                              style={{
                                padding: '16px 20px', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', cursor: 'pointer', gap: 16,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                                <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>
                                    {breach.Title || breach.Name}
                                  </p>
                                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                                    {breach.BreachDate} · {breach.PwnCount?.toLocaleString()} accounts
                                  </p>
                                </div>
                              </div>
                              {expandedBreach === breach.Name
                                ? <ChevronUp size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                                : <ChevronDown size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                              }
                            </div>
                            <AnimatePresence>
                              {expandedBreach === breach.Name && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  style={{ overflow: 'hidden', borderTop: '1px solid var(--glass-border)' }}
                                >
                                  <div style={{ padding: '16px 20px' }}>
                                    {breach.DataClasses && breach.DataClasses.length > 0 && (
                                      <div style={{ marginBottom: 14 }}>
                                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 10 }}>
                                          DATA EXPOSED
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                          {breach.DataClasses.map((dc) => (
                                            <span key={dc} style={{
                                              fontFamily: 'JetBrains Mono', fontSize: 11,
                                              color: 'var(--danger)', background: 'rgba(255,45,45,0.08)',
                                              border: '1px solid rgba(255,45,45,0.2)',
                                              padding: '3px 10px', borderRadius: 4,
                                            }}>
                                              {dc}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {breach.Domain && (
                                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>
                                        Domain: <span style={{ color: 'var(--text-2)' }}>{breach.Domain}</span>
                                        {' · '}
                                        {breach.IsVerified ? 'Verified' : 'Unverified'}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.breaches.length === 0 && (
                    <div className="glass" style={{ borderRadius: 24, padding: 40, textAlign: 'center' }}>
                      <Shield size={40} style={{ color: 'var(--safe)', margin: '0 auto 16px' }} />
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.1em', color: 'var(--safe)', marginBottom: 8 }}>
                        NO BREACHES FOUND
                      </p>
                      <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-3)' }}>
                        This email was not found in any known public data breaches.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageWrapper>
    </Layout>
  )
}
