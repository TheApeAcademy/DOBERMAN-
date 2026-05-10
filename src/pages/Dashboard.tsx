import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Brain, Newspaper, ArrowUpRight, Clock, TrendingUp, ShieldCheck, MessageSquare, ScanLine } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel } from '../lib/utils'

interface ActivityItem {
  id: string
  type: 'eyes' | 'brain' | 'news'
  label: string
  result?: string
  score?: number
  created_at: string
}

interface Stats {
  eyesTotal: number
  brainTotal: number
  threatsDetected: number
  eyesToday: number
  brainToday: number
  newsToday: number
}

const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<Stats>({
    eyesTotal: 0, brainTotal: 0, threatsDetected: 0,
    eyesToday: 0, brainToday: 0, newsToday: 0,
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

    const [eyesRes, brainRes, logsRes] = await Promise.all([
      supabase.from('eyes_scans').select('id, result, confidence_score, file_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('brain_conversations').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('usage_logs').select('module, created_at').eq('user_id', user.id),
    ])

    const eyes = eyesRes.data || []
    const brain = brainRes.data || []
    const logs = logsRes.data || []
    const todayLogs = logs.filter((l) => new Date(l.created_at) >= today)

    const allActivity: ActivityItem[] = [
      ...eyes.map((e) => ({ id: e.id, type: 'eyes' as const, label: e.file_name || 'Unnamed file', result: e.result, score: e.confidence_score, created_at: e.created_at })),
      ...brain.map((b) => ({ id: b.id, type: 'brain' as const, label: b.title || 'Conversation', created_at: b.created_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

    setActivity(allActivity)
    setStats({
      eyesTotal: eyes.length,
      brainTotal: brain.length,
      threatsDetected: eyes.filter((e) => e.result === 'fake').length,
      eyesToday: todayLogs.filter((l) => l.module === 'eyes').length,
      brainToday: todayLogs.filter((l) => l.module === 'brain').length,
      newsToday: todayLogs.filter((l) => l.module === 'news').length,
    })
    setLoading(false)
  }

  const moduleCards = [
    {
      to: '/eyes', icon: Eye, name: 'EYES', sub: 'Deepfake Detection',
      desc: 'Detect AI-manipulated images, videos, and audio with precision analysis.',
      count: stats.eyesToday, limit: 3,
      src: '/assets/video/blob-eyes.mp4', isImage: false,
      accent: '#FF2D2D', accentBg: 'rgba(255,45,45,0.06)',
    },
    {
      to: '/brain', icon: Brain, name: 'BRAIN', sub: 'AI Security Analyst',
      desc: 'Your dedicated cybersecurity expert. Ask anything, get real answers.',
      count: stats.brainToday, limit: 10,
      src: '/assets/video/Brain_Parts_360_visualization-_Kritrimvault.mp4', isImage: false,
      accent: '#30D158', accentBg: 'rgba(48,209,88,0.06)',
    },
    {
      to: '/news', icon: Newspaper, name: 'NEWS', sub: 'Content Verification',
      desc: 'Verify any headline, claim, or article for credibility in seconds.',
      count: stats.newsToday, limit: 3,
      src: '/assets/video/blob-news.mp4', isImage: false,
      accent: '#FF9500', accentBg: 'rgba(255,149,0,0.06)',
    },
  ]

  const statCards = [
    { label: 'Scans Today', value: stats.eyesToday + stats.newsToday, icon: ScanLine, color: '#0F0F0F' },
    { label: 'Threats Found', value: stats.threatsDetected, icon: ShieldCheck, color: '#FF2D2D' },
    { label: 'AI Messages', value: stats.brainToday, icon: MessageSquare, color: '#30D158' },
    { label: 'Total Scans', value: stats.eyesTotal, icon: TrendingUp, color: '#FF9500' },
  ]

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.14em', color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase' }}>
              D0B3RMAN Intelligence
            </p>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.1, color: '#0F0F0F', marginBottom: 6 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontFamily: 'Syne', fontSize: 14, color: '#6B6B70' }}>
              Your threat intelligence dashboard. Everything is being watched.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.18)', borderRadius: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#30D158', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.12em', color: '#30D158' }}>ALL SYSTEMS ACTIVE</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
          {statCards.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ ...card, padding: '20px 22px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#8E8E93', textTransform: 'uppercase' }}>{label}</p>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, lineHeight: 1, color: loading ? '#C0C0C5' : '#0F0F0F' }}>
                {loading ? '--' : value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Module cards */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: '#8E8E93', marginBottom: 16, textTransform: 'uppercase' }}>
            Intelligence Modules
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {moduleCards.map(({ to, icon: Icon, name, sub, desc, count, limit, src, isImage, accent, accentBg }, i) => (
              <motion.button
                key={to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                onClick={() => navigate(to)}
                style={{ ...card, padding: 0, textAlign: 'left', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 20 }}
              >
                {/* Video / image strip */}
                <div style={{ position: 'relative', height: 180, overflow: 'hidden', borderRadius: '20px 20px 0 0', background: '#0C0C0E', flexShrink: 0 }}>
                  {isImage ? (
                    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}>
                      <source src={src} type="video/mp4" />
                    </video>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)' }}>
                      {count}/{limit} TODAY
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '20px 22px 22px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} style={{ color: accent }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.08em', color: '#0F0F0F', lineHeight: 1 }}>{name}</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: '#8E8E93' }}>{sub.toUpperCase()}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} style={{ color: '#C0C0C5', marginTop: 2 }} />
                  </div>
                  <p style={{ fontFamily: 'Syne', fontSize: 13, color: '#6B6B70', lineHeight: 1.6, marginBottom: 14 }}>{desc}</p>
                  <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: accent, width: `${Math.min((count / limit) * 100, 100)}%`, borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: '#8E8E93', textTransform: 'uppercase' }}>Recent Activity</p>
            <button
              onClick={() => navigate('/history')}
              style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.1em', color: '#8E8E93', background: 'none', border: 'none' }}
            >
              View all
            </button>
          </div>
          <div style={{ ...card, overflow: 'hidden' }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F0F2' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#F0F0F2', borderRadius: 4, marginBottom: 6, width: '55%' }} />
                    <div style={{ height: 10, background: '#F5F5F7', borderRadius: 4, width: '30%' }} />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#8E8E93' }}>No activity yet. Run your first scan.</p>
              </div>
            ) : (
              activity.map((item, i) => {
                const icons = { eyes: Eye, brain: Brain, news: Newspaper }
                const Icon = icons[item.type]
                const resultInfo = item.result ? getResultLabel(item.result) : null
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ padding: '14px 20px', borderBottom: i < activity.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F5F7', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} style={{ color: '#8E8E93' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, color: '#0F0F0F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{item.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={10} style={{ color: '#C0C0C5' }} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#8E8E93' }}>{formatRelativeTime(item.created_at)}</span>
                        {resultInfo && (
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.08em', color: resultInfo.color, background: `${resultInfo.color}18`, border: `1px solid ${resultInfo.color}30`, padding: '2px 6px', borderRadius: 4 }}>
                            {resultInfo.label}
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

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    </Layout>
  )
}
