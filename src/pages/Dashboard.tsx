import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Wifi, Brain, Newspaper, ArrowRight, Clock, Globe2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatRelativeTime, getResultLabel, getRiskColor } from '../lib/utils'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

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

function SpinningGlobe() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.08
  })

  return (
    <group ref={groupRef}>
      {/* Main sphere */}
      <Sphere args={[2.2, 64, 64]}>
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>
      {/* Atmosphere glow sphere */}
      <Sphere args={[2.35, 32, 32]}>
        <meshStandardMaterial
          color="#0A84FF"
          transparent
          opacity={0.06}
          roughness={1}
          side={THREE.BackSide}
        />
      </Sphere>
      {/* Latitude rings */}
      {[-60, -30, 0, 30, 60].map((lat, i) => {
        const y = 2.2 * Math.sin((lat * Math.PI) / 180)
        const r = 2.2 * Math.cos((lat * Math.PI) / 180)
        const points: THREE.Vector3[] = []
        for (let j = 0; j <= 64; j++) {
          const angle = (j / 64) * Math.PI * 2
          points.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)))
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        return (
          <line key={i}>
            <bufferGeometry attach="geometry" {...(geometry as any)} />
            <lineBasicMaterial attach="material" color="#0A84FF" transparent opacity={0.12} />
          </line>
        )
      })}
    </group>
  )
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
    { to: '/eyes', icon: Eye, name: 'EYES', sub: 'Deepfake Detection', desc: 'Analyze images, videos, and audio for synthetic media manipulation.', count: stats.eyesToday, limit: 3 },
    { to: '/nose', icon: Wifi, name: 'NOSE', sub: 'IoT Intelligence', desc: 'Map your network environment and identify security weaknesses.', count: stats.noseToday, limit: 3 },
    { to: '/brain', icon: Brain, name: 'BRAIN', sub: 'AI Analyst', desc: 'Chat with your dedicated cybersecurity expert powered by Claude.', count: stats.brainToday, limit: 10 },
    { to: '/news', icon: Newspaper, name: 'NEWS', sub: 'Verify Content', desc: 'Paste any headline or claim. Get a credibility verdict instantly.', count: stats.newsToday, limit: 3 },
  ]

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Operator'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  const statPills = [
    { label: 'Scans Today', value: stats.eyesToday + stats.noseToday + stats.newsToday },
    { label: 'Threats Found', value: stats.threatsDetected },
    { label: 'AI Messages', value: stats.brainToday },
    { label: 'Total Scans', value: stats.eyesTotal + stats.noseTotal },
  ]

  return (
    <Layout profile={profile} onSignOut={signOut} title="Dashboard">
      <div style={{ overflowX: 'hidden' }}>

        {/* ── GLOBE HERO ── */}
        <div style={{
          position: 'relative',
          height: 'max(55vh, 380px)',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at center top, #001133 0%, #000000 60%)',
        }}>

          {/* Three.js Canvas */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <Canvas
              camera={{ position: [0, 0, 5.5], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 1.5]}
            >
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={2} color="#4DA6FF" />
              <pointLight position={[-5, -5, -5]} intensity={0.5} color="#001433" />
              <SpinningGlobe />
            </Canvas>
          </div>

          {/* Bottom gradient fade */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to bottom, transparent 0%, #000000 100%)',
            pointerEvents: 'none',
            zIndex: 5,
          }} />

          {/* Blue glow orb */}
          <div style={{
            position: 'absolute',
            bottom: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '500px',
            height: '200px',
            background: 'radial-gradient(ellipse at center, rgba(10,132,255,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 4,
          }} />

          {/* Text overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '24px',
          }}>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'Syne, system-ui, -apple-system, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(28px, 5vw, 52px)',
                color: '#FFFFFF',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {greeting}, {firstName}.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'Syne, system-ui, sans-serif',
                fontSize: 16,
                color: 'rgba(255,255,255,0.5)',
                marginTop: 8,
                letterSpacing: '0.01em',
              }}
            >
              D0B3RMAN is watching. Threat status: nominal.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 20,
                padding: '8px 20px',
                background: 'rgba(10,132,255,0.2)',
                border: '1px solid rgba(10,132,255,0.4)',
                borderRadius: '100px',
              }}
            >
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#0A84FF',
                animation: 'pulse 2s infinite',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: '#0A84FF',
              }}>
                ALL SYSTEMS ACTIVE
              </span>
            </motion.div>
          </div>

          {/* Floating stats pills */}
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0 16px',
          }}>
            {statPills.map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(10,132,255,0.2)',
                  borderRadius: '100px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#0A84FF',
                  minWidth: 16,
                  textAlign: 'center',
                }}>
                  {loading ? '—' : value}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: 'var(--text-3)',
                  whiteSpace: 'nowrap',
                }}>
                  {label.toUpperCase()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CONTENT SECTION ── */}
        <div style={{ padding: '0 24px 48px', maxWidth: 1200, margin: '0 auto' }}>

          {/* Section label */}
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.15em',
            color: 'var(--text-3)',
            marginTop: 40,
            marginBottom: 16,
          }}>
            INTELLIGENCE MODULES
          </p>

          {/* Module cards — horizontal rectangular grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
            marginBottom: 40,
          }}>
            {moduleCards.map(({ to, icon: Icon, name, sub, desc, count, limit }, i) => (
              <motion.button
                key={to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => navigate(to)}
                whileHover={{ scale: 1.01 }}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  borderRadius: 22,
                  background: 'rgba(10,132,255,0.04)',
                  border: '1px solid rgba(10,132,255,0.12)',
                  boxShadow: 'inset 0 1px 0 rgba(10,132,255,0.08)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: 88,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(10,132,255,0.08)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(10,132,255,0.25)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(10,132,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(10,132,255,0.12)'
                }}
              >
                {/* Icon squircle */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(10,132,255,0.10)',
                  border: '1px solid rgba(10,132,255,0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color="#0A84FF" />
                </div>

                {/* Middle text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'var(--text-1)',
                    marginBottom: 2,
                    lineHeight: 1.2,
                  }}>
                    {name}
                  </p>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    color: '#0A84FF',
                    letterSpacing: '0.1em',
                    marginBottom: 4,
                  }}>
                    {sub.toUpperCase()}
                  </p>
                  <p style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 13,
                    color: 'var(--text-2)',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {desc}
                  </p>
                </div>

                {/* Right: usage + arrow */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 6,
                  flexShrink: 0,
                  minWidth: 52,
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: 'var(--text-3)',
                  }}>
                    {count}/{limit}
                  </span>
                  <div style={{ width: 48, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 1,
                      background: '#0A84FF',
                      width: `${Math.min((count / limit) * 100, 100)}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <ArrowRight size={14} color="rgba(10,132,255,0.5)" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.15em',
              color: 'var(--text-3)',
            }}>
              RECENT ACTIVITY
            </p>
            <button
              onClick={() => navigate('/history')}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: '#0A84FF',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              View all
            </button>
          </div>

          {/* Activity list */}
          <div style={{
            borderRadius: 22,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 6, width: '55%' }} />
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 4, width: '28%' }} />
                  </div>
                </div>
              ))
            ) : activity.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Globe2 size={24} style={{ color: 'var(--text-3)', margin: '0 auto 12px' }} />
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-3)' }}>
                  No activity yet. Run your first scan.
                </p>
              </div>
            ) : (
              activity.map((item, i) => {
                const icons = { eyes: Eye, nose: Wifi, brain: Brain, news: Newspaper }
                const Icon = icons[item.type]
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      padding: '14px 20px',
                      borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    {/* Icon squircle */}
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'rgba(10,132,255,0.06)',
                      border: '1px solid rgba(10,132,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={14} color="rgba(10,132,255,0.7)" />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: 14,
                        color: 'var(--text-1)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: 4,
                        lineHeight: 1.3,
                      }}>
                        {item.label}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Clock size={10} color="var(--text-3)" />
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>
                          {formatRelativeTime(item.created_at)}
                        </span>
                        {item.result && (
                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10,
                            color: getResultLabel(item.result).color,
                            background: `${getResultLabel(item.result).color}22`,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}>
                            {getResultLabel(item.result).label}
                          </span>
                        )}
                        {item.type === 'nose' && item.score !== undefined && (
                          <span style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10,
                            color: getRiskColor(item.score),
                            background: `${getRiskColor(item.score)}22`,
                            padding: '2px 8px',
                            borderRadius: 6,
                          }}>
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
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(10,132,255,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(10,132,255,0); }
        }
      `}</style>
    </Layout>
  )
}
