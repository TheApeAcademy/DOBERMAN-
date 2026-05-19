import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DOTS = [
  { lat: 38.9, lon: -77.0, color: '#FF9500' },
  { lat: 55.75, lon: 37.62, color: '#FF2D2D' },
  { lat: 39.9, lon: 116.4, color: '#FF2D2D' },
  { lat: 51.5, lon: -0.12, color: '#FF9500' },
  { lat: 52.52, lon: 13.4, color: '#FF9500' },
  { lat: 39.0, lon: 125.75, color: '#FF2D2D' },
  { lat: 35.7, lon: 51.4, color: '#FF2D2D' },
  { lat: 50.45, lon: 30.52, color: '#FF2D2D' },
  { lat: 35.68, lon: 139.69, color: '#30D158' },
  { lat: 48.85, lon: 2.35, color: '#FF9500' },
  { lat: 41.9, lon: 12.5, color: '#30D158' },
  { lat: 40.42, lon: -3.7, color: '#30D158' },
  { lat: 37.57, lon: 126.98, color: '#FFD60A' },
  { lat: 25.2, lon: 55.27, color: '#FFD60A' },
  { lat: -23.55, lon: -46.63, color: '#FF9500' },
  { lat: 28.6, lon: 77.2, color: '#FF9500' },
  { lat: -33.87, lon: 151.21, color: '#30D158' },
  { lat: 1.35, lon: 103.82, color: '#30D158' },
  { lat: 59.33, lon: 18.07, color: '#30D158' },
  { lat: -26.2, lon: 28.04, color: '#FFD60A' },
  { lat: 30.06, lon: 31.25, color: '#FFD60A' },
  { lat: 43.65, lon: -79.38, color: '#30D158' },
  { lat: 19.43, lon: -99.13, color: '#FF9500' },
  { lat: 55.7, lon: 12.6, color: '#30D158' },
  { lat: -34.6, lon: -58.38, color: '#FF9500' },
]

function latLonToXYZ(lat: number, lon: number, r: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ]
}

function GlobeGrid() {
  const linesRef = useRef<THREE.LineSegments>(null)
  useEffect(() => {
    const R = 2.21
    const pts: number[] = []
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = (90 - lat) * (Math.PI / 180)
      for (let i = 0; i < 64; i++) {
        const t0 = (i / 64) * Math.PI * 2
        const t1 = ((i + 1) / 64) * Math.PI * 2
        pts.push(R * Math.sin(phi) * Math.cos(t0), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t0))
        pts.push(R * Math.sin(phi) * Math.cos(t1), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t1))
      }
    }
    for (let lon = 0; lon < 360; lon += 20) {
      const theta = lon * (Math.PI / 180)
      for (let i = 0; i < 64; i++) {
        const p0 = (i / 64) * Math.PI
        const p1 = ((i + 1) / 64) * Math.PI
        pts.push(R * Math.sin(p0) * Math.cos(theta), R * Math.cos(p0), R * Math.sin(p0) * Math.sin(theta))
        pts.push(R * Math.sin(p1) * Math.cos(theta), R * Math.cos(p1), R * Math.sin(p1) * Math.sin(theta))
      }
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    if (linesRef.current) linesRef.current.geometry = geom
  }, [])
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#0A84FF" transparent opacity={0.13} />
    </lineSegments>
  )
}

function Dot({ lat, lon, color }: { lat: number; lon: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const pos = useMemo(() => latLonToXYZ(lat, lon, 2.24), [lat, lon])
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2 + lat) * 0.22)
  })
  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.033, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.1} metalness={0.3} />
    </mesh>
  )
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  useEffect(() => { camera.position.set(0, 0, 6.5) }, [camera])
  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y += 0.0013 })
  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshBasicMaterial color="#0A84FF" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial color="#0a1628" roughness={0.7} metalness={0.25} />
      </mesh>
      <GlobeGrid />
      {DOTS.map((d, i) => <Dot key={i} lat={d.lat} lon={d.lon} color={d.color} />)}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -3, -5]} intensity={0.15} color="#0A84FF" />
      <pointLight position={[0, 0, 6]} intensity={0.4} color="#0A84FF" distance={12} />
    </group>
  )
}

export function GlobeEmbed({ height = 480 }: { height?: number }) {
  return (
    <div style={{ width: '100%', height, background: '#000508', overflow: 'hidden' }}>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
