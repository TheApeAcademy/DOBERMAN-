import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Clock, ExternalLink, ChevronRight, Zap, Globe } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel } from '../lib/utils'
import { GlobeEmbed } from '../components/3d/GlobeEmbed'
import { useCyberNews, SOURCE_COLORS, timeAgo } from '../hooks/useCyberNews'

interface ActivityItem {
  id: string
  type: 'eyes' | 'brain' | 'news'
  label: string
  result?: string
  created_at: string
}

interface Stats {
  eyesTotal: number
  brainTotal: number
  threatsDetected: number
  eyesToday: number
  brainToday: number
  newsToday: number
  breachToday: number
}

function BarChart({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, marginBottom: 8 }}>
        {data.map((d, i) => (
          <div key={d.day} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: `${Math.max((d.count / max) * 100, 5)}%`, opacity: 1 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: true }}
              style={{ width: '100%', background: d.count > 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)', borderRadius: '3px 3px 0 0', minHeight: 3 }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map((d) => (
          <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 9, color: 'rgba(255,255,255,0.22)' }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1
  const r = 36
  const circ = 2 * Math.PI * r
  let cumulative = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={88} height={88} viewBox="0 0 88 88" style={{ flexShrink: 0 }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        {data.map((d, i) => {
          const dash = (d.count / total) * circ
          const gap = circ - dash
          const offset = -(cumulative / total) * circ
          cumulative += d.count
          if (d.count === 0) return null
          return (
            <motion.circle
              key={d.label}
              cx={44} cy={44} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={circ / 4 + offset}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              viewport={{ once: true }}
            />
          )
        })}
        <text x={44} y={48} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={13} fontFamily="Inter" fontWeight={700}>{total}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{d.label}</span>
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const CYBER_HEADLINES = [
  { id: 1, source: 'THREATPOST', tag: 'CRITICAL', text: 'New zero-day exploit targets 200M Windows devices via CLFS driver vulnerability', time: '3m ago', color: '#FF2D2D' },
  { id: 2, source: 'DARK READING', tag: 'WARNING', text: 'AI-generated deepfake audio used in $25M corporate wire transfer fraud', time: '11m ago', color: '#FF9500' },
  { id: 3, source: 'BLEEPING COMPUTER', tag: 'ALERT', text: 'Massive botnet of 40,000 compromised IoT cameras targeting financial sector', time: '28m ago', color: '#FF6B35' },
  { id: 4, source: 'THE HACKER NEWS', tag: 'CRITICAL', text: 'State-sponsored group deploys rootkit via malicious firmware updates to routers', time: '44m ago', color: '#FF2D2D' },
  { id: 5, source: 'WIRED', tag: 'WARNING', text: 'Phishing campaign impersonating GitHub 2FA notices hitting 2M+ developers', time: '1h ago', color: '#FF9500' },
  { id: 6, source: 'CISA.GOV', tag: 'INFO', text: 'CISA adds four newly exploited vulnerabilities to Known Exploited Catalog', time: '2h ago', color: '#666' },
  { id: 7, source: 'KREBS ON SECURITY', tag: 'ALERT', text: 'Ransomware group LockBit 4.0 claims breach of three critical infrastructure operators', time: '3h ago', color: '#FF6B35' },
  { id: 8, source: 'ARS TECHNICA', tag: 'WARNING', text: 'Supply chain attack found in popular npm package with 8M weekly downloads', time: '4h ago', color: '#FF9500' },
  { id: 9, source: 'GOOGLE SECURITY', tag: 'INFO', text: 'Google patches 47 Android vulnerabilities including actively exploited privilege escalation', time: '5h ago', color: '#666' },
  { id: 10, source: 'RECORDED FUTURE', tag: 'ALERT', text: 'Nation-state actor uses synthetic media in disinformation operation targeting elections', time: '6h ago', color: '#FF6B35' },
]

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<Stats>({
    eyesTotal: 0, brainTotal: 0, threatsDetected: 0,
    eyesToday: 0, brainToday: 0, newsToday: 0, breachToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [visibleHeadlines, setVisibleHeadlines] = useState(4)
  const { articles: newsArticles, loading: newsLoading } = useCyberNews()
  const [weekData, setWeekData] = useState<{ day: string; count: number }[]>([])
  const [moduleBreakdown, setModuleBreakdown] = useState<{ label: string; count: number; color: string }[]>([])

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

    setActivity([
      ...eyes.map((e) => ({ id: e.id, type: 'eyes' as const, label: e.file_name || 'Unnamed file', result: e.result, created_at: e.created_at })),
      ...brain.map((b) => ({ id: b.id, type: 'brain' as const, label: b.title || 'Conversation', created_at: b.created_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6))

    setStats({
      eyesTotal: eyes.length,
      brainTotal: brain.length,
      threatsDetected: eyes.filter((e) => e.result === 'fake').length,
      eyesToday: todayLogs.filter((l) => l.module === 'eyes').length,
      brainToday: todayLogs.filter((l) => l.module === 'brain').length,
      newsToday: todayLogs.filter((l) => l.module === 'news').length,
      breachToday: todayLogs.filter((l) => l.module === 'breach').length,
    })

    const now = new Date()
    setWeekData(Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      return {
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3).toUpperCase(),
        count: logs.filter((l) => { const t = new Date(l.created_at); return t >= start && t <= end }).length,
      }
    }))

    setModuleBreakdown([
      { label: 'D.F.I.', count: logs.filter((l) => l.module === 'eyes').length, color: 'rgba(255,255,255,0.65)' },
      { label: 'BREACH', count: logs.filter((l) => l.module === 'breach').length, color: '#CD853F' },
      { label: 'DAYE', count: logs.filter((l) => l.module === 'brain').length, color: '#30D158' },
      { label: 'NEWS', count: logs.filter((l) => l.module === 'news').length, color: '#FF6B35' },
    ])

    setLoading(false)
  }

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px clamp(16px, 4vw, 48px) 96px' }}>

          {/* ── HEADER ────────────────────────────────────── */}
          <div style={{ marginBottom: 72 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.18)', marginBottom: 20 }}>
              DASHBOARD -- {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
            <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1, marginBottom: 14 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 17, color: 'rgba(255,255,255,0.38)', marginBottom: 32 }}>
              D0B3RMAN is watching. Here's your threat overview.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.03em', color: 'var(--safe)' }}>ALL SYSTEMS ACTIVE</span>
            </div>
          </div>

          {/* ── STATS ─────────────────────────────────────── */}
          <style>{`@media(max-width:600px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}.stats-grid .glass{padding:20px!important}.stats-num{font-size:clamp(32px,8vw,52px)!important}}`}</style>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 96 }}>
            {[
              { label: 'Scans Today', value: stats.eyesToday + stats.newsToday, color: 'var(--chrome-mid)' },
              { label: 'Threats Found', value: stats.threatsDetected, color: 'var(--danger)' },
              { label: 'AI Queries', value: stats.brainToday, color: 'var(--safe)' },
              { label: 'Total Scans', value: stats.eyesTotal, color: 'var(--warning)' },
            ].map(({ label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass" style={{ padding: '28px 32px', borderRadius: 16 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.22)', marginBottom: 12 }}>{label.toUpperCase()}</p>
                <p className="stats-num" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 52, lineHeight: 1, color: loading ? 'rgba(255,255,255,0.08)' : color }}>
                  {loading ? '—' : value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── THREAT PULSE ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 48, padding: '20px 28px', background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.2)' }}>THREAT PULSE — 24H ACTIVITY</p>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(48,209,88,0.6)' }}>● LIVE</span>
            </div>
            <svg width="100%" height="52" viewBox="0 0 600 52" preserveAspectRatio="none" style={{ display: 'block' }}>
              <defs>
                <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(48,209,88,0)" />
                  <stop offset="15%" stopColor="rgba(48,209,88,0.7)" />
                  <stop offset="85%" stopColor="rgba(48,209,88,0.7)" />
                  <stop offset="100%" stopColor="rgba(48,209,88,0)" />
                </linearGradient>
              </defs>
              <path d="M0,26 L60,26 L70,6 L78,46 L86,26 L150,26 L158,12 L164,40 L170,26 L230,26 L238,8 L244,44 L250,26 L310,26 L318,4 L326,48 L334,26 L390,26 L398,10 L404,42 L410,26 L470,26 L478,6 L486,46 L494,26 L600,26" fill="none" stroke="rgba(48,209,88,0.05)" strokeWidth="8" />
              <motion.path
                d="M0,26 L60,26 L70,6 L78,46 L86,26 L150,26 L158,12 L164,40 L170,26 L230,26 L238,8 L244,44 L250,26 L310,26 L318,4 L326,48 L334,26 L390,26 L398,10 L404,42 L410,26 L470,26 L478,6 L486,46 L494,26 L600,26"
                fill="none"
                stroke="url(#pulseGrad)"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </svg>
            <div style={{ display: 'flex', gap: 24, marginTop: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>SYSTEMS NOMINAL</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>NO ACTIVE THREATS</span>
            </div>
          </motion.div>

          {/* ── MODULES LABEL ─────────────────────────────── */}
          <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.18)', marginBottom: 36 }}>MODULES</p>

          {/* ── EYES — DEEPFAKE DETECTION ─────────────────── */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/eyes')}
            style={{ padding: 40, borderRadius: 24, marginBottom: 32, overflow: 'hidden', cursor: 'pointer' }}
          >
            <style>{`@media(max-width:768px){.dfi-grid{grid-template-columns:1fr!important}.dfi-video{order:-1!important;height:140px!important}}`}</style>
            <div className="dfi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>01 -- DEEPFAKE DETECTION</p>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px, 5.5vw, 72px)', letterSpacing: '0.05em', lineHeight: 0.9, marginBottom: 28 }}>
                  DEEP FAKE<br />INTELLIGENCE
                </h2>
                <p style={{ fontFamily: 'Inter', fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: 28 }}>
                  Upload any image, video, or audio. D0B3RMAN's detection engine analyzes it against known deepfake signatures and returns a trust score in seconds.
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginBottom: 32 }}>
                  Hive AI · XceptionNet · EfficientNet · MesoNet
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stats.eyesToday}/3 today</span>
                  <div style={{ width: 100, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
                    <div style={{ height: '100%', borderRadius: 1, background: 'var(--chrome-mid)', width: `${Math.min((stats.eyesToday / 3) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.28)', marginLeft: 4 }} />
                </div>
              </div>
              <div className="dfi-video" style={{ position: 'relative', height: 280, borderRadius: 16, overflow: 'hidden', background: '#060606' }}>
                <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
                  <source src="/assets/video/blob-nose.mp4" type="video/mp4" />
                </video>
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.38)', zIndex: 2 }}>
                  DEEPFAKE INTELLIGENCE
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── GLOBAL THREAT LEVEL ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7 }}
            className="glass"
            style={{ padding: '24px 32px', borderRadius: 20, marginBottom: 32, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center', overflow: 'hidden' }}
          >
            <div>
              <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)', marginBottom: 12 }}>GLOBAL THREAT LEVEL</p>
              <div style={{ position: 'relative', width: 130, height: 76 }}>
                <svg width={130} height={76} viewBox="0 0 130 76">
                  <path d="M 8,70 A 58,58 0 0,1 122,70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#30D158" />
                      <stop offset="50%" stopColor="#FF9500" />
                      <stop offset="100%" stopColor="#FF2D2D" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M 8,70 A 58,58 0 0,1 122,70"
                    fill="none" stroke="url(#gaugeGrad)" strokeWidth={7} strokeLinecap="round"
                    strokeDasharray="181"
                    initial={{ strokeDashoffset: 181 }}
                    whileInView={{ strokeDashoffset: 181 * 0.26 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
                  />
                  <text x={65} y={64} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={20} fontFamily="Inter" fontWeight={700}>74</text>
                  <text x={65} y={76} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="Inter">/100</text>
                </svg>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'MALWARE', val: 82, color: '#FF2D2D' },
                { label: 'PHISHING', val: 67, color: '#FF9500' },
                { label: 'DEEPFAKE', val: 55, color: '#FF6B35' },
                { label: 'DATA BREACH', val: 74, color: '#CD853F' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)', width: 80, flexShrink: 0 }}>{label}</span>
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ height: '100%', background: color, borderRadius: 1 }}
                    />
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 24, textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: '0.04em', color: '#FF9500', lineHeight: 1 }}>HIGH</p>
              <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>THREAT INDEX</p>
            </div>
          </motion.div>

          {/* ── CYBER GLOBE — free-standing 3D globe, text on top ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            onClick={() => navigate('/globe')}
            style={{
              position: 'relative',
              marginLeft: 'calc(-1 * clamp(16px, 4vw, 48px))',
              marginRight: 'calc(-1 * clamp(16px, 4vw, 48px))',
              marginBottom: 32,
              overflow: 'hidden',
              cursor: 'pointer',
              height: 'clamp(400px, 55vw, 560px)',
              background: '#000508',
            }}
          >
            {/* 3D Globe — fills the section, pointer-events none so clicks reach parent */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <GlobeEmbed height={900} />
            </div>

            {/* Left gradient for text readability */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,5,20,0.9) 0%, rgba(0,5,20,0.5) 45%, transparent 72%)', pointerEvents: 'none' }} />

            {/* Text overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 'clamp(28px, 5vw, 72px)',
              zIndex: 10,
              maxWidth: '52%',
              pointerEvents: 'none',
            }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.1em', color: 'rgba(0,150,255,0.8)', marginBottom: 16, textTransform: 'uppercase' }}>
                Global Cyber Intelligence
              </p>
              <h3 style={{
                fontFamily: 'Bebas Neue',
                fontSize: 'clamp(72px, 9vw, 120px)',
                letterSpacing: '0.06em',
                lineHeight: 0.88,
                marginBottom: 24,
                color: '#fff',
                textShadow: '0 0 60px rgba(0,150,255,0.25)',
              }}>
                CYBER<br />GLOBE
              </h3>
              <p style={{ fontFamily: 'Inter', fontSize: 'clamp(13px, 1.5vw, 16px)', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, marginBottom: 20, maxWidth: 360 }}>
                Explore real-time cyber threat levels across every nation. DAYE's intelligence brief on any country — interactive, live, and global.
              </p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(0,150,255,0.5)', letterSpacing: '0.04em' }}>
                All Countries · Risk Scores · DAYE Briefs · Live Threats
              </p>
            </div>
          </motion.div>

          {/* ── BRAIN — AI ANALYST ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
            onClick={() => navigate('/brain')}
            style={{ borderRadius: 24, marginBottom: 32, overflow: 'hidden', background: '#000', textAlign: 'center', cursor: 'pointer' }}
          >
            {/* DAYE hero visual */}
            <div style={{ position: 'relative', width: '100%', height: 'clamp(260px, 50vw, 520px)', overflow: 'hidden', background: '#060606' }}>
              <video
                autoPlay muted loop playsInline preload="auto"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', display: 'block', pointerEvents: 'none' }}
              >
                <source src="/assets/video/blob-di.mp4" type="video/mp4" />
              </video>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.95))', pointerEvents: 'none' }} />
            </div>

            {/* Text below */}
            <div style={{ padding: '32px clamp(20px,5vw,48px) 56px', overflow: 'hidden' }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.28)', marginBottom: 28 }}>
                02 -- AI SECURITY ANALYST
              </p>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(64px, 10vw, 120px)', letterSpacing: '0.08em', lineHeight: 0.88, marginBottom: 28, overflow: 'hidden', color: 'var(--safe)' }}>
                DAYE
              </h2>
              <p style={{ fontFamily: 'Inter', fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.7 }}>
                Ask anything. DAYE responds in plain language and gives you a concrete next step. Like having a security analyst on call 24/7.
              </p>
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(48,209,88,0.3)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 40px', background: 'var(--safe)', color: '#000', fontFamily: 'Inter', fontWeight: 700, fontSize: 15, borderRadius: 12 }}
              >
                Chat with DAYE
                <ArrowRight size={16} />
              </motion.div>
            </div>
          </motion.div>

          {/* ── NEWS VERIFICATION ─────────────────────────── */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/news')}
            style={{ padding: 40, borderRadius: 24, marginBottom: 32, overflow: 'hidden' }}
          >
            <style>{`@media(max-width:768px){.news-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>03 -- VERIFY CONTENT</p>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px, 5.5vw, 72px)', letterSpacing: '0.05em', lineHeight: 0.9, marginBottom: 28 }}>
                  NEWS<br />VERIFICATION
                </h3>
                <p style={{ fontFamily: 'Inter', fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: 28 }}>
                  Paste any headline, claim, or article URL. D0B3RMAN cross-references it, checks source quality, and gives you a credibility verdict in seconds.
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginBottom: 32 }}>
                  Cross-reference · Source Quality · Fact Check
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stats.newsToday}/3 today</span>
                  <div style={{ width: 100, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
                    <div style={{ height: '100%', borderRadius: 1, background: 'var(--chrome-mid)', width: `${Math.min((stats.newsToday / 3) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.28)', marginLeft: 4 }} />
                </div>
              </div>
              <div style={{ position: 'relative', height: 280, borderRadius: 16, overflow: 'hidden', background: '#060606' }}>
                <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
                  <source src="/assets/video/blob-news.mp4" type="video/mp4" />
                </video>
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.38)', zIndex: 2 }}>
                  NEWS -- VERIFY CONTENT
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── DETECTION ACCURACY ───────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 32, padding: '22px 28px', background: 'rgba(255,255,255,0.012)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.2)' }}>MODULE ACCURACY — ALL TIME</p>
              <span style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.06em', color: 'var(--safe)' }}>97.3%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Deep Fake Intelligence', pct: 97, color: 'rgba(255,255,255,0.55)' },
                { label: 'Data Breach Detection', pct: 99, color: '#CD853F' },
                { label: 'News Verification', pct: 94, color: '#FF6B35' },
                { label: 'DAYE Intelligence', pct: 98, color: 'var(--safe)' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 400, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 1, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      style={{ height: '100%', background: color, borderRadius: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── BREACH SCAN (redesigned) ──────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
            onClick={() => navigate('/breach')}
            style={{
              position: 'relative', borderRadius: 28, marginBottom: 48, overflow: 'hidden', cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(20,10,4,0.99) 0%, rgba(42,20,8,0.88) 100%)',
              border: '1px solid rgba(205,133,63,0.22)',
              padding: 'clamp(32px, 5vw, 56px)',
            }}
          >
            {/* Warm grid texture */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(205,133,63,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(205,133,63,0.028) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />
            {/* Amber glow top-right */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(205,133,63,0.09) 0%,transparent 68%)', pointerEvents: 'none', zIndex: 0 }} />
            {/* Bottom-left warm bleed */}
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,69,19,0.06) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            {/* Massive watermark "04" */}
            <div style={{ position: 'absolute', top: -20, right: 8, fontFamily: 'Bebas Neue', fontSize: 'clamp(120px,22vw,220px)', letterSpacing: '0.02em', color: 'rgba(205,133,63,0.04)', lineHeight: 1, pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}>04</div>

            <style>{`@media(max-width:768px){.breach-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="breach-grid" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'flex-start' }}>

              {/* Left: typographic hero */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                  <Zap size={11} style={{ color: 'rgba(205,133,63,0.7)' }} />
                  <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(205,133,63,0.55)', textTransform: 'uppercase' }}>04 — CREDENTIAL INTELLIGENCE</p>
                </div>
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: 'Syne', fontWeight: 100, fontSize: 'clamp(8px,1.2vw,10px)', letterSpacing: '0.55em', color: 'rgba(205,133,63,0.35)', textTransform: 'uppercase', marginBottom: 0 }}>CREDENTIAL</p>
                  <p style={{ fontFamily: 'Syne', fontWeight: 200, fontSize: 'clamp(9px,1.4vw,11px)', letterSpacing: '0.4em', color: 'rgba(205,133,63,0.28)', textTransform: 'uppercase', marginBottom: 2 }}>DATA</p>
                  <h3 style={{
                    fontFamily: 'Bebas Neue',
                    fontSize: 'clamp(68px, 10vw, 116px)',
                    letterSpacing: '0.04em', lineHeight: 0.8, marginBottom: 6,
                    background: 'linear-gradient(135deg, #D4A44E 0%, #CD853F 55%, #8B4513 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    BREACH
                  </h3>
                  <p style={{ fontFamily: 'Syne', fontWeight: 900, fontSize: 'clamp(14px,2.2vw,21px)', color: 'rgba(205,133,63,0.07)', letterSpacing: '-0.02em', lineHeight: 1, textTransform: 'uppercase' }}>
                    DETECTION ENGINE
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.28em', color: 'rgba(205,133,63,0.2)', marginTop: 10, textTransform: 'uppercase' }}>
                    HAVEIBEENPWNED · HIBP · DEHASHED
                  </p>
                </div>
                <p style={{ fontFamily: 'Syne', fontWeight: 300, fontSize: 'clamp(13px,1.6vw,15px)', color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, maxWidth: 360, marginBottom: 28 }}>
                  Scan any email, password, or phone number against known breach databases. D0B3RMAN checks instantly — no data ever retained.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
                  {['HaveIBeenPwned', 'Breach Databases', 'Credential Exposure'].map((t) => (
                    <span key={t} style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.14em', color: 'rgba(205,133,63,0.6)', background: 'rgba(205,133,63,0.06)', border: '1px solid rgba(205,133,63,0.2)', padding: '5px 12px', borderRadius: 6, textTransform: 'uppercase' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(205,133,63,0.45)' }}>{stats.breachToday}/3 today</span>
                  <div style={{ width: 80, height: 2, background: 'rgba(205,133,63,0.12)', borderRadius: 1 }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min((stats.breachToday / 3) * 100, 100)}%` }} transition={{ duration: 1 }} viewport={{ once: true }} style={{ height: '100%', borderRadius: 1, background: 'linear-gradient(to right, #CD853F, #D4A44E)' }} />
                  </div>
                  <ArrowRight size={14} style={{ color: 'rgba(205,133,63,0.4)' }} />
                </div>
              </div>

              {/* Right: stat cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(205,133,63,0.12)' }}>
                  <span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(205,133,63,0.4)', textTransform: 'uppercase' }}>Daily Quota</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: '0.04em', color: '#CD853F', lineHeight: 1 }}>
                    {stats.breachToday}<span style={{ fontSize: 16, color: 'rgba(205,133,63,0.35)' }}>/3</span>
                  </span>
                </div>
                {/* Credential input mockup */}
                <div style={{ padding: '13px 18px', borderRadius: 14, background: 'rgba(205,133,63,0.04)', border: '1px solid rgba(205,133,63,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(205,133,63,0.25)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.18)', flex: 1 }}>email@example.com</span>
                  <ArrowRight size={12} style={{ color: 'rgba(205,133,63,0.45)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(205,133,63,0.09)' }} />
                  <span style={{ fontFamily: 'Inter', fontSize: 8, letterSpacing: '0.16em', color: 'rgba(205,133,63,0.3)', textTransform: 'uppercase' }}>Zero Data Retained</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(205,133,63,0.09)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { val: '14B+', label: 'RECORDS', color: '#D4A44E' },
                    { val: '500+', label: 'SOURCES', color: '#CD853F' },
                    { val: '<1s', label: 'SCAN TIME', color: '#A0522D' },
                    { val: '100%', label: 'ENCRYPTED', color: 'rgba(212,164,78,0.6)' },
                  ].map(({ val, label, color }) => (
                    <div key={label} style={{ padding: '14px 12px', borderRadius: 12, textAlign: 'center', background: 'rgba(205,133,63,0.04)', border: '1px solid rgba(205,133,63,0.12)' }}>
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.04em', color, lineHeight: 1 }}>{val}</p>
                      <p style={{ fontFamily: 'Inter', fontSize: 8, letterSpacing: '0.14em', color: 'rgba(205,133,63,0.38)', marginTop: 4 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── ACTIVITY CHARTS ───────────────────────────── */}
          <style>{`@media(max-width:640px){.charts-grid{grid-template-columns:1fr!important}}`}</style>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 96 }}
          >
            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.18)', marginBottom: 24 }}>ACTIVITY OVERVIEW</p>
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="glass" style={{ padding: '24px 28px', borderRadius: 16 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.22)', marginBottom: 20 }}>7-DAY SCAN ACTIVITY</p>
                {loading ? (
                  <div style={{ height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
                ) : (
                  <BarChart data={weekData} />
                )}
              </div>
              <div className="glass" style={{ padding: '24px 28px', borderRadius: 16 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.22)', marginBottom: 20 }}>MODULE BREAKDOWN</p>
                {loading ? (
                  <div style={{ height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />
                ) : (
                  <DonutChart data={moduleBreakdown} />
                )}
              </div>
            </div>
          </motion.div>

          {/* ── LIVE INTELLIGENCE FEED — Full-screen Samsung News style ── */}
        </div>

        {/* Full-width / full-screen news section — outside the maxWidth container */}
        <div style={{ minHeight: '100vh', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '40px clamp(16px, 4vw, 48px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Samsung News-style header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.3)' }}>LIVE</span>
              </div>
              <button onClick={() => navigate('/news')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none' }}>
                <ExternalLink size={11} />
                Verify
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 36px)', display: 'flex', alignItems: 'center', gap: 8 }}>
                Top Stories <ChevronRight size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </h2>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
              </span>
            </div>

            {/* Hero story card */}
            <div
              style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 'clamp(220px, 38vh, 340px)', marginBottom: 4, flexShrink: 0, cursor: 'pointer' }}
              onClick={() => navigate('/news')}
            >
              <img src="/assets/video/cdd8c26722152919a8539f357363c238.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.92) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(255,45,45,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 10, color: '#fff' }}>T</span>
                  </div>
                  <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>THREATPOST</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>2 hours ago</span>
                </div>
                <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(17px, 2.5vw, 22px)', lineHeight: 1.3, color: '#fff', maxWidth: 680 }}>
                  Critical zero-day exploit targets Windows devices via CLFS driver vulnerability — patch required immediately
                </h3>
              </div>
            </div>

            {/* Story list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="popLayout">
                {CYBER_HEADLINES.slice(0, visibleHeadlines).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate('/news')}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: item.color + '22', border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 9, color: item.color }}>{item.source[0]}</span>
                        </div>
                        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>{item.source}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(14px, 1.8vw, 16px)', color: '#fff', lineHeight: 1.35, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.text}
                      </p>
                      <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{item.time}</span>
                    </div>
                    <div style={{ width: 88, height: 68, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: `linear-gradient(135deg, ${item.color}25, rgba(10,10,10,0.9))`, border: `1px solid ${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Bebas Neue', fontSize: 11, letterSpacing: '0.15em', color: item.color, opacity: 0.7 }}>{item.tag}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {visibleHeadlines < CYBER_HEADLINES.length ? (
                <button
                  onClick={() => setVisibleHeadlines(CYBER_HEADLINES.length)}
                  style={{ width: '100%', padding: '18px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}
                >
                  <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                  {CYBER_HEADLINES.length - visibleHeadlines} more stories
                </button>
              ) : (
                <button
                  onClick={() => navigate('/news')}
                  style={{ width: '100%', padding: '18px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: 'var(--danger)', marginTop: 4 }}
                >
                  <ExternalLink size={14} />
                  Verify any headline
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Back inside the padded container for remaining sections */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px clamp(16px, 4vw, 48px) 96px' }}>

          {/* ── DOBERMAN PORTRAIT ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: '-60px' }}
            style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 80, position: 'relative', height: 520 }}
          >
            <img
              src="/assets/video/b78ad4f230a4015d24a420fce2a7d53b.jpg"
              alt="D0B3RMAN"
              onError={(e) => { const p = e.currentTarget.parentElement; if (p) p.style.display = 'none' }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #000 100%)' }} />
            <div style={{ position: 'absolute', bottom: 44, left: 44 }}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.92)', lineHeight: 1 }}>D0B3RMAN</p>
              <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.28)', marginTop: 10 }}>THE WATCHDOG IS WATCHING</p>
            </div>
          </motion.div>

          {/* ── RECENT ACTIVITY ────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.18)' }}>RECENT ACTIVITY</p>
              <button onClick={() => navigate('/history')} style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: 'none' }}>View all</button>
            </div>
            <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 4, marginBottom: 6, width: '60%' }} />
                      <div style={{ height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '30%' }} />
                    </div>
                  </div>
                ))
              ) : activity.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No activity yet. Run your first scan.</p>
                </div>
              ) : (
                activity.map((item, i) => {
                  const typeLabel: Record<string, string> = { eyes: 'D.F.I.', brain: 'D0B3RMAN I.', news: 'NEWS' }
                  const IconComp = item.type === 'brain' ? Zap : item.type === 'news' ? ExternalLink : Shield
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ padding: '14px 20px', borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconComp size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{item.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />
                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatRelativeTime(item.created_at)}</span>
                          <span style={{ fontFamily: 'Inter', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.03em' }}>{typeLabel[item.type]}</span>
                          {item.result && (
                            <span style={{ fontFamily: 'Inter', fontSize: 10, color: getResultLabel(item.result).color, background: `${getResultLabel(item.result).color}22`, padding: '2px 6px', borderRadius: 4 }}>
                              {getResultLabel(item.result).label}
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
        </div>
      </div>
        {/* ── Live Intel News ── */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Live Intel</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.18)', borderRadius: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2D2D', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontFamily: 'Inter', fontSize: 8, letterSpacing: '0.12em', color: '#FF2D2D', textTransform: 'uppercase' }}>Live</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => navigate('/globe')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Globe size={11} /> Threat Globe
              </button>
              <button onClick={() => navigate('/news')}
                style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                View all →
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10 }}>
            {newsLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 3, width: '40%', marginBottom: 10 }} />
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.07)', borderRadius: 3, marginBottom: 5 }} />
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 3, width: '70%' }} />
                  </div>
                ))
              : newsArticles.slice(0, 4).map((article, i) => {
                  const srcColor = SOURCE_COLORS[article.source_name] || 'rgba(255,255,255,0.4)'
                  return (
                    <motion.button key={article.article_url}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -3, borderColor: 'rgba(255,255,255,0.12)' }}
                      onClick={() => navigate('/news')}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'block', width: '100%' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: srcColor, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Inter', fontSize: 8, letterSpacing: '0.08em', color: srcColor, flex: 1 }}>{article.source_name.toUpperCase()}</span>
                        <span style={{ fontFamily: 'Inter', fontSize: 8, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={7} />{timeAgo(article.published_at)}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.title}
                      </p>
                    </motion.button>
                  )
                })}
          </div>
        </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </Layout>
  )
}
