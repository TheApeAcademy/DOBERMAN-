import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshDistortMaterial, Sphere } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

function ChromeOrb({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  speed = 1,
  distort = 0.4,
}: {
  position?: [number, number, number]
  scale?: number
  speed?: number
  distort?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12 * speed
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18 * speed
    const breath = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.015
    meshRef.current.scale.setScalar(scale * breath)
  })

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
      <MeshDistortMaterial
        color="#808080"
        attach="material"
        distort={distort}
        speed={2}
        roughness={0}
        metalness={1}
        envMapIntensity={4}
      />
    </Sphere>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#aaaaff" />
      <pointLight position={[0, -8, 6]} intensity={0.8} color="#ffffff" />
      <Environment preset="studio" />
      <ChromeOrb position={[2.5, 0, 0]} scale={1.8} speed={0.6} distort={0.35} />
      <ChromeOrb position={[-3, 1.5, -2]} scale={0.5} speed={1.4} distort={0.6} />
      <ChromeOrb position={[4, -2, -3]} scale={0.25} speed={0.9} distort={0.7} />
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005) as any}
        />
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.15} />
      </EffectComposer>
    </>
  )
}

export function GlobalChrome3D() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
