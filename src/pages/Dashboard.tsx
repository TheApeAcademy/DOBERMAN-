import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowRight, Clock, ExternalLink, ChevronRight, Zap, Newspaper } from 'lucide-react'
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
    eyesTotal: 0, brainTotal: 0, threatsDetected: 0,
    eyesToday: 0, brainToday: 0, newsToday: 0,
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
      ...eyes.map((e) => ({ id: e.id, type: 'eyes' as const, label: e.file_name || 'Unnamed file', result: e.result, created_at: e.created_at })),
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

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px clamp(16px, 4vw, 48px) 96px' }}>

          {/* ── HEADER ────────────────────────────────────── */}
          <div style={{ marginBottom: 64 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', marginBottom: 20 }}>
              DASHBOARD -- {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </p>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1, marginBottom: 12 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontFamily: 'Syne', fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
              D0B3RMAN is watching. Here's your threat overview.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--safe)' }}>ALL SYSTEMS ACTIVE</span>
            </div>
          </div>

          {/* ── STATS ─────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 80 }}>
            {[
              { label: 'Scans Today', value: stats.eyesToday + stats.newsToday, color: 'var(--chrome-mid)' },
              { label: 'Threats Found', value: stats.threatsDetected, color: 'var(--danger)' },
              { label: 'AI Queries', value: stats.brainToday, color: 'var(--safe)' },
              { label: 'Total Scans', value: stats.eyesTotal, color: 'var(--warning)' },
            ].map(({ label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass"
                style={{ padding: '24px 28px', borderRadius: 16 }}
              >
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.22)', marginBottom: 10 }}>{label.toUpperCase()}</p>
                <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 48, lineHeight: 1, color: loading ? 'rgba(255,255,255,0.08)' : color }}>
                  {loading ? '—' : value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── MODULES LABEL ─────────────────────────────── */}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)', marginBottom: 32 }}>
            MODULES
          </p>

          {/* ── DEEP FAKE INTELLIGENCE ────────────────────── */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/eyes')}
            style={{ padding: 36, borderRadius: 24, marginBottom: 24, overflow: 'hidden', position: 'relative' }}
          >
            <style>{`@media(max-width:768px){.dfi-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="dfi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>
                  01 -- DEEPFAKE DETECTION
                </p>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(44px, 5vw, 68px)', letterSpacing: '0.05em', lineHeight: 0.92, marginBottom: 24 }}>
                  DEEP FAKE<br />INTELLIGENCE
                </h2>
                <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 24 }}>
                  Upload any image, video, or audio. D0B3RMAN's detection engine analyzes it against known deepfake signatures and returns a trust score in seconds.
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 28 }}>
                  Hive AI · XceptionNet · EfficientNet · MesoNet
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stats.eyesToday}/3 today</span>
                  <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
                    <div style={{ height: '100%', borderRadius: 1, background: 'var(--chrome-mid)', width: `${Math.min((stats.eyesToday / 3) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.28)', marginLeft: 4 }} />
                </div>
              </div>
              <div style={{ position: 'relative', height: 260, borderRadius: 16, overflow: 'hidden', background: '#060606' }}>
                <video
                  autoPlay muted loop playsInline preload="auto"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                >
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
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            onClick={() => navigate('/brain')}
            style={{ borderRadius: 24, marginBottom: 24, overflow: 'hidden', position: 'relative', background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div style={{ position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                autoPlay muted loop playsInline preload="auto"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.85, pointerEvents: 'none' }}
              >
                <source src="/assets/video/blob-di.mp4" type="video/mp4" />
              </video>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, #000 100%)' }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '60px 48px' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.28)', marginBottom: 24 }}>
                  02 -- AI SECURITY ANALYST
                </p>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.92, marginBottom: 28 }}>
                  DOB3RMAN<br /><span style={{ color: 'var(--safe)' }}>INTELLIGENCE</span>
                </h2>
                <p style={{ fontFamily: 'Syne', fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.65 }}>
                  Ask anything. D0B3RMAN responds in plain language and gives you a concrete next step. Like having a security analyst on call 24/7.
                </p>
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(48,209,88,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 36px', background: 'var(--safe)', color: '#000', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, borderRadius: 12 }}
                >
                  Get Access to DoB3RMAN Intelligence
                  <ArrowRight size={16} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── NEWS VERIFICATION ─────────────────────────── */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => navigate('/news')}
            style={{ padding: 36, borderRadius: 24, marginBottom: 80, overflow: 'hidden', position: 'relative' }}
          >
            <style>{`@media(max-width:768px){.news-grid{grid-template-columns:1fr!important}}`}</style>
            <div className="news-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginBottom: 20 }}>
                  03 -- VERIFY CONTENT
                </p>
                <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(44px, 5vw, 68px)', letterSpacing: '0.05em', lineHeight: 0.92, marginBottom: 24 }}>
                  NEWS<br />VERIFICATION
                </h3>
                <p style={{ fontFamily: 'Syne', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 24 }}>
                  Paste any headline, claim, or article URL. D0B3RMAN cross-references it, checks source quality, and gives you a credibility verdict in seconds.
                </p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 28 }}>
                  Cross-reference · Source Quality · Fact Check
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(255,255,255,0.28)' }}>{stats.newsToday}/3 today</span>
                  <div style={{ width: 80, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
                    <div style={{ height: '100%', borderRadius: 1, background: 'var(--chrome-mid)', width: `${Math.min((stats.newsToday / 3) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.28)', marginLeft: 4 }} />
                </div>
              </div>
              <div style={{ position: 'relative', height: 260, borderRadius: 16, overflow: 'hidden', background: '#060606' }}>
                <video
                  autoPlay muted loop playsInline preload="auto"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                >
                  <source src="/assets/video/blob-news.mp4" type="video/mp4" />
                </video>
                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', zIndex: 2 }}>
                  NEWS -- VERIFY CONTENT
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── LIVE THREAT FEED (Samsung News style) ─────── */}
          <div style={{ marginBottom: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }} />
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)' }}>
                    LIVE THREAT FEED
                  </p>
                </div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Top Stories <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </h2>
              </div>
              <button
                onClick={() => navigate('/news')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 14px', borderRadius: 8 }}
              >
                <ExternalLink size={11} />
                Verify Headlines
              </button>
            </div>

            <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
              {/* Hero story */}
              <div style={{ position: 'relative', height: 260, background: '#060606' }}>
                <video
                  autoPlay muted loop playsInline preload="auto"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, pointerEvents: 'none' }}
                >
                  <source src="/assets/video/blob-news.mp4" type="video/mp4" />
                </video>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.88) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.18em', color: 'var(--danger)', background: 'rgba(255,45,45,0.15)', border: '1px solid rgba(255,45,45,0.3)', padding: '3px 8px', borderRadius: 4 }}>
                      CRITICAL
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>THREATPOST</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>2h ago</span>
                  </div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, lineHeight: 1.35, maxWidth: 640 }}>
                    Critical zero-day exploit targets Windows devices via CLFS driver vulnerability — patch required immediately
                  </h3>
                </div>
              </div>

              {/* Story items */}
              <AnimatePresence mode="popLayout">
                {CYBER_HEADLINES.slice(0, visibleHeadlines).map((item, i) => {
                  const tagColor = TAG_COLORS[item.tag] || 'var(--chrome-dim)'
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ padding: '18px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 20 }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.18em', color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}35`, padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {item.tag}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{item.time}</span>
                        </div>
                        <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: 'var(--text-1)', lineHeight: 1.4 }}>{item.text}</p>
                      </div>
                      <div style={{ width: 72, height: 54, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${tagColor}20, rgba(0,0,0,0.6))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Newspaper size={18} style={{ color: tagColor, opacity: 0.55 }} />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {visibleHeadlines < CYBER_HEADLINES.length ? (
                <button
                  onClick={() => setVisibleHeadlines(CYBER_HEADLINES.length)}
                  style={{ width: '100%', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--chrome-dim)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)' }}
                >
                  <ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} />
                  VIEW MORE ({CYBER_HEADLINES.length - visibleHeadlines} more threats)
                </button>
              ) : (
                <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => navigate('/news')}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.1em', color: 'var(--danger)', background: 'rgba(255,45,45,0.08)', border: '1px solid rgba(255,45,45,0.2)', padding: '8px 16px', borderRadius: 8 }}
                  >
                    <ExternalLink size={11} />
                    VERIFY ANY HEADLINE
                  </button>
                </div>
              )}
            </div>
          </div>

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
            <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
              <p style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.92)', lineHeight: 1 }}>
                D0B3RMAN
              </p>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.28)', marginTop: 8 }}>
                THE WATCHDOG IS WATCHING
              </p>
            </div>
          </motion.div>

          {/* ── RECENT ACTIVITY ────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.18)' }}>
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
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{ padding: '14px 20px', borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}
                    >
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
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </Layout>
  )
}
