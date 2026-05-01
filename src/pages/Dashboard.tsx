import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Wifi, Brain, ArrowRight, TrendingUp, Shield, AlertTriangle, Clock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel, getRiskColor } from '../lib/utils'

interface ActivityItem {
  id: string
  type: 'eyes' | 'nose' | 'brain'
  label: string
  result?: string
  score?: number
  created_at: string
}

interface Stats {
  eyesTotal: number
  noseTotal: number
  brainTotal: number
  threatsDetected: number
  eyesToday: number
  noseToday: number
  brainToday: number
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<Stats>({
    eyesTotal: 0,
    noseTotal: 0,
    brainTotal: 0,
    threatsDetected: 0,
    eyesToday: 0,
    noseToday: 0,
    brainToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [eyesRes, noseRes, brainRes, logsRes] = await Promise.all([
      supabase.from('eyes_scans').select('id, result, confidence_score, file_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('nose_scans').select('id, overall_risk_score, environment_description, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('brain_conversations').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('usage_logs').select('module, created_at').eq('user_id', user.id),
    ])

    const eyes = eyesRes.data || []
    const nose = noseRes.data || []
    const brain = brainRes.data || []
    const logs = logsRes.data || []

    const todayLogs = logs.filter((l) => new Date(l.created_at) >= today)
    const eyesToday = todayLogs.filter((l) => l.module === 'eyes').length
    const noseToday = todayLogs.filter((l) => l.module === 'nose').length
    const brainToday = todayLogs.filter((l) => l.module === 'brain').length
    const threatsDetected = eyes.filter((e) => e.result === 'fake').length + nose.filter((n) => n.overall_risk_score >= 70).length

    const allActivity: ActivityItem[] = [
      ...eyes.map((e) => ({
        id: e.id,
        type: 'eyes' as const,
        label: e.file_name || 'Unnamed file',
        result: e.result,
        score: e.confidence_score,
        created_at: e.created_at,
      })),
      ...nose.map((n) => ({
        id: n.id,
        type: 'nose' as const,
        label: (n.environment_description || '').slice(0, 50) + '...',
        score: n.overall_risk_score,
        created_at: n.created_at,
      })),
      ...brain.map((b) => ({
        id: b.id,
        type: 'brain' as const,
        label: b.title || 'Conversation',
        created_at: b.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

    setActivity(allActivity)
    setStats({
      eyesTotal: eyes.length,
      noseTotal: nose.length,
      brainTotal: brain.length,
      threatsDetected,
      eyesToday,
      noseToday,
      brainToday,
    })
    setLoading(false)
  }

  const moduleCards = [
    {
      to: '/eyes',
      icon: Eye,
      name: 'EYES',
      description: 'Deepfake Detection',
      sub: 'Analyze images, videos, and audio for synthetic media manipulation.',
      color: '#3B82F6',
      count: stats.eyesToday,
      limit: 3,
      label: 'scans today',
    },
    {
      to: '/nose',
      icon: Wifi,
      name: 'NOSE',
      description: 'Vulnerability Intelligence',
      sub: 'Map your IoT environment and identify network security weaknesses.',
      color: '#8B5CF6',
      count: stats.noseToday,
      limit: 3,
      label: 'scans today',
    },
    {
      to: '/brain',
      icon: Brain,
      name: 'BRAIN',
      description: 'AI Security Analyst',
      sub: 'Chat with your dedicated cybersecurity expert - powered by Claude.',
      color: '#00D46A',
      count: stats.brainToday,
      limit: 10,
      label: 'messages today',
    },
  ]

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div className="p-6 space-y-6 page-fade max-w-6xl mx-auto">
        {/* Welcome bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-text-primary">
              {greeting()}, {firstName}.
            </h1>
            <p className="text-text-secondary font-body text-sm mt-0.5">
              DOBERMAN is watching. Here's your threat overview.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-800/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-accent-green font-label text-xs font-medium">ALL SYSTEMS ACTIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Eye, label: 'Scans Today', value: stats.eyesToday + stats.noseToday, color: '#3B82F6' },
            { icon: AlertTriangle, label: 'Threats Found', value: stats.threatsDetected, color: '#FF3B3B' },
            { icon: Brain, label: 'AI Messages', value: stats.brainToday, color: '#00D46A' },
            { icon: Shield, label: 'Total Scans', value: stats.eyesTotal + stats.noseTotal, color: '#8B5CF6' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <span className="text-text-muted font-label text-xs">{label}</span>
              </div>
              <p className="font-display text-3xl text-text-primary">{loading ? '-' : value}</p>
            </div>
          ))}
        </div>

        {/* Module launcher cards */}
        <div>
          <h2 className="font-heading font-bold text-text-primary mb-4">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moduleCards.map(({ to, icon: Icon, name, description, sub, color, count, limit, label }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="card p-6 text-left group w-full"
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`
                  e.currentTarget.style.boxShadow = `0 0 20px ${color}15`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}20` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
                </div>
                <p className="font-display text-xl text-text-primary tracking-wider mb-0.5">{name}</p>
                <p className="font-label font-medium text-sm mb-2" style={{ color }}>{description}</p>
                <p className="text-text-muted font-body text-xs leading-relaxed mb-4">{sub}</p>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted font-label text-xs">{count}/{limit} {label}</span>
                  <div className="h-1 flex-1 mx-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / limit) * 100}%`, background: color }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-text-primary">Recent Activity</h2>
              <button onClick={() => navigate('/history')} className="text-accent-blue text-xs font-label hover:underline">
                View all
              </button>
            </div>
            <div className="card divide-y divide-border-color">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-tertiary animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-bg-tertiary rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-bg-tertiary rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
              ) : activity.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-text-muted font-body text-sm">No activity yet. Run your first scan.</p>
                </div>
              ) : (
                activity.map((item) => {
                  const icons = { eyes: Eye, nose: Wifi, brain: Brain }
                  const colors = { eyes: '#3B82F6', nose: '#8B5CF6', brain: '#00D46A' }
                  const Icon = icons[item.type]
                  const color = colors[item.type]

                  return (
                    <div key={item.id} className="p-4 flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${color}15` }}
                      >
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-body text-sm truncate">{item.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock size={10} className="text-text-muted" />
                          <span className="text-text-muted font-label text-xs">{formatRelativeTime(item.created_at)}</span>
                          {item.result && (
                            <span
                              className="text-xs font-label font-medium px-1.5 py-0.5 rounded"
                              style={{
                                color: getResultLabel(item.result).color,
                                background: `${getResultLabel(item.result).color}15`,
                              }}
                            >
                              {getResultLabel(item.result).label}
                            </span>
                          )}
                          {item.type === 'nose' && item.score !== undefined && (
                            <span
                              className="text-xs font-label font-medium px-1.5 py-0.5 rounded"
                              style={{
                                color: getRiskColor(item.score),
                                background: `${getRiskColor(item.score)}15`,
                              }}
                            >
                              Risk: {item.score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Threat summary */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-text-primary">Threat Summary</h2>
              <TrendingUp size={16} className="text-text-muted" />
            </div>
            <div className="card p-6 space-y-4">
              {[
                { label: 'Authentic Media', value: stats.eyesTotal - stats.threatsDetected > 0 ? stats.eyesTotal - stats.threatsDetected : 0, color: '#00D46A', bg: 'rgba(0,212,106,0.1)' },
                { label: 'Fake / Manipulated', value: stats.threatsDetected, color: '#FF3B3B', bg: 'rgba(255,59,59,0.1)' },
                { label: 'Uncertain / Review', value: 0, color: '#FFB020', bg: 'rgba(255,176,32,0.1)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary font-label text-xs">{label}</span>
                    <span className="font-body text-sm" style={{ color }}>{value}</span>
                  </div>
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: stats.eyesTotal > 0 ? `${(value / stats.eyesTotal) * 100}%` : '0%',
                        background: color,
                        boxShadow: `0 0 8px ${color}60`,
                        transition: 'width 1s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border-color">
                <p className="text-text-muted font-label text-xs">
                  Based on {stats.eyesTotal} media scan{stats.eyesTotal !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
