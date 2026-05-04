import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Wifi, Brain, Newspaper, ArrowRight, Clock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel, getRiskColor } from '../lib/utils'

interface ActivityItem {
  id: string
  type: 'eyes' | 'nose' | 'brain' | 'news'
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
  newsToday: number
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<Stats>({
    eyesTotal: 0, noseTotal: 0, brainTotal: 0, threatsDetected: 0,
    eyesToday: 0, noseToday: 0, brainToday: 0, newsToday: 0,
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

    const allActivity: ActivityItem[] = [
      ...eyes.map((e) => ({ id: e.id, type: 'eyes' as const, label: e.file_name || 'Unnamed file', result: e.result, score: e.confidence_score, created_at: e.created_at })),
      ...nose.map((n) => ({ id: n.id, type: 'nose' as const, label: (n.environment_description || '').slice(0, 50), score: n.overall_risk_score, created_at: n.created_at })),
      ...brain.map((b) => ({ id: b.id, type: 'brain' as const, label: b.title || 'Conversation', created_at: b.created_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

    const threatsDetected = eyes.filter((e) => e.result === 'fake').length + nose.filter((n) => n.overall_risk_score >= 70).length

    setActivity(allActivity)
    setStats({
      eyesTotal: eyes.length,
      noseTotal: nose.length,
      brainTotal: brain.length,
      threatsDetected,
      eyesToday: todayLogs.filter((l) => l.module === 'eyes').length,
      noseToday: todayLogs.filter((l) => l.module === 'nose').length,
      brainToday: todayLogs.filter((l) => l.module === 'brain').length,
      newsToday: todayLogs.filter((l) => l.module === 'news').length,
    })
    setLoading(false)
  }

  const moduleCards = [
    { to: '/eyes', icon: Eye, name: 'EYES', sub: 'Deepfake Detection', desc: 'Analyze images, videos, and audio for synthetic media manipulation.', count: stats.eyesToday, limit: 3, video: '/assets/video/blob-eyes.mp4' },
    { to: '/nose', icon: Wifi, name: 'NOSE', sub: 'IoT Intelligence', desc: 'Map your network environment and identify security weaknesses.', count: stats.noseToday, limit: 3, video: '/assets/video/blob-nose.mp4' },
    { to: '/brain', icon: Brain, name: 'BRAIN', sub: 'AI Analyst', desc: 'Chat with your dedicated cybersecurity expert powered by Claude.', count: stats.brainToday, limit: 10, video: '/assets/video/blob-brain.mp4' },
    { to: '/news', icon: Newspaper, name: 'NEWS', sub: 'Verify Content', desc: 'Paste any headline or claim. Get a credibility verdict instantly.', count: stats.newsToday, limit: 3, video: '/assets/video/blob-news.mp4' },
  ]

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: 1 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>
              D0B3RMAN is watching. Here's your threat overview.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--safe)' }}>ALL SYSTEMS ACTIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Scans Today', value: stats.eyesToday + stats.noseToday + stats.newsToday, color: 'var(--chrome-mid)' },
            { label: 'Threats Found', value: stats.threatsDetected, color: 'var(--danger)' },
            { label: 'AI Messages', value: stats.brainToday, color: 'var(--safe)' },
            { label: 'Total Scans', value: stats.eyesTotal + stats.noseTotal, color: 'var(--warning)' },
          ].map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass"
              style={{ padding: '20px 24px', borderRadius: 16 }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8 }}>{label.toUpperCase()}</p>
              <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 40, lineHeight: 1, color: loading ? 'var(--text-3)' : color }}>
                {loading ? '-' : value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Module cards */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 20 }}>
            MODULES
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {moduleCards.map(({ to, icon: Icon, name, sub, desc, count, limit, video }, i) => (
              <motion.button
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="glass"
                whileHover={{ y: -4, borderColor: 'var(--glass-border-bright)', transition: { duration: 0.2 } }}
                onClick={() => navigate(to)}
                style={{ padding: 24, borderRadius: 20, textAlign: 'left', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ width: '100%', height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
                  <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
                    <source src={video} type="video/mp4" />
                  </video>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Icon size={18} style={{ color: 'var(--text-2)' }} />
                  <ArrowRight size={14} style={{ color: 'var(--text-3)' }} />
                </div>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: '0.1em', marginBottom: 2 }}>{name}</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 12 }}>{sub.toUpperCase()}</p>
                <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 16 }}>{desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>{count}/{limit}</span>
                  <div style={{ flex: 1, height: 2, background: 'var(--void-4)', borderRadius: 1 }}>
                    <div style={{ height: '100%', borderRadius: 1, background: 'var(--chrome-mid)', width: `${Math.min((count / limit) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)' }}>
              RECENT ACTIVITY
            </p>
            <button
              onClick={() => navigate('/history')}
              style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: 'none' }}
            >
              View all
            </button>
          </div>
          <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--void-3)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: 'var(--void-3)', borderRadius: 4, marginBottom: 6, width: '60%' }} />
                    <div style={{ height: 10, background: 'var(--void-3)', borderRadius: 4, width: '30%' }} />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>No activity yet. Run your first scan.</p>
              </div>
            ) : (
              activity.map((item, i) => {
                const icons = { eyes: Eye, nose: Wifi, brain: Brain, news: Newspaper }
                const Icon = icons[item.type]
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ padding: '14px 20px', borderBottom: i < activity.length - 1 ? '1px solid var(--glass-border)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{item.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={10} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>{formatRelativeTime(item.created_at)}</span>
                        {item.result && (
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: getResultLabel(item.result).color, background: `${getResultLabel(item.result).color}22`, padding: '2px 6px', borderRadius: 4 }}>
                            {getResultLabel(item.result).label}
                          </span>
                        )}
                        {item.type === 'nose' && item.score !== undefined && (
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: getRiskColor(item.score), background: `${getRiskColor(item.score)}22`, padding: '2px 6px', borderRadius: 4 }}>
                            Risk: {item.score}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    </Layout>
  )
}
