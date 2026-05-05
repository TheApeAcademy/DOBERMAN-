import { useRef } from 'react'
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

// The hero blob — liquid chrome torus matching the reference aesthetic:
// large organic ring that cuts through the hero typography
function HeroBlob() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    // Slow, majestic rotation — like liquid mercury settling
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.08
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.14
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.05
    // Subtle breathing pulse
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    meshRef.current.scale.setScalar(breath)
  })

  return (
    // Torus = the organic ring shape from the reference images
    // args: [radius, tube, radialSeg, tubularSeg]
    <Torus ref={meshRef} args={[1.4, 0.65, 128, 200]} position={[2.2, 0.1, 0]}>
      <MeshDistortMaterial
        color="#c8c8c8"
        attach="material"
        distort={0.55}      // high distort = liquid organic morphing
        speed={2.2}
        roughness={0}
        metalness={1}
        envMapIntensity={6} // bright chrome reflections
      />
    </Torus>
  )
}

// Small satellite blobs — accent orbs floating at distance
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
        envMapIntensity={5}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      {/* Lighting rig — makes chrome look real */}
      <ambientLight intensity={0.2} />
      <pointLight position={[8, 8, 8]} intensity={4} color="#ffffff" />
      <pointLight position={[-8, -6, -4]} intensity={1.5} color="#aaccff" />
      <pointLight position={[0, -10, 6]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 4, 2]} intensity={0.8} color="#ffe0cc" />

      {/* Studio HDRI — the secret to real chrome reflections */}
      <Environment preset="studio" />

      {/* Hero liquid chrome torus — the main visual */}
      <HeroBlob />

      {/* Accent orbs — satellites at depth */}
      <SatelliteOrb position={[-3.2, 1.8, -3]} scale={0.45} speed={1.2} distort={0.65} />
      <SatelliteOrb position={[4.5, -2.5, -4]} scale={0.2} speed={0.8} distort={0.8} />
      <SatelliteOrb position={[-1.5, -2.8, -2]} scale={0.3} speed={1.5} distort={0.55} />

      {/* Post-processing — the cinematic layer */}
      <EffectComposer>
        {/* Bloom — chrome edges glow */}
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        {/* Chromatic aberration — real camera lens distortion */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006) as any}
        />
        {/* Film grain on 3D layer */}
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.12} />
      </EffectComposer>
    </>
  )
}

export function GlobalChrome3D() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
