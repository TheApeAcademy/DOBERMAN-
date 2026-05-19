import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Wifi, Brain, Newspaper, ArrowRight, Clock, ShieldAlert } from 'lucide-react'
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function WeeklyBarChart({ data }: { data: number[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((val, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <motion.div
            initial={{ scaleY: 0, originY: 1 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            style={{
              width: '100%',
              height: `${Math.max((val / max) * 64, 4)}px`,
              background: i === data.length - 1
                ? 'linear-gradient(to top, var(--chrome-mid), rgba(171,171,171,0.4))'
                : 'rgba(255,255,255,0.1)',
              borderRadius: '3px 3px 2px 2px',
              transformOrigin: 'bottom',
            }}
          />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
            {days[i]}
          </span>
        </div>
      ))}
    </div>
  )
}

function ModuleRing({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={60} height={60} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5} />
          <motion.circle
            cx={30} cy={30} r={r}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            whileInView={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 1.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: '0.03em', color: 'var(--text-1)', lineHeight: 1 }}>
            {value}
          </span>
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text-1)', marginBottom: 2 }}>{value}/{max}</p>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</p>
      </div>
    </div>
  )
}

function ThreatArc({ threats, total }: { threats: number; total: number }) {
  const pct = total > 0 ? threats / total : 0
  const arcLen = 220
  return (
    <div>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '52%' }}>
        <svg viewBox="0 0 200 108" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M 18 98 A 82 82 0 0 1 182 98" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} strokeLinecap="round" />
          <motion.path
            d="M 18 98 A 82 82 0 0 1 182 98"
            fill="none"
            stroke={pct > 0.5 ? 'var(--danger)' : pct > 0.2 ? 'var(--warning)' : 'var(--safe)'}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={arcLen}
            initial={{ strokeDashoffset: arcLen }}
            whileInView={{ strokeDashoffset: arcLen * (1 - pct) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            viewport={{ once: true }}
          />
          <text x="100" y="84" textAnchor="middle" fill="var(--text-1)" fontSize={26} fontFamily="'Bebas Neue'" letterSpacing="0.04em">
            {threats}
          </text>
          <text x="100" y="100" textAnchor="middle" fill="var(--text-3)" fontSize={7} fontFamily="'JetBrains Mono'" letterSpacing="0.1em">
            THREATS
          </text>
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--safe)', letterSpacing: '0.1em' }}>CLEAR</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{total} SCANNED</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--danger)', letterSpacing: '0.1em' }}>CRITICAL</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
    { to: '/eyes', icon: Eye, name: 'EYES', sub: 'Deepfake Detection', desc: 'Analyze images, videos, and audio for synthetic media manipulation.', count: stats.eyesToday, limit: 3, src: '/assets/video/blob-eyes.mp4', isImage: false, label: 'EYES -- DEEPFAKE DETECTION' },
    { to: '/nose', icon: Wifi, name: 'NOSE', sub: 'IoT Intelligence', desc: 'Map your network environment and identify security weaknesses.', count: stats.noseToday, limit: 3, src: '/assets/video/5550b5f21861539de2d6c651cf6bbb1f.jpg', isImage: true, label: 'NOSE -- IOT INTELLIGENCE' },
    { to: '/brain', icon: Brain, name: 'BRAIN', sub: 'AI Analyst', desc: 'Chat with your dedicated cybersecurity expert powered by Claude.', count: stats.brainToday, limit: 10, src: '/assets/video/Brain_Parts_360_visualization-_Kritrimvault.mp4', isImage: false, label: 'BRAIN -- AI ANALYST' },
    { to: '/news', icon: Newspaper, name: 'NEWS', sub: 'Verify Content', desc: 'Paste any headline or claim. Get a credibility verdict instantly.', count: stats.newsToday, limit: 3, src: '/assets/video/cdd8c26722152919a8539f357363c238.jpg', isImage: true, label: 'NEWS -- VERIFY CONTENT' },
  ]

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const scansToday = stats.eyesToday + stats.noseToday + stats.newsToday

  // Mock weekly data — last 6 days + today
  const weekData = [2, 1, 3, 4, 2, 1, scansToday]

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: 1200, margin: '0 auto', overflowX: 'hidden' }}>

        {/* ─── Greeting ──────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(20px, 3.5vw, 36px)', lineHeight: 1 }}>
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

        {/* ─── Stats row ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 40 }}>
          {[
            { label: 'Scans Today', value: scansToday, color: 'var(--chrome-mid)' },
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
              style={{ padding: '16px 20px', borderRadius: 16 }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 8 }}>{label.toUpperCase()}</p>
              <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1, color: loading ? 'var(--text-3)' : color }}>
                {loading ? '-' : value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ─── Breach Detection (redesigned) ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ marginBottom: 40 }}
        >
          <div style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'linear-gradient(135deg, rgba(8,8,8,0.97) 0%, rgba(14,14,14,0.7) 100%)',
            padding: 'clamp(28px, 5vw, 52px)',
          }}>
            {/* Grid texture */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)`,
              backgroundSize: '44px 44px',
            }} />
            {/* Danger glow corner */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,45,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start', justifyContent: 'space-between' }}>

              {/* Left: Typography */}
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <ShieldAlert size={13} style={{ color: 'var(--danger)', opacity: 0.7 }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>
                    credential intelligence
                  </span>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 300, fontSize: 'clamp(10px, 1.8vw, 12px)', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', marginBottom: 2 }}>
                    DATA
                  </p>
                  <h2 style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: 'clamp(64px, 11vw, 108px)',
                    lineHeight: 0.82,
                    letterSpacing: '0.04em',
                    marginBottom: 3,
                    background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.35) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    BREACH
                  </h2>
                  <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(14px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.1)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    DETECTION ENGINE
                  </p>
                </div>

                <p style={{ fontFamily: 'Syne', fontWeight: 400, fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.72, maxWidth: 360, marginBottom: 28 }}>
                  Scan any email address, password, or phone number
                  against known data breach databases.
                  D0B3RMAN checks credentials instantly.
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['HaveIBeenPwned', 'Breach Databases', 'Credential Exposure'].map((tag) => (
                    <span key={tag} style={{
                      fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.28)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      padding: '5px 12px', borderRadius: 6, textTransform: 'uppercase',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Live stats + input mockup */}
              <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-3)' }}>DAILY QUOTA</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: '0.04em', color: 'var(--chrome-mid)', lineHeight: 1 }}>
                    {stats.eyesToday}<span style={{ fontSize: 16, color: 'var(--text-3)' }}>/3</span>
                  </span>
                </div>

                {/* Credential input mock */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.18)', flex: 1, letterSpacing: '0.04em' }}>
                    email@example.com
                  </span>
                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={() => navigate('/nose')}
                    style={{ background: 'none', border: 'none', padding: 0, display: 'flex' }}
                  >
                    <ArrowRight size={14} style={{ color: 'var(--text-3)' }} />
                  </motion.button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.18)' }}>ZERO DATA RETAINED</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { val: '14B+', label: 'RECORDS', color: 'var(--danger)' },
                    { val: '500+', label: 'SOURCES', color: 'var(--warning)' },
                    { val: '<1s', label: 'SCAN TIME', color: 'var(--safe)' },
                    { val: '100%', label: 'ENCRYPTED', color: 'var(--chrome-mid)' },
                  ].map(({ val, label, color }) => (
                    <div key={label} style={{
                      padding: '14px 12px', borderRadius: 12, textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.04em', color, lineHeight: 1 }}>{val}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-3)', marginTop: 4 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Module cards ──────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 20 }}>
            MODULES
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {moduleCards.map(({ to, icon: Icon, name, sub, desc, count, limit, src, isImage, label }, i) => (
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
                    {label}
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

        {/* ─── Security Intelligence charts ──────────────── */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 20 }}>
            SECURITY INTELLIGENCE
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

            {/* Weekly activity */}
            <motion.div
              className="glass"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ padding: '24px', borderRadius: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)' }}>7-DAY ACTIVITY</p>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.04em', color: 'var(--chrome-mid)', lineHeight: 1 }}>
                  {weekData.reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <WeeklyBarChart data={weekData} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.08em' }}>LAST WEEK</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--chrome-mid)', letterSpacing: '0.08em' }}>TODAY</span>
              </div>
            </motion.div>

            {/* Module health rings */}
            <motion.div
              className="glass"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ padding: '24px', borderRadius: 20 }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 22 }}>MODULE HEALTH</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ModuleRing label="EYES TODAY" value={stats.eyesToday} max={3} color="var(--chrome-mid)" />
                <ModuleRing label="NOSE TODAY" value={stats.noseToday} max={3} color="var(--warning)" />
                <ModuleRing label="BRAIN TODAY" value={stats.brainToday} max={10} color="var(--safe)" />
              </div>
            </motion.div>

            {/* Threat gauge */}
            <motion.div
              className="glass"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ padding: '24px', borderRadius: 20 }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>THREAT GAUGE</p>
              <ThreatArc threats={stats.threatsDetected} total={stats.eyesTotal + stats.noseTotal} />
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-3)' }}>DETECTION RATE</p>
                <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${stats.eyesTotal + stats.noseTotal > 0 ? (stats.threatsDetected / (stats.eyesTotal + stats.noseTotal)) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    style={{ height: '100%', borderRadius: 2, background: 'var(--danger)' }}
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ─── Activity feed ─────────────────────────────── */}
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

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
      </div>
    </Layout>
  )
}
