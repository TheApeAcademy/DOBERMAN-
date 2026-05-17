import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Clock, ExternalLink, ChevronRight, Zap } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel } from '../lib/utils'

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
    eyesToday: 0, brainToday: 0, newsToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [visibleHeadlines, setVisibleHeadlines] = useState(4)

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
    })
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
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', marginBottom: 20 }}>
              DASHBOARD -- {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1, marginBottom: 14 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontFamily: 'Syne', fontSize: 17, color: 'rgba(255,255,255,0.38)', marginBottom: 32 }}>
              D0B3RMAN is watching. Here's your threat overview.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--safe)' }}>ALL SYSTEMS ACTIVE</span>
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
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.22)', marginBottom: 12 }}>{label.toUpperCase()}</p>
                <p className="stats-num" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 52, lineHeight: 1, color: loading ? 'rgba(255,255,255,0.08)' : color }}>
                  {loading ? '—' : value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── MODULES LABEL ─────────────────────────────── */}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', marginBottom: 36 }}>MODULES</p>

          {/* ── DEEP FAKE INTELLIGENCE ────────────────────── */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/eyes')}
            style={{ padding: 40, borderRadius: 24, marginBottom: 32, overflow: 'hidden' }}
          >
            <style>{`@media(max-width:768px){.dfi-grid{grid-template-columns:1fr!important}.dfi-video{order:-1!important;height:140px!important}}`}</style>
            <div className="dfi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>01 -- DEEPFAKE DETECTION</p>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px, 5.5vw, 72px)', letterSpacing: '0.05em', lineHeight: 0.9, marginBottom: 28 }}>
                  DEEP FAKE<br />INTELLIGENCE
                </h2>
                <p style={{ fontFamily: 'Syne', fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: 28 }}>
                  Upload any image, video, or audio. D0B3RMAN's detection engine analyzes it against known deepfake signatures and returns a trust score in seconds.
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginBottom: 32 }}>
                  Hive AI · XceptionNet · EfficientNet · MesoNet
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stats.eyesToday}/3 today</span>
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
                <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', zIndex: 2 }}>
                  EYES -- DEEPFAKE DETECTION
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── DOB3RMAN INTELLIGENCE ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            onClick={() => navigate('/brain')}
            style={{ borderRadius: 24, marginBottom: 32, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}
          >
            {/* Green logo — full-width, large */}
            <div style={{ position: 'relative', width: '100%', height: 'clamp(260px, 50vw, 520px)', overflow: 'hidden', background: '#060606' }}>
              <video
                autoPlay muted loop playsInline preload="auto"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', display: 'block', pointerEvents: 'none' }}
              >
                <source src="/assets/video/blob-di.mp4" type="video/mp4" />
              </video>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.95))', pointerEvents: 'none' }} />
            </div>

            {/* Text below the logo */}
            <div style={{ padding: '32px clamp(20px,5vw,48px) 56px', overflow: 'hidden' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', marginBottom: 28 }}>
                02 -- AI SECURITY ANALYST
              </p>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(14px, 5vw, 67px)', lineHeight: 0.92, marginBottom: 28, overflow: 'hidden' }}>
                DOB3RMAN<br /><span style={{ color: 'var(--safe)' }}>INTELLIGENCE</span>
              </h2>
              <p style={{ fontFamily: 'Syne', fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.7 }}>
                Ask anything. D0B3RMAN responds in plain language and gives you a concrete next step. Like having a security analyst on call 24/7.
              </p>
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(48,209,88,0.3)' }}
                whileTap={{ scale: 0.97 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 40px', background: 'var(--safe)', color: '#000', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, borderRadius: 12 }}
              >
                Get Access to DoB3RMAN Intelligence
                <ArrowRight size={16} />
              </motion.div>
            </div>
          </motion.div>

          {/* ── NEWS VERIFICATION ─────────────────────────── */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/news')}
            style={{ padding: 40, borderRadius: 24, marginBottom: 96, overflow: 'hidden' }}
          >
            <style>{`@media(max-width:768px){.news-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>03 -- VERIFY CONTENT</p>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px, 5.5vw, 72px)', letterSpacing: '0.05em', lineHeight: 0.9, marginBottom: 28 }}>
                  NEWS<br />VERIFICATION
                </h3>
                <p style={{ fontFamily: 'Syne', fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: 28 }}>
                  Paste any headline, claim, or article URL. D0B3RMAN cross-references it, checks source quality, and gives you a credibility verdict in seconds.
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginBottom: 32 }}>
                  Cross-reference · Source Quality · Fact Check
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stats.newsToday}/3 today</span>
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
                <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', zIndex: 2 }}>
                  NEWS -- VERIFY CONTENT
                </div>
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
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)' }}>LIVE</span>
              </div>
              <button onClick={() => navigate('/news')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none' }}>
                <ExternalLink size={11} />
                Verify
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(26px, 4vw, 36px)', display: 'flex', alignItems: 'center', gap: 8 }}>
                Top Stories <ChevronRight size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </h2>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
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
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 10, color: '#fff' }}>T</span>
                  </div>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>THREATPOST</span>
                  <span style={{ fontFamily: 'Syne', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>2 hours ago</span>
                </div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(17px, 2.5vw, 22px)', lineHeight: 1.3, color: '#fff', maxWidth: 680 }}>
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
                          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 9, color: item.color }}>{item.source[0]}</span>
                        </div>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>{item.source}</span>
                      </div>
                      <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 'clamp(14px, 1.8vw, 16px)', color: '#fff', lineHeight: 1.35, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.text}
                      </p>
                      <span style={{ fontFamily: 'Syne', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{item.time}</span>
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
                  style={{ width: '100%', padding: '18px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Syne', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}
                >
                  <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                  {CYBER_HEADLINES.length - visibleHeadlines} more stories
                </button>
              ) : (
                <button
                  onClick={() => navigate('/news')}
                  style={{ width: '100%', padding: '18px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--danger)', marginTop: 4 }}
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
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginTop: 10 }}>THE WATCHDOG IS WATCHING</p>
            </div>
          </motion.div>

          {/* ── RECENT ACTIVITY ────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)' }}>RECENT ACTIVITY</p>
              <button onClick={() => navigate('/history')} style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: 'none' }}>View all</button>
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
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No activity yet. Run your first scan.</p>
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
                        <p style={{ fontFamily: 'Syne', fontSize: 14, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{item.label}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{formatRelativeTime(item.created_at)}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{typeLabel[item.type]}</span>
                          {item.result && (
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: getResultLabel(item.result).color, background: `${getResultLabel(item.result).color}22`, padding: '2px 6px', borderRadius: 4 }}>
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
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </Layout>
  )
}
