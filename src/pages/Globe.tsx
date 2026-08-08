import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { Search, X, Newspaper, Brain, AlertTriangle, Clock, ExternalLink, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { useCyberNews, SOURCE_COLORS, timeAgo, type CyberArticle } from '../hooks/useCyberNews'
import { supabase } from '../lib/supabase'
import { AskDayeButton } from '../components/daye/AskDayeButton'

// ─── Country Data ────────────────────────────────────────────────────────────

interface Country {
  code: string
  name: string
  lat: number
  lon: number
}

// Live, Claude-generated per-country threat brief (fetched on demand from the
// globe-country-brief edge function — nothing here is hardcoded or fabricated).
interface CountryBrief {
  threatLevel: number
  threatLabel: string
  overview: string
  good: string
  bad: string
  ugly: string
  aware: string
  recommended: string
}

// Geographic reference data only (ISO 3166-1 alpha-2 code, name, approximate
// centroid). This is real, static geography — not fabricated intelligence.
// Threat data for each country is fetched live per-country (see CountryBrief).
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', lat: 38.9, lon: -77.0 },
  { code: 'RU', name: 'Russia', lat: 55.75, lon: 37.62 },
  { code: 'CN', name: 'China', lat: 39.9, lon: 116.4 },
  { code: 'GB', name: 'United Kingdom', lat: 51.5, lon: -0.12 },
  { code: 'DE', name: 'Germany', lat: 52.52, lon: 13.4 },
  { code: 'KP', name: 'North Korea', lat: 39.0, lon: 125.75 },
  { code: 'IR', name: 'Iran', lat: 35.7, lon: 51.4 },
  { code: 'UA', name: 'Ukraine', lat: 50.45, lon: 30.52 },
  { code: 'IL', name: 'Israel', lat: 31.78, lon: 35.22 },
  { code: 'IN', name: 'India', lat: 28.6, lon: 77.2 },
  { code: 'AU', name: 'Australia', lat: -35.28, lon: 149.13 },
  { code: 'JP', name: 'Japan', lat: 35.68, lon: 139.69 },
  { code: 'NL', name: 'Netherlands', lat: 52.37, lon: 4.89 },
  { code: 'BR', name: 'Brazil', lat: -15.78, lon: -47.93 },
  { code: 'ZA', name: 'South Africa', lat: -25.75, lon: 28.19 },
  { code: 'NG', name: 'Nigeria', lat: 9.07, lon: 7.4 },
  { code: 'EG', name: 'Egypt', lat: 30.06, lon: 31.25 },
  { code: 'KE', name: 'Kenya', lat: -1.28, lon: 36.82 },
  { code: 'MA', name: 'Morocco', lat: 34.02, lon: -6.84 },
  { code: 'ET', name: 'Ethiopia', lat: 9.03, lon: 38.74 },
  { code: 'SO', name: 'Somalia', lat: 2.05, lon: 45.34 },
  { code: 'LY', name: 'Libya', lat: 32.9, lon: 13.18 },
  { code: 'DZ', name: 'Algeria', lat: 36.74, lon: 3.06 },
  { code: 'TN', name: 'Tunisia', lat: 36.81, lon: 10.18 },
  { code: 'GH', name: 'Ghana', lat: 5.56, lon: -0.2 },
  { code: 'SD', name: 'Sudan', lat: 15.55, lon: 32.53 },
  { code: 'AO', name: 'Angola', lat: -8.84, lon: 13.23 },
  { code: 'MZ', name: 'Mozambique', lat: -25.97, lon: 32.57 },
  { code: 'MG', name: 'Madagascar', lat: -18.91, lon: 47.54 },
  { code: 'CM', name: 'Cameroon', lat: 3.87, lon: 11.52 },
  { code: 'CI', name: "Côte d'Ivoire", lat: 6.82, lon: -5.27 },
  { code: 'TZ', name: 'Tanzania', lat: -6.17, lon: 35.74 },
  { code: 'UG', name: 'Uganda', lat: 0.32, lon: 32.58 },
  { code: 'ZW', name: 'Zimbabwe', lat: -17.83, lon: 31.05 },
  { code: 'ZM', name: 'Zambia', lat: -15.42, lon: 28.28 },
  { code: 'SN', name: 'Senegal', lat: 14.72, lon: -17.47 },
  { code: 'RW', name: 'Rwanda', lat: -1.95, lon: 30.06 },
  { code: 'CD', name: 'DR Congo', lat: -4.33, lon: 15.32 },
  { code: 'ML', name: 'Mali', lat: 12.65, lon: -8.0 },
  { code: 'BF', name: 'Burkina Faso', lat: 12.37, lon: -1.53 },
  { code: 'NE', name: 'Niger', lat: 13.51, lon: 2.12 },
  { code: 'TD', name: 'Chad', lat: 12.11, lon: 15.04 },
  { code: 'SS', name: 'South Sudan', lat: 4.85, lon: 31.6 },
  { code: 'MW', name: 'Malawi', lat: -13.97, lon: 33.79 },
  { code: 'GN', name: 'Guinea', lat: 9.54, lon: -13.68 },
  { code: 'BJ', name: 'Benin', lat: 6.37, lon: 2.42 },
  { code: 'BI', name: 'Burundi', lat: -3.43, lon: 29.93 },
  { code: 'TG', name: 'Togo', lat: 6.14, lon: 1.22 },
  { code: 'SL', name: 'Sierra Leone', lat: 8.49, lon: -13.23 },
  { code: 'LR', name: 'Liberia', lat: 6.3, lon: -10.8 },
  { code: 'MR', name: 'Mauritania', lat: 18.08, lon: -15.98 },
  { code: 'ER', name: 'Eritrea', lat: 15.33, lon: 38.93 },
  { code: 'NA', name: 'Namibia', lat: -22.56, lon: 17.08 },
  { code: 'BW', name: 'Botswana', lat: -24.65, lon: 25.91 },
  { code: 'GA', name: 'Gabon', lat: 0.39, lon: 9.45 },
  { code: 'MU', name: 'Mauritius', lat: -20.16, lon: 57.49 },
  { code: 'GM', name: 'Gambia', lat: 13.45, lon: -16.58 },
  { code: 'GW', name: 'Guinea-Bissau', lat: 11.87, lon: -15.6 },
  { code: 'GQ', name: 'Equatorial Guinea', lat: 3.75, lon: 8.78 },
  { code: 'SZ', name: 'Eswatini', lat: -26.32, lon: 31.14 },
  { code: 'LS', name: 'Lesotho', lat: -29.32, lon: 27.48 },
  { code: 'DJ', name: 'Djibouti', lat: 11.59, lon: 43.15 },
  { code: 'KM', name: 'Comoros', lat: -11.7, lon: 43.26 },
  { code: 'CV', name: 'Cape Verde', lat: 14.93, lon: -23.51 },
  { code: 'ST', name: 'São Tomé and Príncipe', lat: 0.33, lon: 6.73 },
  { code: 'SC', name: 'Seychelles', lat: -4.62, lon: 55.45 },
  { code: 'CF', name: 'Central African Republic', lat: 4.36, lon: 18.55 },
  { code: 'CG', name: 'Republic of Congo', lat: -4.27, lon: 15.27 },
  { code: 'CA', name: 'Canada', lat: 45.42, lon: -75.7 },
  { code: 'MX', name: 'Mexico', lat: 19.43, lon: -99.13 },
  { code: 'GT', name: 'Guatemala', lat: 14.63, lon: -90.51 },
  { code: 'BZ', name: 'Belize', lat: 17.25, lon: -88.77 },
  { code: 'SV', name: 'El Salvador', lat: 13.69, lon: -89.19 },
  { code: 'HN', name: 'Honduras', lat: 14.1, lon: -87.22 },
  { code: 'NI', name: 'Nicaragua', lat: 12.11, lon: -86.24 },
  { code: 'CR', name: 'Costa Rica', lat: 9.93, lon: -84.08 },
  { code: 'PA', name: 'Panama', lat: 8.98, lon: -79.52 },
  { code: 'CU', name: 'Cuba', lat: 23.13, lon: -82.38 },
  { code: 'JM', name: 'Jamaica', lat: 18.01, lon: -76.8 },
  { code: 'HT', name: 'Haiti', lat: 18.59, lon: -72.31 },
  { code: 'DO', name: 'Dominican Republic', lat: 18.49, lon: -69.94 },
  { code: 'BS', name: 'Bahamas', lat: 25.03, lon: -77.4 },
  { code: 'BB', name: 'Barbados', lat: 13.1, lon: -59.62 },
  { code: 'TT', name: 'Trinidad and Tobago', lat: 10.65, lon: -61.52 },
  { code: 'GD', name: 'Grenada', lat: 12.05, lon: -61.75 },
  { code: 'LC', name: 'Saint Lucia', lat: 14.01, lon: -60.99 },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', lat: 13.16, lon: -61.22 },
  { code: 'AG', name: 'Antigua and Barbuda', lat: 17.13, lon: -61.85 },
  { code: 'KN', name: 'Saint Kitts and Nevis', lat: 17.3, lon: -62.73 },
  { code: 'DM', name: 'Dominica', lat: 15.3, lon: -61.39 },
  { code: 'CO', name: 'Colombia', lat: 4.71, lon: -74.07 },
  { code: 'VE', name: 'Venezuela', lat: 10.48, lon: -66.9 },
  { code: 'GY', name: 'Guyana', lat: 6.8, lon: -58.16 },
  { code: 'SR', name: 'Suriname', lat: 5.87, lon: -55.17 },
  { code: 'EC', name: 'Ecuador', lat: -0.23, lon: -78.52 },
  { code: 'PE', name: 'Peru', lat: -12.05, lon: -77.04 },
  { code: 'BO', name: 'Bolivia', lat: -16.5, lon: -68.15 },
  { code: 'PY', name: 'Paraguay', lat: -25.28, lon: -57.63 },
  { code: 'UY', name: 'Uruguay', lat: -34.9, lon: -56.16 },
  { code: 'CL', name: 'Chile', lat: -33.45, lon: -70.67 },
  { code: 'AR', name: 'Argentina', lat: -34.6, lon: -58.38 },
  { code: 'FR', name: 'France', lat: 48.85, lon: 2.35 },
  { code: 'ES', name: 'Spain', lat: 40.42, lon: -3.7 },
  { code: 'PT', name: 'Portugal', lat: 38.72, lon: -9.14 },
  { code: 'IT', name: 'Italy', lat: 41.9, lon: 12.5 },
  { code: 'CH', name: 'Switzerland', lat: 46.95, lon: 7.45 },
  { code: 'AT', name: 'Austria', lat: 48.21, lon: 16.37 },
  { code: 'BE', name: 'Belgium', lat: 50.85, lon: 4.35 },
  { code: 'IE', name: 'Ireland', lat: 53.35, lon: -6.26 },
  { code: 'LU', name: 'Luxembourg', lat: 49.61, lon: 6.13 },
  { code: 'DK', name: 'Denmark', lat: 55.68, lon: 12.57 },
  { code: 'SE', name: 'Sweden', lat: 59.33, lon: 18.07 },
  { code: 'NO', name: 'Norway', lat: 59.91, lon: 10.75 },
  { code: 'FI', name: 'Finland', lat: 60.17, lon: 24.94 },
  { code: 'IS', name: 'Iceland', lat: 64.15, lon: -21.94 },
  { code: 'PL', name: 'Poland', lat: 52.23, lon: 21.01 },
  { code: 'CZ', name: 'Czechia', lat: 50.09, lon: 14.42 },
  { code: 'SK', name: 'Slovakia', lat: 48.15, lon: 17.11 },
  { code: 'HU', name: 'Hungary', lat: 47.5, lon: 19.04 },
  { code: 'RO', name: 'Romania', lat: 44.43, lon: 26.1 },
  { code: 'BG', name: 'Bulgaria', lat: 42.7, lon: 23.32 },
  { code: 'GR', name: 'Greece', lat: 37.98, lon: 23.73 },
  { code: 'HR', name: 'Croatia', lat: 45.81, lon: 15.98 },
  { code: 'SI', name: 'Slovenia', lat: 46.06, lon: 14.51 },
  { code: 'RS', name: 'Serbia', lat: 44.79, lon: 20.45 },
  { code: 'BA', name: 'Bosnia and Herzegovina', lat: 43.86, lon: 18.41 },
  { code: 'ME', name: 'Montenegro', lat: 42.44, lon: 19.26 },
  { code: 'MK', name: 'North Macedonia', lat: 42.0, lon: 21.43 },
  { code: 'AL', name: 'Albania', lat: 41.33, lon: 19.82 },
  { code: 'EE', name: 'Estonia', lat: 59.44, lon: 24.75 },
  { code: 'LV', name: 'Latvia', lat: 56.95, lon: 24.11 },
  { code: 'LT', name: 'Lithuania', lat: 54.69, lon: 25.28 },
  { code: 'BY', name: 'Belarus', lat: 53.9, lon: 27.57 },
  { code: 'MD', name: 'Moldova', lat: 47.01, lon: 28.86 },
  { code: 'CY', name: 'Cyprus', lat: 35.17, lon: 33.36 },
  { code: 'MT', name: 'Malta', lat: 35.9, lon: 14.51 },
  { code: 'LI', name: 'Liechtenstein', lat: 47.14, lon: 9.52 },
  { code: 'MC', name: 'Monaco', lat: 43.73, lon: 7.42 },
  { code: 'SM', name: 'San Marino', lat: 43.94, lon: 12.45 },
  { code: 'AD', name: 'Andorra', lat: 42.51, lon: 1.52 },
  { code: 'VA', name: 'Vatican City', lat: 41.9, lon: 12.45 },
  { code: 'TR', name: 'Turkey', lat: 39.93, lon: 32.86 },
  { code: 'SA', name: 'Saudi Arabia', lat: 24.71, lon: 46.68 },
  { code: 'AE', name: 'United Arab Emirates', lat: 24.45, lon: 54.38 },
  { code: 'QA', name: 'Qatar', lat: 25.29, lon: 51.53 },
  { code: 'KW', name: 'Kuwait', lat: 29.38, lon: 47.99 },
  { code: 'BH', name: 'Bahrain', lat: 26.23, lon: 50.59 },
  { code: 'OM', name: 'Oman', lat: 23.61, lon: 58.59 },
  { code: 'YE', name: 'Yemen', lat: 15.35, lon: 44.21 },
  { code: 'JO', name: 'Jordan', lat: 31.95, lon: 35.93 },
  { code: 'LB', name: 'Lebanon', lat: 33.89, lon: 35.5 },
  { code: 'SY', name: 'Syria', lat: 33.51, lon: 36.28 },
  { code: 'IQ', name: 'Iraq', lat: 33.31, lon: 44.36 },
  { code: 'PS', name: 'Palestine', lat: 31.9, lon: 35.2 },
  { code: 'AF', name: 'Afghanistan', lat: 34.53, lon: 69.17 },
  { code: 'PK', name: 'Pakistan', lat: 33.68, lon: 73.05 },
  { code: 'GE', name: 'Georgia', lat: 41.72, lon: 44.79 },
  { code: 'AM', name: 'Armenia', lat: 40.18, lon: 44.51 },
  { code: 'AZ', name: 'Azerbaijan', lat: 40.41, lon: 49.87 },
  { code: 'KZ', name: 'Kazakhstan', lat: 51.18, lon: 71.45 },
  { code: 'UZ', name: 'Uzbekistan', lat: 41.31, lon: 69.24 },
  { code: 'TM', name: 'Turkmenistan', lat: 37.95, lon: 58.38 },
  { code: 'TJ', name: 'Tajikistan', lat: 38.56, lon: 68.77 },
  { code: 'KG', name: 'Kyrgyzstan', lat: 42.87, lon: 74.59 },
  { code: 'MN', name: 'Mongolia', lat: 47.92, lon: 106.92 },
  { code: 'KR', name: 'South Korea', lat: 37.57, lon: 126.98 },
  { code: 'TW', name: 'Taiwan', lat: 25.03, lon: 121.56 },
  { code: 'MM', name: 'Myanmar', lat: 19.75, lon: 96.13 },
  { code: 'TH', name: 'Thailand', lat: 13.75, lon: 100.5 },
  { code: 'VN', name: 'Vietnam', lat: 21.03, lon: 105.85 },
  { code: 'LA', name: 'Laos', lat: 17.97, lon: 102.6 },
  { code: 'KH', name: 'Cambodia', lat: 11.55, lon: 104.92 },
  { code: 'MY', name: 'Malaysia', lat: 3.14, lon: 101.69 },
  { code: 'SG', name: 'Singapore', lat: 1.35, lon: 103.82 },
  { code: 'ID', name: 'Indonesia', lat: -6.21, lon: 106.85 },
  { code: 'PH', name: 'Philippines', lat: 14.6, lon: 120.98 },
  { code: 'BN', name: 'Brunei', lat: 4.94, lon: 114.95 },
  { code: 'TL', name: 'Timor-Leste', lat: -8.55, lon: 125.56 },
  { code: 'BD', name: 'Bangladesh', lat: 23.81, lon: 90.41 },
  { code: 'LK', name: 'Sri Lanka', lat: 6.93, lon: 79.85 },
  { code: 'NP', name: 'Nepal', lat: 27.72, lon: 85.32 },
  { code: 'BT', name: 'Bhutan', lat: 27.47, lon: 89.64 },
  { code: 'MV', name: 'Maldives', lat: 4.18, lon: 73.51 },
  { code: 'NZ', name: 'New Zealand', lat: -41.29, lon: 174.78 },
  { code: 'PG', name: 'Papua New Guinea', lat: -9.48, lon: 147.15 },
  { code: 'FJ', name: 'Fiji', lat: -18.14, lon: 178.44 },
  { code: 'SB', name: 'Solomon Islands', lat: -9.43, lon: 159.95 },
  { code: 'VU', name: 'Vanuatu', lat: -17.73, lon: 168.32 },
  { code: 'WS', name: 'Samoa', lat: -13.83, lon: -171.76 },
  { code: 'TO', name: 'Tonga', lat: -21.14, lon: -175.2 },
  { code: 'KI', name: 'Kiribati', lat: 1.45, lon: 173.03 },
  { code: 'FM', name: 'Micronesia', lat: 6.92, lon: 158.16 },
  { code: 'MH', name: 'Marshall Islands', lat: 7.1, lon: 171.38 },
  { code: 'PW', name: 'Palau', lat: 7.34, lon: 134.48 },
  { code: 'NR', name: 'Nauru', lat: -0.53, lon: 166.92 },
  { code: 'TV', name: 'Tuvalu', lat: -8.52, lon: 179.2 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function latLonToXYZ(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

// Color for a live-fetched DAYE threat label. Markers/badges stay neutral blue
// until a real brief has been fetched for that country — never a fabricated default.
function threatColor(label?: string): string {
  switch (label) {
    case 'CRITICAL': return '#FF2D2D'
    case 'HIGH': return '#FF9500'
    case 'ELEVATED': return '#FFD60A'
    case 'LOW': return '#30D158'
    default: return '#0A84FF'
  }
}

// ─── Globe Grid Lines ─────────────────────────────────────────────────────────

function GlobeGrid() {
  const linesRef = useRef<THREE.LineSegments>(null)

  useEffect(() => {
    const R = 2.21
    const points: number[] = []

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = (90 - lat) * (Math.PI / 180)
      const segments = 64
      for (let i = 0; i < segments; i++) {
        const t0 = (i / segments) * Math.PI * 2
        const t1 = ((i + 1) / segments) * Math.PI * 2
        points.push(
          R * Math.sin(phi) * Math.cos(t0), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t0),
          R * Math.sin(phi) * Math.cos(t1), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t1),
        )
      }
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 20) {
      const theta = lon * (Math.PI / 180)
      const segments = 64
      for (let i = 0; i < segments; i++) {
        const phi0 = (i / segments) * Math.PI
        const phi1 = ((i + 1) / segments) * Math.PI
        points.push(
          R * Math.sin(phi0) * Math.cos(theta), R * Math.cos(phi0), R * Math.sin(phi0) * Math.sin(theta),
          R * Math.sin(phi1) * Math.cos(theta), R * Math.cos(phi1), R * Math.sin(phi1) * Math.sin(theta),
        )
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    if (linesRef.current) {
      linesRef.current.geometry = geom
    }
  }, [])

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#0A84FF" transparent opacity={0.15} />
    </lineSegments>
  )
}

// ─── Country Marker ───────────────────────────────────────────────────────────

interface MarkerProps {
  country: Country
  isSelected: boolean
  color: string
  onClick: () => void
}

function CountryMarker({ country, isSelected, color, onClick }: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [pos] = useState(() => latLonToXYZ(country.lat, country.lon, 2.24))
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return
    const t = clock.getElapsedTime()
    const pulse = isSelected ? 1 + Math.sin(t * 4) * 0.4 : 1 + Math.sin(t * 2 + country.lat) * 0.15
    meshRef.current.scale.setScalar(pulse)
    glowRef.current.scale.setScalar(pulse * 2.2)
    const mat = glowRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = isSelected
      ? 0.35 + Math.sin(t * 4) * 0.15
      : 0.12 + Math.sin(t * 2 + country.lat) * 0.05
  })

  return (
    <group
      position={pos}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto' }}
    >
      {/* Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Core marker */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 2 : 0.8}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Name tooltip — only on hover or when selected, never all 196 at once */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.1, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }} zIndexRange={[50, 0]}>
          <div style={{
            background: 'var(--void-1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${color}55`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-1)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            letterSpacing: '0.01em',
          }}>
            {country.name}
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── Globe Scene ──────────────────────────────────────────────────────────────

interface GlobeSceneProps {
  selectedCountry: Country | null
  onSelectCountry: (country: Country) => void
  rotationRef: React.MutableRefObject<{ y: number; paused: boolean; resumeTimer: number }>
  briefs: Record<string, CountryBrief>
}

function GlobeScene({ selectedCountry, onSelectCountry, rotationRef, briefs }: GlobeSceneProps) {
  const globeRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useEffect(() => {
    (camera as any).position.set(0, 0, 6.5)
  }, [camera])

  useFrame(({ clock }) => {
    if (!globeRef.current) return
    const now = clock.getElapsedTime()

    // Handle auto-resume after interaction pause
    if (rotationRef.current.paused && rotationRef.current.resumeTimer > 0) {
      if (now > rotationRef.current.resumeTimer) {
        rotationRef.current.paused = false
        rotationRef.current.resumeTimer = 0
      }
    }

    if (selectedCountry && !rotationRef.current.paused) {
      // Lerp toward target Y so selected country faces camera
      const targetY = -(selectedCountry.lon * Math.PI) / 180
      const diff = targetY - globeRef.current.rotation.y
      const wrapped = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
      globeRef.current.rotation.y += wrapped * 0.04
    } else if (!selectedCountry && !rotationRef.current.paused) {
      globeRef.current.rotation.y += 0.0017
    }

    rotationRef.current.y = globeRef.current.rotation.y
  })

  return (
    <group ref={globeRef}>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshBasicMaterial color="#0A84FF" transparent opacity={0.04} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Main globe sphere */}
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.7}
          metalness={0.25}
        />
      </mesh>

      <GlobeGrid />

      {/* Country markers — neutral blue until a live brief has actually been
          fetched for that country this session; only then does it recolor
          to its real DAYE-assessed severity. */}
      {COUNTRIES.map((country) => (
        <CountryMarker
          key={country.code}
          country={country}
          isSelected={selectedCountry?.code === country.code}
          color={threatColor(briefs[country.code]?.threatLabel)}
          onClick={() => onSelectCountry(country)}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.15} color="#0A84FF" />
      <pointLight position={[0, 0, 6]} intensity={0.4} color="#0A84FF" distance={12} />
    </group>
  )
}

// ─── Threat Level Bar ─────────────────────────────────────────────────────────

function ThreatBar({ level, color }: { level: number; color: string }) {
  const pct = (level / 10) * 100
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
        <span>Threat Level</span>
        <span style={{ color, fontWeight: 700 }}>{level.toFixed(1)} / 10</span>
      </div>
      <div style={{ height: 6, background: 'var(--ovw-0p06)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
        />
      </div>
    </div>
  )
}

// ─── Situation Row ────────────────────────────────────────────────────────────

function SituationRow({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: accent,
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{ width: 3, height: 12, background: accent, borderRadius: 99 }} />
        {label}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-2)' }}>{text}</p>
    </div>
  )
}

// ─── Loading Skeleton (matches newsLoading skeleton style used elsewhere) ─────

function SkeletonLines({ count = 6 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ marginBottom: 18, opacity: Math.max(0.35, 1 - i * 0.1) }}>
          <div style={{ height: 8, width: 100, background: 'var(--ovw-0p08)', borderRadius: 3, marginBottom: 8 }} />
          <div style={{ height: 11, background: 'var(--ovw-0p06)', borderRadius: 3, marginBottom: 5 }} />
          <div style={{ height: 11, background: 'var(--ovw-0p05)', borderRadius: 3, width: `${72 - i * 5}%` }} />
        </div>
      ))}
    </>
  )
}

// ─── Live news matching (no fabricated headlines — filters the real feed) ─────

// A few common aliases so obvious references still match without overengineering.
const COUNTRY_ALIASES: Record<string, string[]> = {
  US: ['united states', 'u.s.', 'usa', 'american'],
  GB: ['united kingdom', 'u.k.', 'uk', 'british'],
  KR: ['south korea'],
  KP: ['north korea'],
  AE: ['uae', 'emirates'],
  RU: ['russian'],
  CN: ['chinese'],
}

function matchesCountry(article: CyberArticle, country: Country): boolean {
  const haystack = `${article.title} ${article.description || ''}`.toLowerCase()
  const terms = [country.name.toLowerCase(), ...(COUNTRY_ALIASES[country.code] || [])]
  return terms.some((t) => haystack.includes(t))
}

function NewsMatchCard({ article }: { article: CyberArticle }) {
  const color = SOURCE_COLORS[article.source_name] || '#98989D'
  return (
    <a
      href={article.article_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        background: 'var(--ovw-0p03)',
        border: '1px solid var(--ovw-0p07)',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 10,
        textDecoration: 'none',
      }}
    >
      <div style={{
        width: 3,
        flexShrink: 0,
        alignSelf: 'stretch',
        background: color,
        borderRadius: 99,
        boxShadow: `0 0 8px ${color}66`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color, fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>{article.source_name}</span>
          <span style={{ color: 'var(--text-3)' }}>·</span>
          <span>{timeAgo(article.published_at)}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{article.title}</div>
      </div>
      <ExternalLink size={13} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 2 }} />
    </a>
  )
}

// ─── Country Panel ────────────────────────────────────────────────────────────

type Tab = 'situation' | 'news'

interface CountryPanelProps {
  country: Country
  brief: CountryBrief | null
  loading: boolean
  articles: CyberArticle[]
  onClose: () => void
}

function CountryPanel({ country, brief, loading, articles, onClose }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('situation')
  const [expanded, setExpanded] = useState(false)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'situation', label: 'DAYE Briefing', icon: <Brain size={12} /> },
    { id: 'news', label: 'News', icon: <Newspaper size={12} /> },
  ]

  const color = threatColor(brief?.threatLabel)
  const matchedArticles = articles.filter((a) => matchesCountry(a, country))

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1, maxHeight: expanded ? '88vh' : '55vh' }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.y < -60) setExpanded(true)
        else if (info.offset.y > 60) {
          if (expanded) setExpanded(false)
          else onClose()
        }
      }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--void-1)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid var(--ovw-0p1)',
        borderRadius: '28px 28px 0 0',
        boxShadow: '0 -32px 80px rgba(0,0,0,0.8), inset 0 1px 0 var(--ovw-0p12)',
        touchAction: 'none',
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', cursor: 'grab', flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, background: 'var(--ovw-0p22)', borderRadius: 99 }} />
      </div>

      {/* Header */}
      <div style={{
        padding: '12px 24px 0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, Syne, sans-serif' }}>
              {country.name}
            </div>
            <div style={{
              background: `${color}22`,
              border: `1px solid ${color}55`,
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 700,
              color,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              {loading ? (
                <>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, animation: 'pulseDot 1.2s infinite' }} />
                  ANALYZING
                </>
              ) : (brief?.threatLabel || 'UNASSESSED')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--ovw-0p08)',
              border: '1px solid var(--ovw-0p12)',
              borderRadius: 10,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-2)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Threat bar — real, live-fetched DAYE assessment only */}
        {loading ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
              <span>Threat Level</span>
              <span style={{ color: 'var(--text-3)' }}>DAYE analyzing…</span>
            </div>
            <div style={{ height: 6, background: 'var(--ovw-0p06)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                animate={{ x: ['-100%', '220%'] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
                style={{ height: '100%', width: '30%', borderRadius: 99, background: 'rgba(10,132,255,0.5)' }}
              />
            </div>
          </div>
        ) : brief ? (
          <ThreatBar level={brief.threatLevel} color={color} />
        ) : null}

        {/* Tab pills */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, paddingBottom: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                borderRadius: 99,
                border: activeTab === tab.id ? '1px solid rgba(10,132,255,0.5)' : '1px solid var(--ovw-0p08)',
                background: activeTab === tab.id ? 'rgba(10,132,255,0.18)' : 'var(--ovw-0p04)',
                color: activeTab === tab.id ? '#0A84FF' : 'var(--text-2)',
                fontSize: 11,
                fontWeight: activeTab === tab.id ? 600 : 400,
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 32px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'situation' && (
            <motion.div key="situation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(10,132,255,0.15)',
                  border: '1px solid rgba(10,132,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Brain size={18} color="#0A84FF" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>DAYE Live Assessment</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Generated on demand for {country.name} — not pre-written</div>
                </div>
              </div>
              {loading && <SkeletonLines count={6} />}
              {!loading && brief && (
                <>
                  <SituationRow label="The Overview" text={brief.overview} accent="#98989D" />
                  <SituationRow label="The Good" text={brief.good} accent="#30D158" />
                  <SituationRow label="The Bad" text={brief.bad} accent="#FF9500" />
                  <SituationRow label="The Ugly" text={brief.ugly} accent="#FF2D2D" />
                  <SituationRow label="Be Aware Of" text={brief.aware} accent="#FFD60A" />
                  <SituationRow label="Recommended Actions" text={brief.recommended} accent="#0A84FF" />
                  <AskDayeButton
                    contextType="globe_country"
                    data={{ country: country.name, threatLevel: brief.threatLevel, threatLabel: brief.threatLabel, overview: brief.overview }}
                    label="Ask DAYE to go deeper"
                  />
                </>
              )}
              {!loading && !brief && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <AlertTriangle size={20} color="var(--text-3)" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    DAYE could not generate a live brief for this region. Try again shortly.
                  </p>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'news' && (
            <motion.div key="news" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {matchedArticles.length > 0 ? (
                matchedArticles.map((article) => (
                  <NewsMatchCard key={article.article_url} article={article} />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <Newspaper size={20} color="var(--text-3)" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 10 }}>
                    No live reports mentioning {country.name} right now — check the global feed.
                  </p>
                  <Link to="/news" style={{ fontSize: 12, color: '#0A84FF', fontWeight: 600, textDecoration: 'none' }}>
                    View global threat feed →
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

interface SearchBarProps {
  onSelect: (country: Country) => void
}

function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const results = query.length > 0
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--void-1)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: `1px solid ${focused ? 'rgba(10,132,255,0.5)' : 'var(--ovw-0p12)'}`,
        borderRadius: 99,
        padding: '10px 16px',
        transition: 'border-color 0.2s ease',
        boxShadow: focused ? '0 0 0 3px rgba(10,132,255,0.12)' : '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <Search size={14} color={focused ? '#0A84FF' : 'var(--text-3)'} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search countries..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-1)',
            fontSize: 13,
            flex: 1,
            fontFamily: 'system-ui, -apple-system, Syne, sans-serif',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', padding: 0, lineHeight: 0 }}>
            <X size={13} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {results.length > 0 && focused && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'var(--void-1)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid var(--ovw-0p1)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              zIndex: 200,
            }}
          >
            {results.map((country) => (
              <button
                key={country.code}
                onMouseDown={() => { onSelect(country); setQuery(''); setFocused(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--ovw-0p05)',
                  color: 'var(--text-1)',
                  fontSize: 13,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,132,255,0.08)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none' }}
              >
                <span>{country.name}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-3)',
                  background: 'var(--ovw-0p06)',
                  border: '1px solid var(--ovw-0p1)',
                  borderRadius: 6,
                  padding: '2px 7px',
                  letterSpacing: '0.06em',
                }}>
                  {country.code}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Globe Page ──────────────────────────────────────────────────────────

export default function Globe() {
  const { profile, signOut } = useAuth()
  const { articles, loading: newsLoading } = useCyberNews()
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [showHint, setShowHint] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showLiveFeed, setShowLiveFeed] = useState(false)
  const [liveFilterCat, setLiveFilterCat] = useState('all')
  const rotationRef = useRef({ y: 0, paused: false, resumeTimer: 0 })
  const orbitRef = useRef<any>(null)

  // Live, session-cached DAYE briefs per country code. Nothing here is
  // hardcoded — each entry comes from the globe-country-brief edge function
  // the first time that country is selected, and is reused for the rest
  // of the session (and cached server-side for 24h via the edge function).
  const [briefs, setBriefs] = useState<Record<string, CountryBrief>>({})
  const [briefLoading, setBriefLoading] = useState<Record<string, boolean>>({})
  const fetchingRef = useRef<Set<string>>(new Set())

  const fetchBrief = useCallback((country: Country) => {
    if (briefs[country.code] || fetchingRef.current.has(country.code)) return
    fetchingRef.current.add(country.code)
    setBriefLoading((prev) => ({ ...prev, [country.code]: true }))
    supabase.functions
      .invoke('globe-country-brief', { body: { code: country.code, name: country.name } })
      .then(({ data, error }) => {
        if (!error && data && typeof data.overview === 'string') {
          setBriefs((prev) => ({ ...prev, [country.code]: data as CountryBrief }))
        }
      })
      .catch(() => {
        // Leave brief unset — CountryPanel renders the "could not generate" state.
      })
      .finally(() => {
        fetchingRef.current.delete(country.code)
        setBriefLoading((prev) => ({ ...prev, [country.code]: false }))
      })
  }, [briefs])

  // Hide hint after first interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true)
      gsap.to({}, {
        duration: 0.6,
        onComplete: () => setShowHint(false),
      })
    }
  }, [hasInteracted])

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country)
    setShowHint(false)
    setHasInteracted(true)
    fetchBrief(country)
  }, [fetchBrief])

  const handleClosePanel = useCallback(() => {
    setSelectedCountry(null)
    // Resume auto-rotation after 3s
    rotationRef.current.paused = false
  }, [])

  // Pause rotation on OrbitControls interaction
  const handleOrbitStart = useCallback(() => {
    rotationRef.current.paused = true
    rotationRef.current.resumeTimer = 0
    handleInteraction()
  }, [handleInteraction])

  const handleOrbitEnd = useCallback(() => {
    // Schedule resume in 3 seconds (will be read in useFrame via clock time)
    rotationRef.current.resumeTimer = Date.now() / 1000 + 3
  }, [])

  return (
    <Layout profile={profile} onSignOut={signOut} title="Global Threat Map">
      <div style={{ height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden', background: '#000508' }}>

        {/* Three.js Canvas */}
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          onPointerDown={handleInteraction}
        >
          <Canvas
            gl={{ antialias: true, alpha: false }}
            camera={{ position: [0, 0, 6.5], fov: 45 }}
            style={{ background: 'transparent' }}
          >
            <GlobeScene
              selectedCountry={selectedCountry}
              onSelectCountry={handleSelectCountry}
              rotationRef={rotationRef}
              briefs={briefs}
            />
            <OrbitControls
              ref={orbitRef}
              enablePan={false}
              minDistance={4}
              maxDistance={8}
              enableDamping
              dampingFactor={0.08}
              onStart={handleOrbitStart}
              onEnd={handleOrbitEnd}
            />
          </Canvas>
        </div>

        {/* Top-center: Search bar overlay */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: '90%',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <SearchBar onSelect={handleSelectCountry} />
        </div>

        {/* Top-left: Legend */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 20,
            left: 16,
            zIndex: 20,
            background: 'rgba(6,6,6,0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--ovw-0p08)',
            borderRadius: 14,
            padding: '10px 14px',
          }}
        >
          {[
            { label: 'Not yet assessed', color: '#0A84FF' },
            { label: 'Low', color: '#30D158' },
            { label: 'Elevated', color: '#FFD60A' },
            { label: 'High', color: '#FF9500' },
            { label: 'Critical', color: '#FF2D2D' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.04em' }}>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Bottom center: "DRAG TO EXPLORE" hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 1, duration: 0.6 }}
              style={{
                position: 'absolute',
                bottom: selectedCountry ? 'calc(55vh + 16px)' : 32,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ovw-0p25)' }}>
                Drag to explore · Click markers
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Country count badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            position: 'absolute',
            top: 20,
            right: 16,
            zIndex: 20,
            background: 'rgba(10,132,255,0.12)',
            border: '1px solid rgba(10,132,255,0.3)',
            borderRadius: 12,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0A84FF', boxShadow: '0 0 8px #0A84FF' }} />
          <span style={{ fontSize: 11, color: '#0A84FF', fontWeight: 600, letterSpacing: '0.04em' }}>
            {COUNTRIES.length} Nations Monitored
          </span>
        </motion.div>

        {/* Country Panel */}
        <AnimatePresence>
          {selectedCountry && (
            <CountryPanel
              country={selectedCountry}
              brief={briefs[selectedCountry.code] || null}
              loading={!!briefLoading[selectedCountry.code]}
              articles={articles}
              onClose={handleClosePanel}
            />
          )}
        </AnimatePresence>

        {/* ── Live Intel Toggle ── */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          onClick={() => setShowLiveFeed((v) => !v)}
          style={{
            position: 'absolute',
            bottom: 24,
            left: showLiveFeed ? 356 : 16,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 14px',
            background: showLiveFeed ? 'rgba(255,45,45,0.18)' : 'rgba(0,0,0,0.7)',
            border: `1px solid ${showLiveFeed ? 'rgba(255,45,45,0.4)' : 'var(--ovw-0p1)'}`,
            borderRadius: 10,
            backdropFilter: 'blur(16px)',
            cursor: 'pointer',
            transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1), background 0.2s, border-color 0.2s',
          }}
        >
          <Radio size={13} style={{ color: showLiveFeed ? '#FF2D2D' : 'var(--ovw-0p6)' }} />
          <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: showLiveFeed ? '#FF2D2D' : 'var(--ovw-0p6)' }}>
            LIVE INTEL
          </span>
          {!showLiveFeed && (
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2D2D', animation: 'pulseDot 1.5s infinite', marginLeft: 2 }} />
          )}
        </motion.button>

        {/* ── Live Intel Panel ── */}
        <AnimatePresence>
          {showLiveFeed && (
            <motion.div
              initial={{ x: -380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -380, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 340,
                zIndex: 25,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--void-1)',
                backdropFilter: 'blur(28px)',
                borderRight: '1px solid var(--ovw-0p06)',
              }}
            >
              {/* Panel header */}
              <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--ovw-0p05)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2D2D', animation: 'pulseDot 1.5s infinite' }} />
                    <span style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: '0.16em', color: '#FF2D2D', textTransform: 'uppercase' }}>Live</span>
                  </div>
                  <button onClick={() => setShowLiveFeed(false)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--ovw-0p06)', border: '1px solid var(--ovw-0p08)', color: 'var(--ovw-0p4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={11} />
                  </button>
                </div>
                <p style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: 'var(--ovw-0p85)', letterSpacing: '0.02em' }}>
                  Live Threat Intel
                </p>
                <p style={{ fontFamily: 'Inter', fontSize: 10, color: 'var(--ovw-0p2)', marginTop: 2 }}>
                  {articles.length} articles from 5 sources
                </p>
              </div>

              {/* Category pills */}
              <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--ovw-0p04)', display: 'flex', gap: 5, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
                {['all', ...Array.from(new Set(articles.map((a) => a.source_name)))].map((cat) => (
                  <button key={cat} onClick={() => setLiveFilterCat(cat)}
                    style={{
                      padding: '3px 8px', borderRadius: 5,
                      border: `1px solid ${liveFilterCat === cat ? 'var(--ovw-0p15)' : 'var(--ovw-0p05)'}`,
                      background: liveFilterCat === cat ? 'var(--ovw-0p07)' : 'transparent',
                      color: liveFilterCat === cat ? 'var(--ovw-0p8)' : 'var(--ovw-0p25)',
                      fontFamily: 'Inter', fontSize: 8, letterSpacing: '0.07em', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {cat === 'all' ? 'ALL' : cat.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Articles */}
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--ovw-0p06) transparent' }}>
                {newsLoading
                  ? [...Array(8)].map((_, i) => (
                      <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--ovw-0p03)', opacity: Math.max(0.2, 1 - i * 0.1) }}>
                        <div style={{ height: 7, background: 'var(--ovw-0p05)', borderRadius: 3, width: '45%', marginBottom: 8 }} />
                        <div style={{ height: 11, background: 'var(--ovw-0p06)', borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 11, background: 'var(--ovw-0p04)', borderRadius: 3, width: '70%' }} />
                      </div>
                    ))
                  : (liveFilterCat === 'all' ? articles : articles.filter(a => a.source_name === liveFilterCat)).map((article, i) => {
                      const srcColor = SOURCE_COLORS[article.source_name] || 'var(--ovw-0p4)'
                      return (
                        <motion.a
                          key={article.article_url}
                          href={article.article_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025 }}
                          style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--ovw-0p03)', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ovw-0p03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: srcColor, flexShrink: 0, boxShadow: `0 0 4px ${srcColor}` }} />
                            <span style={{ fontFamily: 'Inter', fontSize: 8, letterSpacing: '0.08em', color: srcColor, flex: 1 }}>{article.source_name.toUpperCase()}</span>
                            <span style={{ fontFamily: 'Inter', fontSize: 8, color: 'var(--ovw-0p2)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={7} />{timeAgo(article.published_at)}
                            </span>
                          </div>
                          <p style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: 'var(--ovw-0p75)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {article.title}
                          </p>
                        </motion.a>
                      )
                    })}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--ovw-0p04)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Inter', fontSize: 8, color: 'var(--ovw-0p18)', letterSpacing: '0.06em' }}>
                  THN · BC · KREBS · DARK READING · CISA
                </span>
                <ExternalLink size={10} style={{ color: 'var(--ovw-0p15)' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <style>{`@keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </Layout>
  )
}
