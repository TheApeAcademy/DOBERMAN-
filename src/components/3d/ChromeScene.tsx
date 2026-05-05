import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshDistortMaterial, Torus } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

function StarField({
  mouse,
  count,
}: {
  mouse: React.MutableRefObject<[number, number]>
  count: number
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const FOV_HALF_RAD = (21 * Math.PI) / 180

  // Circular glow sprite so particles render as round stars, not square quads
  const starTexture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 32; c.height = 32
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0,   'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(200,215,255,0.6)')
    g.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(c)
  }, [])

  // Place every star inside the camera frustum so all are visible
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const z = -(Math.random() * 48 + 2)
      const dist = 7 - z
      const spreadY = Math.tan(FOV_HALF_RAD) * dist
      const spreadX = spreadY * 1.78
      arr[i * 3]     = (Math.random() - 0.5) * 2 * spreadX
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2 * spreadY
      arr[i * 3 + 2] = z
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      mouse.current[1] * 0.05,
      0.03
    )
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      mouse.current[0] * 0.05,
      0.03
    )
    const mat = pointsRef.current.material as THREE.PointsMaterial
    mat.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 0.9) * 0.2
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        size={0.38}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.001}
      />
    </points>
  )
}

function HeroBlob({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  // On portrait mobile the camera frustum is narrow, so x=2.2 bleeds off-screen.
  // Centre the torus and push it back so it frames the scene without clipping.
  const pos: [number, number, number] = isMobile ? [0, 0.3, -1.5] : [2.2, 0.1, 0]
  const scale = isMobile ? 0.75 : 1

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.14
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.05
    const breath = scale * (1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02)
    meshRef.current.scale.setScalar(breath)
  })

  return (
    <Torus ref={meshRef} args={[1.4, 0.65, 128, 200]} position={pos}>
      <MeshDistortMaterial
        color="#c8c8c8"
        attach="material"
        distort={0.55}
        speed={2.2}
        roughness={0}
        metalness={1}
        envMapIntensity={6}
      />
    </Torus>
  )
}

function SatelliteOrb({
  position,
  scale,
  speed,
  distort,
}: {
  position: [number, number, number]
  scale: number
  speed: number
  distort: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15 * speed
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.22 * speed
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.025
    meshRef.current.scale.setScalar(scale * breath)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color="#a0a0a0"
        attach="material"
        distort={distort}
        speed={1.8}
        roughness={0}
        metalness={1}
        envMapIntensity={6}
      />
    </mesh>
  )
}

function Scene({
  mouse,
  starCount,
  isMobile,
}: {
  mouse: React.MutableRefObject<[number, number]>
  starCount: number
  isMobile: boolean
}) {
  return (
    <>
      <StarField mouse={mouse} count={starCount} />

      <ambientLight intensity={0.2} />
      <pointLight position={[8, 8, 8]} intensity={4} color="#ffffff" />
      <pointLight position={[-8, -6, -4]} intensity={1.5} color="#aaccff" />
      <pointLight position={[0, -10, 6]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 4, 2]} intensity={0.8} color="#ffe0cc" />

      <Environment preset="studio" />

      <HeroBlob isMobile={isMobile} />

      {/* Satellite orbs — desktop only, they bleed off-screen on portrait mobile */}
      {!isMobile && (
        <>
          <SatelliteOrb position={[-3.2, 1.8, -3]} scale={0.45} speed={1.2} distort={0.65} />
          <SatelliteOrb position={[4.5, -2.5, -4]} scale={0.2} speed={0.8} distort={0.8} />
          <SatelliteOrb position={[-1.5, -2.8, -2]} scale={0.3} speed={1.5} distort={0.55} />
        </>
      )}

      <EffectComposer>
        <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.85} mipmapBlur />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006) as any}
        />
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.10} />
      </EffectComposer>
    </>
  )
}

export function GlobalChrome3D() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const starCount = isMobile ? 700 : 2500
  const mouse = useRef<[number, number]>([0, 0])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ]
    }
    // Touch parallax for mobile
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      mouse.current = [
        (t.clientX / window.innerWidth - 0.5) * 2,
        -(t.clientY / window.innerHeight - 0.5) * 2,
      ]
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene mouse={mouse} starCount={starCount} isMobile={isMobile} />
      </Canvas>
    </div>
  )
}
