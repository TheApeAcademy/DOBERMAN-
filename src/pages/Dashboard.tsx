import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Clock, ExternalLink, ChevronRight, Zap } from 'lucide-react'
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

const CYBER_HEADLINES = [
  { id: 1, tag: 'CRITICAL', text: 'New zero-day exploit targets 200M Windows devices via CLFS driver vulnerability', time: '3m ago' },
  { id: 2, tag: 'WARNING', text: 'AI-generated deepfake audio used in $25M corporate wire transfer fraud', time: '11m ago' },
  { id: 3, tag: 'ALERT', text: 'Massive botnet of 40,000 compromised IoT cameras targeting financial sector', time: '28m ago' },
  { id: 4, tag: 'CRITICAL', text: 'State-sponsored group deploys rootkit via malicious firmware updates to routers', time: '44m ago' },
  { id: 5, tag: 'WARNING', text: 'Phishing campaign impersonating GitHub 2FA notices hitting developers', time: '1h ago' },
  { id: 6, tag: 'INFO', text: 'CISA adds four newly exploited vulnerabilities to Known Exploited Catalog', time: '2h ago' },
  { id: 7, tag: 'ALERT', text: 'Ransomware group LockBit 4.0 claims breach of three critical infrastructure operators', time: '3h ago' },
  { id: 8, tag: 'WARNING', text: 'Supply chain attack found in popular npm package with 8M weekly downloads', time: '4h ago' },
  { id: 9, tag: 'INFO', text: 'Google patches 47 Android vulnerabilities including actively exploited privilege escalation', time: '5h ago' },
  { id: 10, tag: 'ALERT', text: 'Nation-state actor uses synthetic media in disinformation operation targeting elections', time: '6h ago' },
]

const TAG_COLORS: Record<string, string> = {
  CRITICAL: 'var(--danger)',
  WARNING: 'var(--warning)',
  ALERT: '#FF6B35',
  INFO: 'var(--chrome-dim)',
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
  const [visibleHeadlines, setVisibleHeadlines] = useState(3)

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
    {
      to: '/eyes',
      icon: Shield,
      name: 'DEEP FAKE INTELLIGENCE',
      sub: 'Deepfake Detection',
      desc: 'Analyze images, videos, and audio for synthetic media manipulation.',
      count: stats.eyesToday,
      limit: 3,
      src: '/assets/video/blob-nose.mp4',
      isImage: false,
    },
  ]

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  const displayedHeadlines = CYBER_HEADLINES.slice(0, visibleHeadlines)

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
            { label: 'AI Queries', value: stats.brainToday, color: 'var(--safe)' },
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

        {/* Module cards — 2 only */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 20 }}>
            MODULES
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16, maxWidth: 480 }}>
            {moduleCards.map(({ to, icon: Icon, name, sub, desc, count, limit, src, isImage }, i) => (
              <motion.button
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="glass"
                whileHover={{ y: -4, borderColor: 'var(--glass-border-bright)', transition: { duration: 0.2 } }}
                onClick={() => navigate(to)}
                style={{ padding: 0, borderRadius: 20, textAlign: 'left', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative', height: 200, borderRadius: '20px 20px 0 0', overflow: 'hidden', background: '#060606', flexShrink: 0 }}>
                  {isImage ? (
                    <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                  ) : (
                    <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
                      <source src={src} type="video/mp4" />
                    </video>
                  )}
                  <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px 20px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 14, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', zIndex: 2 }}>
                    {name} -- {sub.toUpperCase()}
                  </div>
                </div>
                <div style={{ padding: '20px 24px 24px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
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
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Doberman Intelligence banner */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ borderColor: 'rgba(0,212,106,0.4)', background: 'rgba(0,212,106,0.04)', transition: { duration: 0.2 } }}
          onClick={() => navigate('/brain')}
          style={{
            width: '100%',
            marginBottom: 40,
            padding: '20px 28px',
            borderRadius: 20,
            background: 'rgba(0,212,106,0.03)',
            border: '1px solid rgba(0,212,106,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#000',
              border: '1px solid rgba(0,212,106,0.3)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <video
                autoPlay muted loop playsInline preload="auto"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              >
                <source src="/assets/video/blob-di.mp4" type="video/mp4" />
              </video>
            </div>
            <div>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.15em', color: 'var(--safe)', lineHeight: 1, marginBottom: 4 }}>
                DOBERMAN INTELLIGENCE
              </p>
              <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-2)' }}>
                Ask anything — threat analysis, CVEs, security guidance, and more.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--safe)', letterSpacing: '0.1em' }}>
              {stats.brainToday}/10 today
            </span>
            <ChevronRight size={16} style={{ color: 'var(--safe)' }} />
          </div>
        </motion.button>

        {/* Live News Feed */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)' }}>
                LIVE THREAT FEED
              </p>
            </div>
            <button
              onClick={() => navigate('/news')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'JetBrains Mono',
                fontSize: 11,
                color: 'var(--chrome-dim)',
                background: 'none',
                border: '1px solid var(--glass-border)',
                padding: '5px 12px',
                borderRadius: 6,
              }}
            >
              <ExternalLink size={11} />
              Verify Headlines
            </button>
          </div>

          <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <AnimatePresence mode="popLayout">
              {displayedHeadlines.map((item, i) => {
                const tagColor = TAG_COLORS[item.tag] || 'var(--chrome-dim)'
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < displayedHeadlines.length - 1 ? '1px solid var(--glass-border)' : 'none',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                    }}
                  >
                    <span style={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      color: tagColor,
                      background: `${tagColor}18`,
                      border: `1px solid ${tagColor}33`,
                      padding: '3px 7px',
                      borderRadius: 4,
                      whiteSpace: 'nowrap',
                      marginTop: 2,
                      flexShrink: 0,
                    }}>
                      {item.tag}
                    </span>
                    <p style={{
                      fontFamily: 'Syne',
                      fontSize: 14,
                      color: 'var(--text-1)',
                      lineHeight: 1.5,
                      flex: 1,
                    }}>
                      {item.text}
                    </p>
                    <span style={{
                      fontFamily: 'JetBrains Mono',
                      fontSize: 10,
                      color: 'var(--text-3)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {item.time}
                    </span>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {visibleHeadlines < CYBER_HEADLINES.length && (
              <button
                onClick={() => setVisibleHeadlines(CYBER_HEADLINES.length)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'rgba(255,255,255,0.02)',
                  border: 'none',
                  borderTop: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: 'var(--chrome-dim)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
              >
                <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
                VIEW MORE ({CYBER_HEADLINES.length - visibleHeadlines} more threats)
              </button>
            )}

            {visibleHeadlines >= CYBER_HEADLINES.length && (
              <div
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <button
                  onClick={() => navigate('/news')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    color: 'var(--danger)',
                    background: 'rgba(255,59,59,0.08)',
                    border: '1px solid rgba(255,59,59,0.2)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={11} />
                  VERIFY ANY HEADLINE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dog image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginBottom: 32,
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative',
            height: 280,
          }}
        >
          <img
            src="/assets/video/b78ad4f230a4015d24a420fce2a7d53b.jpg"
            alt="D0B3RMAN"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
            <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>D0B3RMAN</p>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>THE WATCHDOG IS WATCHING</p>
          </div>
        </motion.div>

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
                const typeLabels: Record<string, string> = { eyes: 'D.F.I.', nose: 'D.F.I.', brain: 'D0B3RMAN I.', news: 'NEWS' }
                const typeIcons: Record<string, React.FC<{ size: number; style: React.CSSProperties }>> = {
                  eyes: (p) => <Shield {...p} />,
                  nose: (p) => <Shield {...p} />,
                  brain: (p) => <Zap {...p} />,
                  news: (p) => <ExternalLink {...p} />,
                }
                const IconComp = typeIcons[item.type] || Shield
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ padding: '14px 20px', borderBottom: i < activity.length - 1 ? '1px solid var(--glass-border)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComp size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{item.label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock size={10} style={{ color: 'var(--text-3)' }} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-3)' }}>{formatRelativeTime(item.created_at)}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{typeLabels[item.type]}</span>
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

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
      </div>
    </Layout>
  )
}
