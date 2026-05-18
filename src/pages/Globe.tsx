import { useCallback, useEffect, useRef, useState } from 'react'
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
  // ── Global threats ─────────────────────────────────────────────────────
  { name: 'China', code: 'CN', riskLevel: 'critical', riskScore: 95, threats: ['State-sponsored APTs', 'IP theft', 'Supply chain attacks', 'Telecom espionage'], lat: 35, lng: 105 },
  { name: 'Russia', code: 'RU', riskLevel: 'critical', riskScore: 94, threats: ['Nation-state ransomware', 'Election interference', 'Critical infrastructure attacks', 'GRU/FSB operations'], lat: 61, lng: 105 },
  { name: 'North Korea', code: 'KP', riskLevel: 'critical', riskScore: 92, threats: ['Lazarus Group crypto theft', 'SWIFT attacks', 'Ransomware for sanctions evasion'], lat: 40, lng: 127 },
  { name: 'Iran', code: 'IR', riskLevel: 'critical', riskScore: 88, threats: ['IRGC cyber operations', 'OT/ICS attacks', 'Destructive malware'], lat: 32, lng: 53 },
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
  // ── Africa — all 54 AU member states ──────────────────────────────────
  { name: 'Algeria', code: 'DZ', riskLevel: 'medium', riskScore: 52, threats: ['State surveillance apparatus', 'Islamist network financing', 'Oil sector targeting'], lat: 28, lng: 3 },
  { name: 'Angola', code: 'AO', riskLevel: 'medium', riskScore: 44, threats: ['Oil industry cyber attacks', 'BEC fraud growth', 'Mobile banking fraud'], lat: -12, lng: 18 },
  { name: 'Benin', code: 'BJ', riskLevel: 'medium', riskScore: 46, threats: ['BEC fraud networks', 'Mobile money fraud', 'West Africa phishing'], lat: 9.3, lng: 2.3 },
  { name: 'Botswana', code: 'BW', riskLevel: 'low', riskScore: 28, threats: ['Ransomware targets', 'Regional cybercrime spill', 'Diamond sector targeting'], lat: -22, lng: 24 },
  { name: 'Burkina Faso', code: 'BF', riskLevel: 'high', riskScore: 65, threats: ['Jihadist group financing networks', 'Russian Wagner Group influence ops', 'Mobile money exploitation'], lat: 12, lng: -2 },
  { name: 'Burundi', code: 'BI', riskLevel: 'medium', riskScore: 42, threats: ['State surveillance', 'Diaspora targeting', 'Political opposition hacking'], lat: -3.4, lng: 29.9 },
  { name: 'Cabo Verde', code: 'CV', riskLevel: 'low', riskScore: 22, threats: ['Island transit fraud', 'Drug trafficking coordination', 'Low-level phishing'], lat: 16, lng: -24 },
  { name: 'Cameroon', code: 'CM', riskLevel: 'high', riskScore: 62, threats: ['BEC fraud operations', 'Anglophone crisis hacktivism', 'Telecom infrastructure attacks'], lat: 6, lng: 12 },
  { name: 'Central African Republic', code: 'CF', riskLevel: 'high', riskScore: 67, threats: ['Wagner Group cyber operations', 'Armed group financing networks', 'Resource sector attacks'], lat: 7, lng: 21 },
  { name: 'Chad', code: 'TD', riskLevel: 'high', riskScore: 63, threats: ['Terrorist financing networks', 'State surveillance tools', 'Oil sector espionage'], lat: 15, lng: 19 },
  { name: 'Comoros', code: 'KM', riskLevel: 'low', riskScore: 24, threats: ['Low internet penetration', 'Basic online fraud', 'Island transit smuggling'], lat: -12, lng: 44 },
  { name: 'Democratic Republic of Congo', code: 'CD', riskLevel: 'high', riskScore: 70, threats: ['Rebel group financing', 'Mobile money fraud', 'Mining sector cyber attacks', 'Cobalt/mineral espionage'], lat: -4, lng: 24 },
  { name: 'Republic of Congo', code: 'CG', riskLevel: 'medium', riskScore: 50, threats: ['Oil sector targeting', 'State surveillance', 'Political hacktivism'], lat: -1, lng: 15 },
  { name: 'Djibouti', code: 'DJ', riskLevel: 'medium', riskScore: 51, threats: ['Strategic port infrastructure targeting', 'Chinese tech dependency risk', 'State surveillance'], lat: 11.8, lng: 42.6 },
  { name: 'Egypt', code: 'EG', riskLevel: 'high', riskScore: 75, threats: ['State-sponsored cyber operations', 'Predator spyware use', 'Phishing campaigns', 'Tourist/financial fraud'], lat: 26, lng: 30 },
  { name: 'Equatorial Guinea', code: 'GQ', riskLevel: 'medium', riskScore: 46, threats: ['Oil sector cyber attacks', 'Authoritarian surveillance', 'Kleptocracy-linked fraud'], lat: 2, lng: 10 },
  { name: 'Eritrea', code: 'ER', riskLevel: 'medium', riskScore: 44, threats: ['State surveillance of diaspora', 'Authoritarian digital control', 'Foreign hack targeting'], lat: 15, lng: 39 },
  { name: 'Eswatini', code: 'SZ', riskLevel: 'low', riskScore: 30, threats: ['Basic scams', 'Regional ransomware spill', 'Low cyber capacity'], lat: -26.5, lng: 31.5 },
  { name: 'Ethiopia', code: 'ET', riskLevel: 'high', riskScore: 64, threats: ['State-sponsored surveillance (FinSpy)', 'Tigray conflict cyber ops', 'Telecom infrastructure hacking'], lat: 8, lng: 38 },
  { name: 'Gabon', code: 'GA', riskLevel: 'medium', riskScore: 48, threats: ['Oil sector targeting', 'Post-coup cyber uncertainty', 'BEC fraud networks'], lat: -1, lng: 11.8 },
  { name: 'Gambia', code: 'GM', riskLevel: 'medium', riskScore: 42, threats: ['BEC fraud operations', 'Mobile money exploitation', 'West Africa phishing ring'], lat: 13.5, lng: -15.6 },
  { name: 'Ghana', code: 'GH', riskLevel: 'high', riskScore: 72, threats: ['Sakawa cybercrime rings', 'BEC fraud', 'Advance fee fraud', 'Crypto scam laundering'], lat: 7.9, lng: -1.0 },
  { name: 'Guinea', code: 'GN', riskLevel: 'medium', riskScore: 46, threats: ['Mining sector targeting', 'BEC fraud growth', 'Mobile money fraud'], lat: 11, lng: -10.9 },
  { name: 'Guinea-Bissau', code: 'GW', riskLevel: 'medium', riskScore: 50, threats: ['Drug trafficking cyber coordination', 'State failure enabling fraud', 'BEC operations'], lat: 12, lng: -15 },
  { name: "Côte d'Ivoire", code: 'CI', riskLevel: 'high', riskScore: 68, threats: ['West Africa BEC hub', 'Mobile money fraud', 'Phishing infrastructure', 'Romance scam networks'], lat: 7.5, lng: -5.5 },
  { name: 'Kenya', code: 'KE', riskLevel: 'high', riskScore: 71, threats: ['M-Pesa mobile money hacking', 'East Africa BEC hub', 'SIM swap attacks', 'Crypto exchange fraud'], lat: -1, lng: 38 },
  { name: 'Lesotho', code: 'LS', riskLevel: 'low', riskScore: 26, threats: ['Low internet penetration', 'Regional cybercrime spill', 'Basic mobile fraud'], lat: -29.6, lng: 28.2 },
  { name: 'Liberia', code: 'LR', riskLevel: 'medium', riskScore: 46, threats: ['BEC fraud rings', 'Resource sector targeting', 'West Africa cybercrime networks'], lat: 6.4, lng: -9.4 },
  { name: 'Libya', code: 'LY', riskLevel: 'critical', riskScore: 82, threats: ['Active conflict cyber operations', 'Arms trafficking coordination', 'Russian/Turkish proxy cyber ops', 'Migrant smuggling networks'], lat: 26, lng: 17 },
  { name: 'Madagascar', code: 'MG', riskLevel: 'medium', riskScore: 44, threats: ['Online fraud rings', 'Vanilla/resource sector espionage', 'Cyber espionage campaigns'], lat: -20, lng: 47 },
  { name: 'Malawi', code: 'MW', riskLevel: 'medium', riskScore: 40, threats: ['Mobile money fraud', 'Basic cybercrime', 'Ransomware targeting NGOs'], lat: -13.5, lng: 34 },
  { name: 'Mali', code: 'ML', riskLevel: 'high', riskScore: 66, threats: ['Jihadist financing networks', 'Russian Wagner influence operations', 'Gold sector cyber attacks'], lat: 17, lng: -4 },
  { name: 'Mauritania', code: 'MR', riskLevel: 'medium', riskScore: 48, threats: ['Terrorist financing networks', 'State surveillance tools', 'Sahel conflict spillover'], lat: 20, lng: -12 },
  { name: 'Mauritius', code: 'MU', riskLevel: 'low', riskScore: 25, threats: ['Financial sector phishing', 'Offshore banking fraud', 'Targeted corporate espionage'], lat: -20.3, lng: 57.5 },
  { name: 'Morocco', code: 'MA', riskLevel: 'high', riskScore: 68, threats: ['State cyber operations (Sandcat)', 'Hacktivist groups targeting government', 'North Africa BEC networks', 'Pegasus spyware use'], lat: 32, lng: -5 },
  { name: 'Mozambique', code: 'MZ', riskLevel: 'medium', riskScore: 52, threats: ['LNG/gas sector cyber attacks', 'Cabo Delgado conflict financing', 'Mobile banking fraud'], lat: -18, lng: 35 },
  { name: 'Namibia', code: 'NA', riskLevel: 'low', riskScore: 32, threats: ['Ransomware targets', 'Mining sector espionage', 'Regional cybercrime'], lat: -22, lng: 17 },
  { name: 'Niger', code: 'NE', riskLevel: 'high', riskScore: 65, threats: ['Jihadist group financing', 'Russian Wagner presence', 'Uranium sector targeting', 'Post-coup instability'], lat: 17, lng: 8 },
  { name: 'Nigeria', code: 'NG', riskLevel: 'high', riskScore: 82, threats: ['BEC fraud — global leader', 'Romance scam networks', 'Advance fee fraud', 'SIM swapping', 'Crypto scam rings'], lat: 9, lng: 8 },
  { name: 'Rwanda', code: 'RW', riskLevel: 'low', riskScore: 30, threats: ['State Pegasus spyware use on dissidents', 'Donor/NGO targeting', 'Strong domestic cyber governance'], lat: -2, lng: 29.9 },
  { name: 'São Tomé and Príncipe', code: 'ST', riskLevel: 'low', riskScore: 20, threats: ['Minimal threat surface', 'Basic phishing', 'Island state low capacity'], lat: 1, lng: 7 },
  { name: 'Senegal', code: 'SN', riskLevel: 'medium', riskScore: 50, threats: ['BEC fraud rings', 'Political hacktivism', 'Mobile money exploitation'], lat: 14, lng: -14 },
  { name: 'Sierra Leone', code: 'SL', riskLevel: 'medium', riskScore: 44, threats: ['BEC fraud networks', 'Mobile money fraud', 'Diamond sector targeting'], lat: 8.5, lng: -11.8 },
  { name: 'Somalia', code: 'SO', riskLevel: 'critical', riskScore: 86, threats: ['Al-Shabaab cyber financing', 'Piracy coordination networks', 'Hawala money laundering', 'State failure enabling cyber threats'], lat: 6, lng: 46 },
  { name: 'South Africa', code: 'ZA', riskLevel: 'high', riskScore: 76, threats: ['Highest cybercrime rate in Africa', 'Ransomware attacks on banks', 'FICA/SARS phishing', 'ATM skimming networks'], lat: -29, lng: 25 },
  { name: 'South Sudan', code: 'SS', riskLevel: 'high', riskScore: 64, threats: ['Conflict zone financing networks', 'Oil sector attacks', 'Militia coordination platforms', 'Aid organization targeting'], lat: 7, lng: 30 },
  { name: 'Sudan', code: 'SD', riskLevel: 'high', riskScore: 68, threats: ['RSF/SAF conflict cyber operations', 'Sanctions evasion networks', 'Gold smuggling coordination', 'State collapse enabling fraud'], lat: 15, lng: 30 },
  { name: 'Tanzania', code: 'TZ', riskLevel: 'medium', riskScore: 55, threats: ['Mobile money fraud (M-Pesa)', 'East Africa cybercrime ecosystem', 'Tourism sector phishing'], lat: -6, lng: 35 },
  { name: 'Togo', code: 'TG', riskLevel: 'medium', riskScore: 48, threats: ['BEC fraud operations', 'Mobile money fraud', 'West Africa phishing networks'], lat: 8, lng: 1.2 },
  { name: 'Tunisia', code: 'TN', riskLevel: 'high', riskScore: 66, threats: ['Anonymous Arabia hacktivism', 'State surveillance tools', 'North Africa BEC networks', 'Ransomware targeting government'], lat: 34, lng: 9 },
  { name: 'Uganda', code: 'UG', riskLevel: 'high', riskScore: 62, threats: ['State surveillance (Pegasus/FinSpy)', 'Mobile money fraud', 'BEC fraud operations', 'Journalist/opposition targeting'], lat: 1, lng: 32 },
  { name: 'Zambia', code: 'ZM', riskLevel: 'medium', riskScore: 52, threats: ['Mobile money fraud', 'Copper sector espionage', 'Chinese tech infrastructure risk'], lat: -14, lng: 28 },
  { name: 'Zimbabwe', code: 'ZW', riskLevel: 'high', riskScore: 65, threats: ['Economic cybercrime', 'ZANU-PF cyber operations', 'Sanctions evasion fraud', 'Diaspora targeting'], lat: -20, lng: 30 },
]

const RISK_COLORS = {
  critical: '#FF2D2D',
  high: '#FF9500',
  medium: '#FFD60A',
  low: '#30D158',
}

function GlobeCanvas({
  selectedCountry,
  onSelectCountry,
  focusLng,
}: {
  selectedCountry: string | null
  onSelectCountry: (c: CountryData) => void
  focusLng: number | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const rotationRef = useRef(0)
  const selectedRef = useRef(selectedCountry)
  const onSelectRef = useRef(onSelectCountry)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartRotRef = useRef(0)
  const dragMovedRef = useRef(false)
  const targetRotRef = useRef<number | null>(null)

  useEffect(() => { selectedRef.current = selectedCountry }, [selectedCountry])
  useEffect(() => { onSelectRef.current = onSelectCountry }, [onSelectCountry])

  // Animate globe to face selected country longitude
  useEffect(() => {
    if (focusLng !== null) {
      const target = -focusLng * Math.PI / 180
      let diff = ((target - rotationRef.current) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI
      targetRotRef.current = rotationRef.current + diff
    }
  }, [focusLng])

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
      // Rotation logic: lerp toward target, or auto-rotate, or hold on drag
      if (targetRotRef.current !== null) {
        const diff = targetRotRef.current - rotationRef.current
        rotationRef.current += diff * 0.06
        if (Math.abs(diff) < 0.003) { rotationRef.current = targetRotRef.current; targetRotRef.current = null }
      } else if (!isDraggingRef.current) {
        rotationRef.current += 0.003
      }

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
        const x3 = Math.cos(latRad) * Math.sin(lngRad)
        const y3 = Math.sin(latRad)
        const z3 = Math.cos(latRad) * Math.cos(lngRad)
        if (z3 < -0.1) return

        const px = cx + r * x3
        const py = cy - r * y3
        const opacity = 0.3 + 0.7 * ((z3 + 1) / 2)
        const color = RISK_COLORS[country.riskLevel]
        const isSelected = selectedRef.current === country.name
        const dotSize = isSelected ? 7 : 4

        if (country.riskLevel === 'critical' || country.riskLevel === 'high') {
          const pulse = (Math.sin(Date.now() / 800 + country.lat) + 1) / 2
          ctx.beginPath()
          ctx.arc(px, py, dotSize * (1.5 + pulse), 0, Math.PI * 2)
          ctx.fillStyle = `${color}${Math.round(opacity * 40).toString(16).padStart(2, '0')}`
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(px, py, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.round(opacity * 230).toString(16).padStart(2, '0')}`
        ctx.fill()

        if (isSelected) {
          ctx.beginPath()
          ctx.arc(px, py, dotSize + 5, 0, Math.PI * 2)
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.stroke()
          // Outer pulse ring
          const t = (Date.now() % 1200) / 1200
          ctx.beginPath()
          ctx.arc(px, py, dotSize + 5 + t * 8, 0, Math.PI * 2)
          ctx.strokeStyle = `${color}${Math.round((1 - t) * 100).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    dragMovedRef.current = false
    dragStartXRef.current = e.clientX
    dragStartRotRef.current = rotationRef.current
    targetRotRef.current = null
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - dragStartXRef.current
    if (Math.abs(dx) > 3) dragMovedRef.current = true
    rotationRef.current = dragStartRotRef.current + (dx / (canvasRef.current?.offsetWidth || 400)) * Math.PI * 1.5
  }
  const handleMouseUp = () => { isDraggingRef.current = false }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragMovedRef.current) return
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const scaleX = canvas.offsetWidth / rect.width
    const scaleY = canvas.offsetHeight / rect.height
    const cx = canvas.offsetWidth / 2
    const cy = canvas.offsetHeight / 2
    const r = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.38

    let nearest: CountryData | null = null
    let minDist = 28

    COUNTRIES.forEach((country) => {
      const latRad = country.lat * Math.PI / 180
      const lngRad = country.lng * Math.PI / 180 + rotationRef.current
      const z3 = Math.cos(latRad) * Math.cos(lngRad)
      if (z3 < -0.1) return
      const px = cx + r * Math.cos(latRad) * Math.sin(lngRad)
      const py = cy - r * Math.sin(latRad)
      const dist = Math.sqrt(((clickX * scaleX) - px) ** 2 + ((clickY * scaleY) - py) ** 2)
      if (dist < minDist) { minDist = dist; nearest = country }
    })

    if (nearest) onSelectRef.current(nearest)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    dragMovedRef.current = false
    dragStartXRef.current = e.touches[0].clientX
    dragStartRotRef.current = rotationRef.current
    targetRotRef.current = null
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return
    const dx = e.touches[0].clientX - dragStartXRef.current
    if (Math.abs(dx) > 3) dragMovedRef.current = true
    rotationRef.current = dragStartRotRef.current + (dx / (canvasRef.current?.offsetWidth || 400)) * Math.PI * 1.5
    e.preventDefault()
  }
  const handleTouchEnd = () => { isDraggingRef.current = false }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ width: '100%', height: '100%', display: 'block', cursor: isDraggingRef.current ? 'grabbing' : 'grab', touchAction: 'none' }}
    />
  )
}

export default function GlobePage() {
  const { profile, signOut } = useAuth()
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [search, setSearch] = useState('')
  const [dayeBrief, setDayeBrief] = useState('')
  const [loadingBrief, setLoadingBrief] = useState(false)
  const [mobileTab, setMobileTab] = useState<'list' | 'globe'>('globe')
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.riskScore - a.riskScore)

  const fetchCountryBrief = async (country: CountryData) => {
    setLoadingBrief(true)
    setDayeBrief('')
    try {
      const { data } = await supabase.functions.invoke('daye-assistant', {
        body: { context_type: 'globe_country', data: { country: country.name } },
      })
      if (data?.message) setDayeBrief(data.message)
    } catch (_) {
      setDayeBrief(`${country.name} is a ${country.riskLevel}-risk zone. Key threats include ${country.threats.slice(0, 2).join(' and ')}.`)
    }
    setLoadingBrief(false)
  }

  const handleSelectCountry = useCallback((country: CountryData) => {
    setSelectedCountry(country)
    fetchCountryBrief(country)
    if (isMobile) setMobileTab('globe')
  }, [isMobile])

  const riskColor = selectedCountry ? RISK_COLORS[selectedCountry.riskLevel] : '#FFFFFF'

  // Build threat category bars from threat text
  const threatCategories = selectedCountry ? [
    { label: 'STATE', pct: Math.min(100, selectedCountry.threats.filter(t => /state|APT|nation|GRU|FSB|IRGC|Wagner|sponsored/i.test(t)).length * 30 + (selectedCountry.riskLevel === 'critical' ? 40 : 0)) },
    { label: 'MALWARE', pct: Math.min(100, selectedCountry.threats.filter(t => /ransomware|malware|wiper|trojan|virus|destructive/i.test(t)).length * 35 + (selectedCountry.riskScore > 70 ? 20 : 0)) },
    { label: 'FRAUD', pct: Math.min(100, selectedCountry.threats.filter(t => /fraud|BEC|phishing|scam|fee|romance|advance/i.test(t)).length * 28 + (selectedCountry.riskScore > 60 ? 15 : 0)) },
    { label: 'INFRA', pct: Math.min(100, selectedCountry.threats.filter(t => /infrastructure|ICS|OT|supply|telecom|power|sector/i.test(t)).length * 25 + (selectedCountry.riskScore > 75 ? 25 : 0)) },
  ] : []

  const CountryPanel = ({ style }: { style?: React.CSSProperties }) => selectedCountry ? (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      style={{
        background: 'rgba(6,6,8,0.98)',
        borderTop: `1px solid ${riskColor}30`,
        backdropFilter: 'blur(28px)',
        padding: '18px 22px',
        overflowY: 'auto',
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 26, letterSpacing: '0.12em', color: 'var(--text-1)', lineHeight: 1 }}>{selectedCountry.name}</h3>
            <div style={{ padding: '3px 8px', borderRadius: 5, background: `${riskColor}15`, border: `1px solid ${riskColor}30`, fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.1em', color: riskColor }}>{selectedCountry.riskLevel.toUpperCase()}</div>
          </div>
          {/* Risk score bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <div style={{ width: 160, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${selectedCountry.riskScore}%`, background: riskColor, borderRadius: 2, boxShadow: `0 0 8px ${riskColor}60` }} />
            </div>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: riskColor, lineHeight: 1 }}>{selectedCountry.riskScore}<span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-3)' }}>/100</span></span>
          </div>
        </div>
        <button onClick={() => setSelectedCountry(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, flexShrink: 0 }}><X size={15} /></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
        {/* Threats + category chart */}
        <div>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>ACTIVE THREATS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            {selectedCountry.threats.map((threat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <AlertTriangle size={10} style={{ color: riskColor, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: 'Syne', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 }}>{threat}</span>
              </div>
            ))}
          </div>
          {/* Threat category mini-bars */}
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 8 }}>THREAT DISTRIBUTION</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {threatCategories.map(({ label, pct }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${Math.max(8, pct)}%`, background: pct > 60 ? 'var(--danger)' : pct > 30 ? 'var(--warning)' : 'var(--safe)', opacity: 0.8 }} />
                </div>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.05em' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DAYE Brief */}
        <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-3)', marginBottom: 10 }}>DAYE INTELLIGENCE BRIEF</p>
          {loadingBrief ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Loader size={12} style={{ color: 'var(--text-3)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-3)' }}>DAYE analyzing...</span>
            </div>
          ) : (
            <p style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65 }}>{dayeBrief}</p>
          )}
        </div>
      </div>
    </motion.div>
  ) : null

  return (
    <Layout profile={profile} onSignOut={signOut} title="CYBER GLOBE">
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* Mobile tab bar */}
        {isMobile && (
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            {(['list', 'globe'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                style={{
                  flex: 1, padding: '11px', background: mobileTab === tab ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: 'none', borderBottom: mobileTab === tab ? '2px solid var(--text-1)' : '2px solid transparent',
                  fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.12em',
                  color: mobileTab === tab ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer', textTransform: 'uppercase',
                }}
              >
                {tab === 'list' ? 'Countries' : 'Globe'}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {/* Sidebar — hidden on mobile GLOBE tab */}
          {(!isMobile || mobileTab === 'list') && (
            <div style={{
              width: isMobile ? '100%' : 300,
              flexShrink: 0,
              borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(0,0,0,0.4)', overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Globe2 size={16} style={{ color: 'var(--text-1)' }} />
                  <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: '0.12em', color: 'var(--text-1)', lineHeight: 1 }}>CYBER GLOBE</h2>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={11} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search country..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '8px 12px 8px 28px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-1)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Country list */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filtered.map((country) => {
                  const color = RISK_COLORS[country.riskLevel]
                  const isSelected = selectedCountry?.name === country.name
                  return (
                    <button key={country.code} onClick={() => handleSelectCountry(country)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}70` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Syne', fontSize: 13, color: isSelected ? 'var(--text-1)' : 'var(--text-2)', fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country.name}</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color, letterSpacing: '0.08em' }}>{country.riskLevel.toUpperCase()} RISK</p>
                      </div>
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 18, color, flexShrink: 0 }}>{country.riskScore}</p>
                      {isSelected && <ChevronRight size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 7 }}>THREAT LEVELS</p>
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
          )}

          {/* Globe view — hidden on mobile LIST tab */}
          {(!isMobile || mobileTab === 'globe') && (
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
              {/* Globe canvas */}
              <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <GlobeCanvas
                  selectedCountry={selectedCountry?.name || null}
                  onSelectCountry={handleSelectCountry}
                  focusLng={selectedCountry?.lng ?? null}
                />
                {/* Overlay hint */}
                <div style={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }}>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 8, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>DRAG TO ROTATE · CLICK TO SELECT</p>
                </div>
                {/* Stats */}
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
                  {[
                    { label: 'CRITICAL', count: COUNTRIES.filter((c) => c.riskLevel === 'critical').length, color: '#FF2D2D' },
                    { label: 'HIGH', count: COUNTRIES.filter((c) => c.riskLevel === 'high').length, color: '#FF9500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ padding: '5px 10px', background: 'rgba(0,0,0,0.7)', border: `1px solid ${color}30`, borderRadius: 7, backdropFilter: 'blur(10px)' }}>
                      <p style={{ fontFamily: 'Bebas Neue', fontSize: 16, color, lineHeight: 1 }}>{count}</p>
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 7, color: 'var(--text-3)', letterSpacing: '0.1em' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country panel — desktop inline, mobile bottom-sheet */}
              <AnimatePresence>
                {selectedCountry && !isMobile && (
                  <CountryPanel style={{ maxHeight: '48%', flexShrink: 0 }} />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile bottom sheet country panel */}
        <AnimatePresence>
          {selectedCountry && isMobile && mobileTab === 'globe' && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, maxHeight: '60vh', overflowY: 'auto' }}>
              <CountryPanel />
            </div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}
