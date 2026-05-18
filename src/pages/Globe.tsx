import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe2, Search, X, AlertTriangle, ChevronRight, Loader } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface CountryData {
  name: string
  code: string
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  riskScore: number
  threats: string[]
  lat: number
  lng: number
}

const COUNTRIES: CountryData[] = [
  { name: 'China', code: 'CN', riskLevel: 'critical', riskScore: 95, threats: ['State-sponsored APTs', 'IP theft', 'Supply chain attacks', 'Telecom espionage'], lat: 35, lng: 105 },
  { name: 'Russia', code: 'RU', riskLevel: 'critical', riskScore: 94, threats: ['Nation-state ransomware', 'Election interference', 'Critical infrastructure attacks', 'GRU/FSB operations'], lat: 61, lng: 105 },
  { name: 'North Korea', code: 'KP', riskLevel: 'critical', riskScore: 92, threats: ['Lazarus Group crypto theft', 'SWIFT attacks', 'Ransomware for sanctions evasion'], lat: 40, lng: 127 },
  { name: 'Iran', code: 'IR', riskLevel: 'critical', riskScore: 88, threats: ['IRGC cyber operations', 'OT/ICS attacks', 'Destructive malware'], lat: 32, lng: 53 },
  { name: 'Nigeria', code: 'NG', riskLevel: 'high', riskScore: 78, threats: ['BEC fraud', 'Romance scams', 'Advance fee fraud', 'Phishing campaigns'], lat: 9, lng: 8 },
  { name: 'Brazil', code: 'BR', riskLevel: 'high', riskScore: 72, threats: ['Banking trojans', 'Boleto fraud', 'Credential theft malware'], lat: -10, lng: -52 },
  { name: 'India', code: 'IN', riskLevel: 'medium', riskScore: 58, threats: ['Tech support scams', 'Call center fraud', 'Mobile banking threats'], lat: 20, lng: 77 },
  { name: 'United States', code: 'US', riskLevel: 'medium', riskScore: 55, threats: ['Ransomware targets', 'Data broker exposure', 'Phishing infrastructure'], lat: 38, lng: -97 },
  { name: 'Ukraine', code: 'UA', riskLevel: 'high', riskScore: 74, threats: ['Active cyberwar zone', 'Wiper malware', 'Critical infrastructure targeting'], lat: 49, lng: 31 },
  { name: 'Romania', code: 'RO', riskLevel: 'high', riskScore: 70, threats: ['Organized cybercrime', 'ATM skimming networks', 'Carding forums'], lat: 45, lng: 25 },
  { name: 'Vietnam', code: 'VN', riskLevel: 'high', riskScore: 68, threats: ['State-sponsored espionage', 'APT32', 'Corporate spying'], lat: 14, lng: 108 },
  { name: 'Pakistan', code: 'PK', riskLevel: 'medium', riskScore: 62, threats: ['Nation-state hacking groups', 'Terrorism financing networks', 'Spear phishing'], lat: 30, lng: 69 },
  { name: 'Germany', code: 'DE', riskLevel: 'low', riskScore: 35, threats: ['Strong GDPR protection', 'Industrial espionage targets', 'Bundestag hack history'], lat: 51, lng: 10 },
  { name: 'United Kingdom', code: 'GB', riskLevel: 'low', riskScore: 32, threats: ['GCHQ monitoring', 'NHS ransomware history', 'Financial sector threats'], lat: 54, lng: -2 },
  { name: 'South Korea', code: 'KR', riskLevel: 'medium', riskScore: 60, threats: ['DPRK targeting', 'Financial sector attacks', 'Crypto exchange hacks'], lat: 36, lng: 128 },
]

const RISK_COLORS = {
  critical: '#FF2D2D',
  high: '#FF9500',
  medium: '#FFD60A',
  low: '#30D158',
}

function GlobeCanvas({ selectedCountry }: { selectedCountry: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const rotationRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) * 0.38

      // Globe glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.2)
      glow.addColorStop(0, 'rgba(255,255,255,0.03)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2)
      ctx.fill()

      // Globe sphere
      const sphere = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r)
      sphere.addColorStop(0, 'rgba(40,40,40,0.9)')
      sphere.addColorStop(1, 'rgba(10,10,10,0.95)')
      ctx.fillStyle = sphere
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      // Latitude lines
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 0.5
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy + r * Math.sin((lat * Math.PI) / 180)
        const rLat = r * Math.cos((lat * Math.PI) / 180)
        if (rLat > 0) {
          ctx.beginPath()
          ctx.ellipse(cx, y, rLat, rLat * 0.15, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Longitude lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI + rotationRef.current
        ctx.beginPath()
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(angle)), r, 0, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + 0.03 * Math.abs(Math.cos(angle))})`
        ctx.stroke()
      }

      // Globe border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()

      // Country dots
      COUNTRIES.forEach((country) => {
        const latRad = (country.lat * Math.PI) / 180
        const lngRad = (country.lng * Math.PI) / 180 + rotationRef.current

        // Project 3D to 2D
        const x3 = Math.cos(latRad) * Math.sin(lngRad)
        const y3 = Math.sin(latRad)
        const z3 = Math.cos(latRad) * Math.cos(lngRad)

        if (z3 < -0.1) return // Back face culling

        const px = cx + r * x3
        const py = cy - r * y3
        const opacity = 0.3 + 0.7 * ((z3 + 1) / 2)
        const color = RISK_COLORS[country.riskLevel]
        const isSelected = selectedCountry === country.name
        const dotSize = isSelected ? 6 : 4

        // Pulse ring for high-risk countries
        if (country.riskLevel === 'critical' || country.riskLevel === 'high') {
          const pulse = (Math.sin(Date.now() / 800 + country.lat) + 1) / 2
          ctx.beginPath()
          ctx.arc(px, py, dotSize * (1.5 + pulse), 0, Math.PI * 2)
          ctx.fillStyle = `${color}${Math.round(opacity * 40).toString(16).padStart(2, '0')}`
          ctx.fill()
        }

        // Dot
        ctx.beginPath()
        ctx.arc(px, py, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.round(opacity * 230).toString(16).padStart(2, '0')}`
        ctx.fill()

        // Selection ring
        if (isSelected) {
          ctx.beginPath()
          ctx.arc(px, py, dotSize + 4, 0, Math.PI * 2)
          ctx.strokeStyle = color
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      })

      rotationRef.current += 0.003
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [selectedCountry])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

export default function GlobePage() {
  const { profile, signOut } = useAuth()
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [search, setSearch] = useState('')
  const [dayeBrief, setDayeBrief] = useState('')
  const [loadingBrief, setLoadingBrief] = useState(false)
  const [_hovered, _setHovered] = useState<string | null>(null)

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.riskScore - a.riskScore)

  const fetchCountryBrief = async (country: CountryData) => {
    setLoadingBrief(true)
    setDayeBrief('')
    try {
      const { data } = await supabase.functions.invoke('daye-assistant', {
        body: {
          context_type: 'globe_country',
          data: { country: country.name },
        },
      })
      if (data?.message) setDayeBrief(data.message)
    } catch (_) {
      setDayeBrief(`${country.name} is a ${country.riskLevel}-risk zone. Key threats include ${country.threats.slice(0, 2).join(' and ')}.`)
    }
    setLoadingBrief(false)
  }

  const handleSelectCountry = (country: CountryData) => {
    setSelectedCountry(country)
    fetchCountryBrief(country)
  }

  return (
    <Layout profile={profile} onSignOut={signOut} title="CYBER GLOBE">
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 300,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Globe2 size={18} style={{ color: 'var(--text-1)' }} />
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.12em', color: 'var(--text-1)', lineHeight: 1 }}>CYBER GLOBE</h2>
            </div>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 9,
                  padding: '8px 12px 8px 28px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: 'var(--text-1)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Country list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map((country) => {
              const color = RISK_COLORS[country.riskLevel]
              const isSelected = selectedCountry?.name === country.name

              return (
                <button
                  key={country.code}
                  onClick={() => handleSelectCountry(country)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}70` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Syne', fontSize: 13, color: isSelected ? 'var(--text-1)' : 'var(--text-2)', fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country.name}</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: color, letterSpacing: '0.08em' }}>{country.riskLevel.toUpperCase()} RISK</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: color }}>{country.riskScore}</p>
                  </div>
                  {isSelected && <ChevronRight size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 8 }}>THREAT LEVELS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(RISK_COLORS).map(([level, color]) => (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Globe view */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Globe canvas */}
          <div style={{ flex: 1, position: 'relative' }}>
            <GlobeCanvas selectedCountry={selectedCountry?.name || null} />

            {/* Globe label */}
            <div style={{ position: 'absolute', top: 20, left: 20 }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}>GLOBAL CYBER THREAT VISUALIZATION</p>
            </div>

            {/* Stats overlay */}
            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }}>
              {[
                { label: 'CRITICAL', count: COUNTRIES.filter((c) => c.riskLevel === 'critical').length, color: '#FF2D2D' },
                { label: 'HIGH', count: COUNTRIES.filter((c) => c.riskLevel === 'high').length, color: '#FF9500' },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.7)', border: `1px solid ${color}30`, borderRadius: 8, backdropFilter: 'blur(10px)' }}>
                  <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, color, lineHeight: 1 }}>{count}</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Country intelligence panel */}
          <AnimatePresence>
            {selectedCountry && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                  background: 'rgba(8,8,8,0.97)',
                  borderTop: `1px solid ${RISK_COLORS[selectedCountry.riskLevel]}30`,
                  backdropFilter: 'blur(24px)',
                  padding: '20px 28px',
                  flexShrink: 0,
                  maxHeight: '45%',
                  overflowY: 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.12em', color: 'var(--text-1)' }}>{selectedCountry.name}</h3>
                      <div style={{ padding: '4px 10px', borderRadius: 6, background: `${RISK_COLORS[selectedCountry.riskLevel]}15`, border: `1px solid ${RISK_COLORS[selectedCountry.riskLevel]}30`, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: RISK_COLORS[selectedCountry.riskLevel] }}>
                        {selectedCountry.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>THREAT SCORE: {selectedCountry.riskScore}/100</p>
                  </div>
                  <button onClick={() => setSelectedCountry(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Threats */}
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>ACTIVE THREATS</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selectedCountry.threats.map((threat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <AlertTriangle size={11} style={{ color: RISK_COLORS[selectedCountry.riskLevel], flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontFamily: 'Syne', fontSize: 12, color: 'var(--text-2)' }}>{threat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DAYE Brief */}
                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>DAYE INTELLIGENCE BRIEF</p>
                    {loadingBrief ? (
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <Loader size={12} style={{ color: 'var(--text-3)', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>DAYE analyzing...</span>
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{dayeBrief}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}
