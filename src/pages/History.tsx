import { useEffect, useState } from 'react'
import { Eye, Brain, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import { useBrain } from '../hooks/useBrain'
import type { EyesScan, BrainConversation } from '../lib/supabase'
import { formatDate, getResultLabel } from '../lib/utils'

type Tab = 'dfi' | 'daye'

function ConfidenceBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ height: 3, background: 'var(--ovw-0p06)', borderRadius: 2, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
        style={{ height: '100%', background: color, borderRadius: 2 }}
      />
    </div>
  )
}

function ScanDetail({ scan }: { scan: EyesScan }) {
  const { color } = getResultLabel(scan.result)
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        padding: '14px 20px 18px 20px',
        background: 'var(--ovw-0p018)',
        borderTop: '1px solid var(--ovw-0p05)',
      }}>
        {/* Confidence bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.12em', color: 'var(--ovw-0p28)', textTransform: 'uppercase' }}>Confidence</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.05em', color }}>{Math.round(scan.confidence_score)}%</span>
          </div>
          <ConfidenceBar score={scan.confidence_score} color={color} />
        </div>

        {/* Meta chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Type', value: scan.file_type?.toUpperCase() },
            { label: 'Scanned', value: formatDate(scan.created_at) },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '6px 12px', borderRadius: 8,
              background: 'var(--ovw-0p04)', border: '1px solid var(--ovw-0p07)',
            }}>
              <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ovw-0p28)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p7)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* AI explanation */}
        {scan.explanation && (
          <div style={{
            padding: '11px 14px', borderRadius: 10,
            background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p06)',
          }}>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.12em', color: 'var(--ovw-0p28)', textTransform: 'uppercase', marginBottom: 6 }}>AI Analysis</p>
            <p style={{ fontFamily: 'Inter', fontSize: 11, lineHeight: 1.65, color: 'var(--ovw-0p55)' }}>{scan.explanation}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function History() {
  const { user, profile, signOut } = useAuth()
  const { getHistory: getEyesHistory } = useEyes(user?.id)
  const { getHistory: getBrainHistory } = useBrain(user?.id)

  const [tab, setTab] = useState<Tab>('dfi')
  const [eyesData, setEyesData] = useState<EyesScan[]>([])
  const [brainData, setBrainData] = useState<BrainConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([getEyesHistory(), getBrainHistory()]).then(([eyes, brain]) => {
      setEyesData(eyes)
      setBrainData(brain)
      setLoading(false)
    })
  }, [user])

  const tabs: { id: Tab; label: string; sub: string; icon: typeof Eye; count: number }[] = [
    { id: 'dfi', label: 'D.F.I.', sub: 'Deepfake Scans', icon: Eye, count: eyesData.length },
    { id: 'daye', label: 'DAYE', sub: 'AI Sessions', icon: Brain, count: brainData.length },
  ]

  return (
    <Layout profile={profile} onSignOut={signOut} title="HISTORY">
      <div style={{ padding: 'clamp(20px,3vw,32px)', maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--ovw-0p05)' }}>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 30, letterSpacing: '0.1em', color: '#F5F5F7', lineHeight: 1 }}>HISTORY</h1>
          <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.08em', color: 'var(--ovw-0p22)', marginTop: 3, textTransform: 'uppercase' }}>Scans · Sessions · Activity</p>
        </div>

        {/* Segmented control */}
        <div style={{
          display: 'inline-flex', gap: 2, marginBottom: 18,
          padding: 3, background: 'var(--ovw-0p03)',
          border: '1px solid var(--ovw-0p07)', borderRadius: 13,
        }}>
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setExpanded(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 10, cursor: 'pointer',
                background: tab === id ? 'var(--ovw-0p08)' : 'transparent',
                border: tab === id ? '1px solid var(--ovw-0p12)' : '1px solid transparent',
                color: tab === id ? '#F5F5F7' : 'var(--ovw-0p3)',
                fontFamily: 'Inter', fontSize: 11, fontWeight: tab === id ? 600 : 400,
                letterSpacing: '0.04em', transition: 'all 0.16s ease',
                boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.35), inset 0 1px 0 var(--ovw-0p09)' : 'none',
              }}
            >
              <Icon size={12} />
              {label}
              <span style={{
                fontFamily: 'Bebas Neue', fontSize: 13,
                color: tab === id ? 'var(--ovw-0p45)' : 'var(--ovw-0p18)',
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* List card */}
        <div style={{
          background: 'var(--ovw-0p022)',
          border: '1px solid var(--ovw-0p07)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 4px 40px rgba(0,0,0,0.45), inset 0 1px 0 var(--ovw-0p06)',
        }}>

          {loading ? (
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  height: 46, borderRadius: 8,
                  background: 'var(--ovw-0p03)',
                  animation: `pulse 1.6s ease-in-out ${i * 0.08}s infinite`,
                }} />
              ))}
            </div>

          ) : tab === 'dfi' ? (
            eyesData.length === 0 ? (
              <div style={{ padding: '72px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Eye size={22} style={{ color: 'var(--ovw-0p12)' }} />
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p22)' }}>No deepfake scans yet</p>
              </div>
            ) : (
              <div>
                {eyesData.map((scan, i) => {
                  const { label, color } = getResultLabel(scan.result)
                  const isOpen = expanded === scan.id
                  return (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.035, duration: 0.2 }}
                    >
                      {/* Row */}
                      <div
                        onClick={() => setExpanded(isOpen ? null : scan.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 11,
                          padding: '12px 18px',
                          borderBottom: '1px solid var(--ovw-0p045)',
                          cursor: 'pointer',
                          background: isOpen ? 'var(--ovw-0p025)' : 'transparent',
                          transition: 'background 0.14s',
                        }}
                        onMouseEnter={e => { if (!isOpen)(e.currentTarget as HTMLDivElement).style.background = 'var(--ovw-0p018)' }}
                        onMouseLeave={e => { if (!isOpen)(e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      >
                        {/* Status dot */}
                        <div style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: color, flexShrink: 0,
                          boxShadow: `0 0 7px ${color}90`,
                        }} />

                        {/* Filename */}
                        <p style={{
                          fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
                          color: 'var(--ovw-0p82)', flex: 1, minWidth: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {scan.file_name}
                        </p>

                        {/* Result badge */}
                        <span style={{
                          fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.08em',
                          padding: '3px 8px', borderRadius: 5, flexShrink: 0,
                          color, background: `${color}18`, border: `1px solid ${color}35`,
                          textTransform: 'uppercase',
                        }}>
                          {label}
                        </span>

                        {/* Score */}
                        <span style={{
                          fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: '0.04em',
                          color, flexShrink: 0, minWidth: 36, textAlign: 'right',
                        }}>
                          {Math.round(scan.confidence_score)}%
                        </span>

                        {/* Date */}
                        <span style={{
                          fontFamily: 'Inter', fontSize: 10,
                          color: 'var(--ovw-0p2)', flexShrink: 0,
                          minWidth: 48, textAlign: 'right',
                        }}>
                          {formatDate(scan.created_at)}
                        </span>

                        {/* Chevron */}
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.18 }}>
                          <ChevronRight size={13} style={{ color: 'var(--ovw-0p18)', flexShrink: 0 }} />
                        </motion.div>
                      </div>

                      {/* Expandable detail */}
                      <AnimatePresence>
                        {isOpen && <ScanDetail scan={scan} />}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )

          ) : (
            brainData.length === 0 ? (
              <div style={{ padding: '72px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Brain size={22} style={{ color: 'var(--ovw-0p12)' }} />
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p22)' }}>No DAYE sessions yet</p>
              </div>
            ) : (
              <div>
                {brainData.map((conv, i) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.035, duration: 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: '12px 18px',
                      borderBottom: '1px solid var(--ovw-0p045)',
                      cursor: 'pointer', transition: 'background 0.14s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--ovw-0p018)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#30D158', flexShrink: 0,
                      boxShadow: '0 0 7px rgba(48,209,88,0.6)',
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
                        color: 'var(--ovw-0p82)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {conv.title || 'Untitled session'}
                      </p>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--ovw-0p24)', marginTop: 2 }}>
                        {conv.messages?.length || 0} messages
                      </p>
                    </div>

                    <span style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--ovw-0p22)', flexShrink: 0 }}>
                      {formatDate(conv.updated_at)}
                    </span>

                    <ChevronRight size={13} style={{ color: 'var(--ovw-0p18)', flexShrink: 0 }} />
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  )
}
