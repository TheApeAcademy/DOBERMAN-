import { useEffect, useState } from 'react'
import { Eye, Wifi, Brain } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import { useNose } from '../hooks/useNose'
import { useBrain } from '../hooks/useBrain'
import type { EyesScan, NoseScan, BrainConversation } from '../lib/supabase'
import { formatDate, getResultLabel, getRiskColor, getRiskLabel, truncate } from '../lib/utils'

type Tab = 'eyes' | 'nose' | 'brain'

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  overflow: 'hidden',
}

export default function History() {
  const { user, profile, signOut } = useAuth()
  const { getHistory: getEyesHistory } = useEyes(user?.id)
  const { getHistory: getNoseHistory } = useNose(user?.id)
  const { getHistory: getBrainHistory } = useBrain(user?.id)

  const [tab, setTab] = useState<Tab>('eyes')
  const [eyesData, setEyesData] = useState<EyesScan[]>([])
  const [noseData, setNoseData] = useState<NoseScan[]>([])
  const [brainData, setBrainData] = useState<BrainConversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([getEyesHistory(), getNoseHistory(), getBrainHistory()]).then(
      ([eyes, nose, brain]) => {
        setEyesData(eyes)
        setNoseData(nose)
        setBrainData(brain)
        setLoading(false)
      }
    )
  }, [user])

  const tabs: { id: Tab; label: string; icon: typeof Eye; count: number }[] = [
    { id: 'eyes', label: 'EYES', icon: Eye, count: eyesData.length },
    { id: 'nose', label: 'NOSE', icon: Wifi, count: noseData.length },
    { id: 'brain', label: 'BRAIN', icon: Brain, count: brainData.length },
  ]

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontFamily: 'JetBrains Mono',
    fontSize: 9,
    letterSpacing: '0.2em',
    color: 'var(--text-3)',
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="HISTORY">
      <div style={{ padding: '28px 28px 48px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: '0.1em', color: 'var(--text-1)', lineHeight: 1 }}>HISTORY</h1>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginTop: 3 }}>ALL SCANS + CONVERSATIONS</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, width: 'fit-content' }}>
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 9,
                background: tab === id ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: tab === id ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                color: tab === id ? 'var(--text-1)' : 'var(--text-3)',
                fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em',
                transition: 'all 0.2s',
                boxShadow: tab === id ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <Icon size={13} />
              {label}
              <span style={{
                fontFamily: 'Bebas Neue', fontSize: 14,
                color: tab === id ? 'var(--text-2)' : 'var(--text-3)',
                letterSpacing: '0.05em',
              }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={card}>
          {loading ? (
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: 44, borderRadius: 8, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : tab === 'eyes' ? (
            eyesData.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Eye size={28} style={{ color: 'var(--text-3)', opacity: 0.4 }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>No EYES scans yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['File', 'Type', 'Result', 'Score', 'Date'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eyesData.map((scan) => {
                    const { label, color } = getResultLabel(scan.result)
                    return (
                      <tr key={scan.id} style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td style={tdStyle}>
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-1)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.file_name}</p>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase' }}>{scan.file_type}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6, color, background: `${color}15`, border: `1px solid ${color}30` }}>{label}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.05em', color }}>{Math.round(scan.confidence_score)}%</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>{formatDate(scan.created_at)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : tab === 'nose' ? (
            noseData.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Wifi size={28} style={{ color: 'var(--text-3)', opacity: 0.4 }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>No NOSE scans yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Environment', 'Risk Score', 'Level', 'Devices', 'Date'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {noseData.map((scan) => {
                    const color = getRiskColor(scan.overall_risk_score)
                    const label = getRiskLabel(scan.overall_risk_score)
                    return (
                      <tr key={scan.id}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td style={tdStyle}>
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-1)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {truncate(scan.environment_description || '', 55)}
                          </p>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: '0.05em', color }}>{scan.overall_risk_score}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 6, color, background: `${color}15`, border: `1px solid ${color}30` }}>{label}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-2)' }}>{scan.devices?.length || 0}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>{formatDate(scan.created_at)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : (
            brainData.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Brain size={28} style={{ color: 'var(--text-3)', opacity: 0.4 }} />
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>No conversations yet.</p>
              </div>
            ) : (
              <div>
                {brainData.map((conv) => (
                  <div key={conv.id}
                    style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.title || 'Untitled conversation'}
                      </p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                        {conv.messages?.length || 0} messages · {formatDate(conv.updated_at)}
                      </p>
                    </div>
                    <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, color: 'var(--text-3)', letterSpacing: '0.1em', flexShrink: 0 }}>
                      {conv.messages?.length || 0} MSG
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  )
}
