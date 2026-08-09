import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Clock, ExternalLink, ChevronRight, Zap, BookOpen, Download } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel } from '../lib/utils'
import { GlobeEmbed } from '../components/3d/GlobeEmbed'
import { useCyberNews, SOURCE_COLORS, timeAgo } from '../hooks/useCyberNews'
import { GridLines } from '../components/ui/GridLines'

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
              style={{ width: '100%', background: d.count > 0 ? 'var(--ovw-0p55)' : 'var(--ovw-0p08)', borderRadius: '3px 3px 0 0', minHeight: 3 }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map((d) => (
          <div key={d.day} style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 9, color: 'var(--ovw-0p22)' }}>{d.day}</span>
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
        <circle cx={44} cy={44} r={r} fill="none" stroke="var(--ovw-0p06)" strokeWidth={10} />
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
        <text x={44} y={48} textAnchor="middle" fill="var(--ovw-0p7)" fontSize={13} fontFamily="Inter" fontWeight={700}>{total}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p45)', flex: 1 }}>{d.label}</span>
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p25)' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


function ModuleTile({
  onClick, kicker, title, description, meta, media, progress, footer, accentColor = 'var(--chrome-mid)',
}: {
  onClick: () => void
  kicker: string
  title: ReactNode
  description: string
  meta?: string
  media: ReactNode
  progress?: { value: number; max: number }
  footer?: ReactNode
  accentColor?: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      style={{ position: 'relative', aspectRatio: '1', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', background: '#060606' }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>{media}</div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 32%, rgba(0,0,0,0.95) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(20px,3vw,32px)', zIndex: 2 }}>
        <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.08em', color: 'var(--ovw-0p4)', marginBottom: 10 }}>{kicker}</p>
        <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 'clamp(30px,3.2vw,46px)', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: 12, color: '#fff' }}>{title}</h3>
        <p style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--ovw-0p52)', lineHeight: 1.55, marginBottom: meta ? 8 : 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</p>
        {meta && <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--ovw-0p22)', marginBottom: 14 }}>{meta}</p>}
        {footer ?? (progress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p35)', whiteSpace: 'nowrap' }}>{progress.value}/{progress.max} today</span>
            <div style={{ flex: 1, maxWidth: 90, height: 2, background: 'var(--ovw-0p08)', borderRadius: 1 }}>
              <div style={{ height: '100%', borderRadius: 1, background: accentColor, width: `${Math.min((progress.value / progress.max) * 100, 100)}%` }} />
            </div>
            <ArrowRight size={14} style={{ color: 'var(--ovw-0p35)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

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
      { label: 'D.F.I.', count: logs.filter((l) => l.module === 'eyes').length, color: 'var(--ovw-0p65)' },
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
      <div style={{ background: 'var(--void)', minHeight: '100vh', position: 'relative' }}>
        {/* Grid lines background — same subtle texture as the Auth page */}
        <GridLines />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px clamp(16px, 4vw, 48px) 96px', position: 'relative', zIndex: 1 }}>

          {/* ── HEADER ────────────────────────────────────── */}
          <div style={{ marginBottom: 72 }}>
            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'var(--ovw-0p18)', marginBottom: 20 }}>
              DASHBOARD -- {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
            <h1 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1, marginBottom: 14 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontFamily: 'Inter', fontSize: 17, color: 'var(--ovw-0p38)', marginBottom: 32 }}>
              D0B3RMAN is watching. Here's your threat overview.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.03em', color: 'var(--text-1)' }}>ALL SYSTEMS ACTIVE</span>
            </div>
          </div>

          {/* ── STATS ─────────────────────────────────────── */}
          <style>{`@media(max-width:600px){.stats-grid{gap:8px!important}.stats-hex{width:clamp(84px,19vw,116px)!important}.stats-num{font-size:clamp(24px,7vw,34px)!important}}`}</style>
          <div className="stats-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 96 }}>
            {[
              { label: 'Threats Found', value: stats.threatsDetected, color: 'var(--danger)' },
              { label: 'Scans Today', value: stats.eyesToday + stats.newsToday, color: 'var(--chrome-mid)' },
              { label: 'AI Queries', value: stats.brainToday, color: 'var(--safe)' },
              { label: 'Total Scans', value: stats.eyesTotal, color: 'var(--warning)' },
            ].map(({ label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 150px', minWidth: 130 }}>
                <div
                  className="glass stats-hex"
                  style={{
                    width: 'clamp(112px, 14vw, 152px)',
                    aspectRatio: '1 / 0.92',
                    clipPath: 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: loading ? 'none' : `drop-shadow(0 0 14px ${color}33)`,
                  }}
                >
                  <p className="stats-num" style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(28px, 4.2vw, 42px)', lineHeight: 1, color: loading ? 'var(--ovw-0p08)' : color }}>
                    {loading ? '—' : value}
                  </p>
                </div>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'var(--ovw-0p22)', marginTop: 10, textAlign: 'center' }}>
                  {label.toUpperCase()}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── MODULES LABEL ─────────────────────────────── */}
          <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'var(--ovw-0p18)', marginBottom: 36 }}>MODULES</p>

          {/* ── MODULES ROW 1 — DFI + CYBER GLOBE, side by side ── */}
          <style>{`@media(max-width:768px){.modules-row{grid-template-columns:1fr!important}}`}</style>
          <div className="modules-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* EYES — DEEPFAKE DETECTION */}
            <ModuleTile
              onClick={() => navigate('/eyes')}
              kicker="01 -- DEEPFAKE DETECTION"
              title={<>DEEP FAKE<br />INTELLIGENCE</>}
              description="Upload any image, video, or audio. D0B3RMAN analyzes it against known deepfake signatures and returns a trust score in seconds."
              meta="Hive AI · XceptionNet · EfficientNet · MesoNet"
              media={
                <img
                  src="/assets/video/0a068fc3612b18fb193aa68da61d7bb3.jpg"
                  alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', pointerEvents: 'none' }}
                />
              }
              footer={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {stats.eyesToday} scans today <ArrowRight size={14} />
                </div>
              }
            />

            {/* CYBER GLOBE */}
            <ModuleTile
              onClick={() => navigate('/globe')}
              kicker="GLOBAL CYBER INTELLIGENCE"
              title={<>CYBER<br />GLOBE</>}
              description="Explore real-time cyber threat levels across every nation, with DAYE's live intelligence brief on any country."
              meta="All Countries · Risk Scores · DAYE Briefs"
              accentColor="#0A84FF"
              media={<GlobeEmbed height={640} />}
              footer={
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter', fontSize: 11, color: 'rgba(10,132,255,0.65)' }}>
                  Explore the globe <ArrowRight size={14} />
                </div>
              }
            />
          </div>

          {/* ── DAYE — AI SECURITY ANALYST, centered in the middle ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
            onClick={() => navigate('/brain')}
            style={{
              position: 'relative', marginBottom: 20, cursor: 'pointer',
              padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 48px)', textAlign: 'center',
            }}
          >
            <style>{`@media(max-width:480px){.daye-mid-circle{width:176px!important;height:176px!important}}`}</style>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(48,209,88,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="daye-mid-circle" style={{ width: 240, height: 240, borderRadius: '50%', margin: '0 auto 24px', overflow: 'hidden', border: '2px solid rgba(48,209,88,0.35)', boxShadow: '0 0 44px rgba(48,209,88,0.16)', background: '#000' }}>
                {/* Same DAYE logo video as the floating trigger button, so the two are visually the same DAYE identity */}
                <video autoPlay muted loop playsInline preload="auto" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                  <source src="/assets/video/blob-di.mp4" type="video/mp4" />
                </video>
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ovw-0p28)', marginBottom: 16 }}>
                02 -- AI SECURITY ANALYST
              </p>
              <h2 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 'clamp(48px, 6vw, 72px)', letterSpacing: '0.08em', lineHeight: 0.9, marginBottom: 8, color: 'var(--safe)' }}>
                DAYE
              </h2>
              <p style={{ fontFamily: 'Inter', fontSize: 15, color: 'var(--ovw-0p48)', maxWidth: 440, margin: '0 auto 10px', lineHeight: 1.65 }}>
                Ask anything. DAYE responds in plain language and gives you a concrete next step. Like having a security analyst on call 24/7.
              </p>
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(48,209,88,0.3)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 32px', background: 'var(--safe)', color: '#000', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, borderRadius: 12 }}
              >
                Chat with DAYE
                <ArrowRight size={16} />
              </motion.div>
            </div>
          </motion.div>

          {/* ── MODULES ROW 2 — NEWS + BREACH, side by side ── */}
          <div className="modules-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 48 }}>

            {/* NEWS VERIFICATION */}
            <ModuleTile
              onClick={() => navigate('/news')}
              kicker="03 -- VERIFY CONTENT"
              title={<>NEWS<br />VERIFICATION</>}
              description="Paste any headline, claim, or article URL. D0B3RMAN cross-references it and gives you a credibility verdict in seconds."
              meta="Cross-reference · Source Quality · Fact Check"
              progress={{ value: stats.newsToday, max: 3 }}
              media={
                <video autoPlay muted loop playsInline preload="auto" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}>
                  <source src="/assets/video/blob-news.mp4" type="video/mp4" />
                </video>
              }
            />

            {/* BREACH SCAN */}
            <ModuleTile
              onClick={() => navigate('/breach')}
              kicker="04 -- CREDENTIAL INTELLIGENCE"
              title={<span style={{ background: 'linear-gradient(135deg, #D4A44E 0%, #CD853F 55%, #8B4513 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BREACH</span>}
              description="Scan any email, password, or phone number against known breach databases. D0B3RMAN checks instantly — no data ever retained."
              meta="HaveIBeenPwned · HIBP · DeHashed"
              accentColor="#CD853F"
              progress={{ value: stats.breachToday, max: 3 }}
              media={
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,10,4,1) 0%, rgba(42,20,8,0.9) 100%)' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(205,133,63,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(205,133,63,0.035) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                  <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(205,133,63,0.16) 0%,transparent 68%)' }} />
                  <div style={{ position: 'absolute', top: -10, right: -6, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 'clamp(90px,14vw,160px)', color: 'rgba(205,133,63,0.07)', lineHeight: 1, userSelect: 'none' }}>04</div>
                </div>
              }
            />
          </div>

          {/* ── DOBERMAN JOURNAL ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="glass"
            style={{ marginBottom: 32, padding: '24px 28px', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at left, rgba(48,209,88,0.04), transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img
                  src="/pcu-logo.jpeg"
                  alt="PCU"
                  style={{ width: 36, height: 36, objectFit: 'contain' }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.display = 'none'
                    img.insertAdjacentHTML('afterend', '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="var(--safe)" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>')
                  }}
                />
              </div>
              <div>
                <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--ovw-0p85)', marginBottom: 2 }}>DOBERMAN JOURNAL</p>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'var(--ovw-0p28)' }}>B.Sc. Cyber Security · Precious Cornerstone University, Ibadan</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); navigate('/report') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--safe)', color: 'black', fontFamily: 'Inter', fontWeight: 700, fontSize: 12, border: 'none', borderRadius: 10, cursor: 'pointer' }}
              >
                <BookOpen size={13} /> View Report
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); navigate('/report') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--ovw-0p05)', border: '1px solid var(--ovw-0p1)', borderRadius: 10, color: 'var(--ovw-0p6)', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
              >
                <Download size={13} /> Download
              </motion.button>
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
            <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'var(--ovw-0p18)', marginBottom: 24 }}>ACTIVITY OVERVIEW</p>
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="glass chart-card-dark" style={{ padding: '24px 28px', borderRadius: 16 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'var(--ovw-0p22)', marginBottom: 20 }}>7-DAY SCAN ACTIVITY</p>
                {loading ? (
                  <div style={{ height: 100, background: 'var(--ovw-0p03)', borderRadius: 8 }} />
                ) : (
                  <BarChart data={weekData} />
                )}
              </div>
              <div className="glass chart-card-dark" style={{ padding: '24px 28px', borderRadius: 16 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: '0.04em', color: 'var(--ovw-0p22)', marginBottom: 20 }}>MODULE BREAKDOWN</p>
                {loading ? (
                  <div style={{ height: 100, background: 'var(--ovw-0p03)', borderRadius: 8 }} />
                ) : (
                  <DonutChart data={moduleBreakdown} />
                )}
              </div>
            </div>
          </motion.div>

          {/* ── LIVE INTELLIGENCE FEED — Full-screen Samsung News style ── */}
        </div>

        {/* Full-width / full-screen news section — outside the maxWidth container */}
        <div style={{ minHeight: '100vh', background: 'var(--void)', borderTop: '1px solid var(--ovw-0p06)', display: 'flex', flexDirection: 'column', padding: '40px clamp(16px, 4vw, 48px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Samsung News-style header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'var(--ovw-0p3)' }}>LIVE</span>
              </div>
              <button onClick={() => navigate('/news')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p3)', background: 'none', border: 'none' }}>
                <ExternalLink size={11} />
                Verify
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 36px)', display: 'flex', alignItems: 'center', gap: 8 }}>
                Top Stories <ChevronRight size={24} style={{ color: 'var(--ovw-0p5)' }} />
              </h2>
              <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p25)' }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
              </span>
            </div>

            {/* Hero story card — real news */}
            {newsLoading ? (
              <div style={{ borderRadius: 16, overflow: 'hidden', height: 'clamp(220px, 38vh, 340px)', marginBottom: 4, flexShrink: 0, background: 'var(--ovw-0p03)', border: '1px solid var(--ovw-0p05)' }} />
            ) : newsArticles.length > 0 ? (
              <a
                href={newsArticles[0].article_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', height: 'clamp(220px, 38vh, 340px)', marginBottom: 4, flexShrink: 0, display: 'block', textDecoration: 'none' }}
              >
                {newsArticles[0].image_url ? (
                  <img src={newsArticles[0].image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,45,45,0.15), rgba(10,10,10,1))' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.92) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: (SOURCE_COLORS[newsArticles[0].source_name] || '#666') + '33', border: `1px solid ${SOURCE_COLORS[newsArticles[0].source_name] || '#666'}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 10, color: SOURCE_COLORS[newsArticles[0].source_name] || '#aaa' }}>{newsArticles[0].source_name[0]}</span>
                    </div>
                    <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: 'var(--ovw-0p9)', textTransform: 'uppercase' }}>{newsArticles[0].source_name}</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--ovw-0p45)' }}>{timeAgo(newsArticles[0].published_at)}</span>
                  </div>
                  <h3 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 'clamp(17px, 2.5vw, 22px)', lineHeight: 1.3, color: '#fff', maxWidth: 680 }}>
                    {newsArticles[0].title}
                  </h3>
                </div>
              </a>
            ) : null}

            {/* Story list — real news */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {newsLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--ovw-0p06)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 9, background: 'var(--ovw-0p05)', borderRadius: 3, width: '30%', marginBottom: 8 }} />
                      <div style={{ height: 13, background: 'var(--ovw-0p07)', borderRadius: 3, marginBottom: 5 }} />
                      <div style={{ height: 13, background: 'var(--ovw-0p04)', borderRadius: 3, width: '65%' }} />
                    </div>
                    <div style={{ width: 88, height: 68, borderRadius: 10, background: 'var(--ovw-0p03)', flexShrink: 0 }} />
                  </div>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {(newsArticles.length > 1 ? newsArticles.slice(1, visibleHeadlines + 1) : []).map((article, i) => {
                    const srcColor = SOURCE_COLORS[article.source_name] || 'var(--ovw-0p4)'
                    return (
                      <motion.a
                        key={article.article_url}
                        href={article.article_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--ovw-0p06)', textDecoration: 'none' }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 4, background: srcColor + '22', border: `1px solid ${srcColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 9, color: srcColor }}>{article.source_name[0]}</span>
                            </div>
                            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: 'var(--ovw-0p55)' }}>{article.source_name}</span>
                          </div>
                          <p style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--text-1)', lineHeight: 1.35, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {article.title}
                          </p>
                          <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'var(--ovw-0p35)' }}>{timeAgo(article.published_at)}</span>
                        </div>
                        {article.image_url ? (
                          <div style={{ width: 88, height: 68, borderRadius: 10, flexShrink: 0, overflow: 'hidden' }}>
                            <img src={article.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: 88, height: 68, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${srcColor}25, rgba(10,10,10,0.9))`, border: `1px solid ${srcColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 10, letterSpacing: '0.15em', color: srcColor, opacity: 0.7 }}>NEWS</span>
                          </div>
                        )}
                      </motion.a>
                    )
                  })}
                </AnimatePresence>
              )}

              {!newsLoading && newsArticles.length > visibleHeadlines + 1 ? (
                <button
                  onClick={() => setVisibleHeadlines((v) => v + 6)}
                  style={{ width: '100%', padding: '18px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: 'var(--ovw-0p35)', marginTop: 4 }}
                >
                  <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                  More stories
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

          {/* ── RECENT ACTIVITY + DOBERMAN PORTRAIT, side by side ── */}
          <style>{`@media(max-width:900px){.activity-portrait-row{grid-template-columns:1fr!important}.activity-portrait-row .portrait-box{order:-1;height:220px!important}}`}</style>
          <div className="activity-portrait-row" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start', marginBottom: 80 }}>

            {/* Recent activity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: '0.05em', color: 'var(--ovw-0p18)' }}>RECENT ACTIVITY</p>
                <button onClick={() => navigate('/history')} style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: 'none' }}>View all</button>
              </div>
              <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--ovw-0p04)', display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ovw-0p03)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 12, background: 'var(--ovw-0p03)', borderRadius: 4, marginBottom: 6, width: '60%' }} />
                        <div style={{ height: 10, background: 'var(--ovw-0p03)', borderRadius: 4, width: '30%' }} />
                      </div>
                    </div>
                  ))
                ) : activity.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--ovw-0p2)' }}>No activity yet. Run your first scan.</p>
                  </div>
                ) : (
                  activity.map((item, i) => {
                    const typeLabel: Record<string, string> = { eyes: 'D.F.I.', brain: 'D0B3RMAN I.', news: 'NEWS' }
                    const IconComp = item.type === 'brain' ? Zap : item.type === 'news' ? ExternalLink : Shield
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        style={{ padding: '14px 20px', borderBottom: i < activity.length - 1 ? '1px solid var(--ovw-0p04)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ovw-0p04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComp size={14} style={{ color: 'var(--ovw-0p3)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Inter', fontSize: 14, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{item.label}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={10} style={{ color: 'var(--ovw-0p2)' }} />
                            <span style={{ fontFamily: 'Inter', fontSize: 11, color: 'var(--ovw-0p25)' }}>{formatRelativeTime(item.created_at)}</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 9, color: 'var(--ovw-0p2)', letterSpacing: '0.03em' }}>{typeLabel[item.type]}</span>
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

            {/* Doberman portrait — small, right-aligned */}
            <motion.div
              className="portrait-box"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: '-60px' }}
              style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: 380, background: '#000' }}
            >
              <img
                src="/assets/video/b78ad4f230a4015d24a420fce2a7d53b.jpg"
                alt="D0B3RMAN"
                onError={(e) => { const p = e.currentTarget.parentElement; if (p) p.style.display = 'none' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #000 100%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                <p style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif', fontSize: 26, letterSpacing: '0.2em', color: 'var(--ovw-0p92)', lineHeight: 1 }}>D0B3RMAN</p>
                <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.04em', color: 'var(--ovw-0p28)', marginTop: 6 }}>THE WATCHDOG IS WATCHING</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </Layout>
  )
}
