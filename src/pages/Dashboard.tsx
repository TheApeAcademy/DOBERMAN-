import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Wifi, Brain, Newspaper, ArrowRight, Clock, RefreshCw, ExternalLink } from 'lucide-react'
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

interface NewsArticle {
  title: string
  pubDate: string
  link: string
  thumbnail: string
  description: string
  author: string
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
  const [news, setNews] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchDashboardData()
    fetchNews()
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

  const fetchNews = useCallback(async () => {
    setNewsLoading(true)
    try {
      const rss = encodeURIComponent('https://feeds.feedburner.com/TheHackersNews')
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rss}&count=6`)
      const data = await res.json()
      if (data.status === 'ok') setNews(data.items)
    } catch {
      // silently fail — news is non-critical
    }
    setNewsLoading(false)
  }, [])

  const moduleCards = [
    { to: '/eyes', icon: Eye, name: 'EYES', sub: 'Deepfake Detection', desc: 'Analyze images, videos, and audio for synthetic media manipulation.', count: stats.eyesToday, limit: 3, src: '/assets/video/b78ad4f230a4015d24a420fce2a7d53b.jpg', isImage: true, label: 'EYES -- DEEPFAKE DETECTION' },
    { to: '/nose', icon: Wifi, name: 'NOSE', sub: 'IoT Intelligence', desc: 'Map your network environment and identify security weaknesses.', count: stats.noseToday, limit: 3, src: '/assets/video/5550b5f21861539de2d6c651cf6bbb1f.jpg', isImage: true, label: 'NOSE -- IOT INTELLIGENCE' },
    { to: '/brain', icon: Brain, name: 'BRAIN', sub: 'AI Analyst', desc: 'Chat with your dedicated cybersecurity expert powered by Claude.', count: stats.brainToday, limit: 10, src: '/assets/video/Brain_Parts_360_visualization-_Kritrimvault.mp4', isImage: false, label: 'BRAIN -- AI ANALYST' },
    { to: '/news', icon: Newspaper, name: 'NEWS', sub: 'Verify Content', desc: 'Paste any headline or claim. Get a credibility verdict instantly.', count: stats.newsToday, limit: 3, src: '/assets/video/cdd8c26722152919a8539f357363c238.jpg', isImage: true, label: 'NEWS -- VERIFY CONTENT' },
  ]

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      {/* Tech grid depth background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '-10%',
          right: '-10%',
          height: '55%',
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          transform: 'perspective(800px) rotateX(-55deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, transparent 5%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 5%, rgba(0,0,0,0.3) 60%, transparent 100%)',
        }} />
      </div>

      <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: 1200, margin: '0 auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* Header */}
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

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 40 }}>
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
              style={{ padding: '16px 20px', borderRadius: 16 }}
            >
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 8 }}>{label.toUpperCase()}</p>
              <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1, color: loading ? 'var(--text-3)' : color }}>
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

        {/* Top Stories — real cybersecurity news */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-3)' }}>
              TOP STORIES
            </p>
            <button
              onClick={fetchNews}
              disabled={newsLoading}
              style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--chrome-dim)', background: 'none', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={11} style={{ animation: newsLoading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {newsLoading && news.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ height: 140, background: 'var(--void-3)' }} />
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ height: 10, background: 'var(--void-3)', borderRadius: 4, marginBottom: 8, width: '40%' }} />
                    <div style={{ height: 14, background: 'var(--void-3)', borderRadius: 4, marginBottom: 6, width: '90%' }} />
                    <div style={{ height: 14, background: 'var(--void-3)', borderRadius: 4, width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="glass" style={{ borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-3)' }}>Could not load stories. Check your connection.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {news.map((article, i) => (
                <motion.a
                  key={i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  style={{ borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none' }}
                >
                  <div style={{ height: 140, background: '#060606', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                    {article.thumbnail ? (
                      <img
                        src={article.thumbnail}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,45,45,0.12), rgba(255,149,0,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Newspaper size={28} style={{ color: 'var(--text-3)' }} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                  </div>
                  <div style={{ padding: '14px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8 }}>
                      {new Date(article.pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text-1)', lineHeight: 1.45, marginBottom: 8, flex: 1 }}>
                      {article.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--chrome-dim)' }}>
                      <ExternalLink size={10} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.05em' }}>Read more</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
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

        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </Layout>
  )
}
