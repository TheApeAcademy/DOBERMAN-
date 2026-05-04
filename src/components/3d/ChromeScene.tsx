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

function StarField({ mouse, count }: { mouse: React.MutableRefObject<[number, number]>; count: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 80
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      mouse.current[1] * 0.06,
      0.04
    )
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      mouse.current[0] * 0.06,
      0.04
    )
    const mat = pointsRef.current.material as THREE.PointsMaterial
    mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 1.1) * 0.18
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#e8e8ff"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function HeroBlob() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.14
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.05
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    meshRef.current.scale.setScalar(breath)
  })

  return (
    <Torus ref={meshRef} args={[1.4, 0.65, 128, 200]} position={[2.2, 0.1, 0]}>
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
        envMapIntensity={8}
      />
    </mesh>
  )
}

function Scene({ mouse, starCount }: { mouse: React.MutableRefObject<[number, number]>; starCount: number }) {
  return (
    <>
      <StarField mouse={mouse} count={starCount} />

      <ambientLight intensity={0.2} />
      <pointLight position={[8, 8, 8]} intensity={4} color="#ffffff" />
      <pointLight position={[-8, -6, -4]} intensity={1.5} color="#aaccff" />
      <pointLight position={[0, -10, 6]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 4, 2]} intensity={0.8} color="#ffe0cc" />

      <Environment preset="studio" />

      <HeroBlob />

      <SatelliteOrb position={[-3.2, 1.8, -3]} scale={0.45} speed={1.2} distort={0.65} />
      <SatelliteOrb position={[4.5, -2.5, -4]} scale={0.2} speed={0.8} distort={0.8} />
      <SatelliteOrb position={[-1.5, -2.8, -2]} scale={0.3} speed={1.5} distort={0.55} />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006) as any}
        />
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.12} />
      </EffectComposer>
    </>
  )
}

export function GlobalChrome3D() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const starCount = isMobile ? 800 : 2500
  const mouse = useRef<[number, number]>([0, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ]
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene mouse={mouse} starCount={starCount} />
      </Canvas>
    </div>
  )
}
