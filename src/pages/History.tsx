import { useEffect, useState } from 'react'
import { Eye, Wifi, Brain, ExternalLink } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useEyes } from '../hooks/useEyes'
import { useNose } from '../hooks/useNose'
import { useBrain } from '../hooks/useBrain'
import type { EyesScan, NoseScan, BrainConversation } from '../lib/supabase'
import { formatDate, getResultLabel, getRiskColor, getRiskLabel, truncate } from '../lib/utils'

type Tab = 'eyes' | 'nose' | 'brain'

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

  const tabs = [
    { id: 'eyes' as Tab, label: 'EYES', icon: Eye, count: eyesData.length },
    { id: 'nose' as Tab, label: 'NOSE', icon: Wifi, count: noseData.length },
    { id: 'brain' as Tab, label: 'BRAIN', icon: Brain, count: brainData.length },
  ]

  return (
    <Layout profile={profile} onSignOut={signOut} title="History">
      <div className="p-6 max-w-5xl mx-auto page-fade">
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-text-primary">History</h1>
          <p className="text-text-muted font-body text-sm mt-1">All your scans and conversations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bg-secondary border border-border-color rounded-lg mb-6 w-fit">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-label font-medium transition-all ${
                tab === id
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={14} />
              {label}
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: tab === id ? '#3B82F620' : '#21262D',
                  color: tab === id ? '#3B82F6' : '#484F58',
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse" />
              ))}
            </div>
          ) : tab === 'eyes' ? (
            eyesData.length === 0 ? (
              <div className="p-12 text-center">
                <Eye size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-muted font-body text-sm">No EYES scans yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-color">
                    {['File', 'Type', 'Result', 'Score', 'Date'].map((h) => (
                      <th key={h} className="p-4 text-left text-text-muted font-label text-xs tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {eyesData.map((scan) => {
                    const { label, color } = getResultLabel(scan.result)
                    return (
                      <tr key={scan.id} className="hover:bg-bg-tertiary/30">
                        <td className="p-4">
                          <p className="text-text-primary font-body text-sm max-w-48 truncate">{scan.file_name}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-text-muted font-label text-xs uppercase">{scan.file_type}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-label font-medium px-2 py-0.5 rounded" style={{ color, background: `${color}15` }}>
                            {label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-body text-sm" style={{ color }}>{Math.round(scan.confidence_score)}%</span>
                        </td>
                        <td className="p-4">
                          <span className="text-text-muted font-label text-xs">{formatDate(scan.created_at)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : tab === 'nose' ? (
            noseData.length === 0 ? (
              <div className="p-12 text-center">
                <Wifi size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-muted font-body text-sm">No NOSE scans yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-color">
                    {['Environment', 'Risk Score', 'Level', 'Devices', 'Date'].map((h) => (
                      <th key={h} className="p-4 text-left text-text-muted font-label text-xs tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {noseData.map((scan) => {
                    const color = getRiskColor(scan.overall_risk_score)
                    const label = getRiskLabel(scan.overall_risk_score)
                    return (
                      <tr key={scan.id} className="hover:bg-bg-tertiary/30">
                        <td className="p-4">
                          <p className="text-text-primary font-body text-sm max-w-64 truncate">
                            {truncate(scan.environment_description || '', 60)}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="font-display text-xl" style={{ color }}>{scan.overall_risk_score}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-label font-medium px-2 py-0.5 rounded" style={{ color, background: `${color}15` }}>
                            {label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-text-muted font-label text-xs">{scan.devices?.length || 0} devices</span>
                        </td>
                        <td className="p-4">
                          <span className="text-text-muted font-label text-xs">{formatDate(scan.created_at)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )
          ) : (
            brainData.length === 0 ? (
              <div className="p-12 text-center">
                <Brain size={32} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-muted font-body text-sm">No conversations yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-color">
                {brainData.map((conv) => (
                  <div key={conv.id} className="p-4 hover:bg-bg-tertiary/30 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary font-body text-sm truncate">
                        {conv.title || 'Untitled conversation'}
                      </p>
                      <p className="text-text-muted font-label text-xs mt-0.5">
                        {conv.messages?.length || 0} messages - {formatDate(conv.updated_at)}
                      </p>
                    </div>
                    <ExternalLink size={14} className="text-text-muted shrink-0" />
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
