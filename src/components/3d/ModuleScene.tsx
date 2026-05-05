import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, MeshDistortMaterial, TorusKnot } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ─── EYES: Glass transmission sphere ─── */
function EyesObject() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.elapsedTime * 0.18
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.12
  })
  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.1, 96, 96]} />
        <meshPhysicalMaterial
          transmission={1}
          roughness={0.03}
          thickness={1.8}
          metalness={0}
          ior={1.5}
          color="#ffffff"
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  )
}

/* ─── NOSE: Chrome torus knot (network topology) ─── */
function NoseObject() {
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.55}>
      <TorusKnot args={[0.72, 0.24, 220, 24]}>
        <MeshDistortMaterial
          color="#b8b8b8"
          metalness={1}
          roughness={0}
          distort={0.25}
          speed={2}
          envMapIntensity={5}
        />
      </TorusKnot>
    </Float>
  )
}

/* ─── BRAIN: Dual icosahedron solid + wireframe ─── */
function BrainObject() {
  const solid = useRef<THREE.Mesh>(null)
  const wire = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!solid.current || !wire.current) return
    solid.current.rotation.x = clock.elapsedTime * 0.11
    solid.current.rotation.y = clock.elapsedTime * 0.17
    wire.current.rotation.x = solid.current.rotation.x
    wire.current.rotation.y = solid.current.rotation.y
  })
  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={0.65}>
      <group>
        <mesh ref={solid}>
          <icosahedronGeometry args={[1, 2]} />
          <meshPhysicalMaterial color="#909090" metalness={1} roughness={0.02} envMapIntensity={4} />
        </mesh>
        <mesh ref={wire}>
          <icosahedronGeometry args={[1.07, 2]} />
          <meshBasicMaterial color="white" wireframe transparent opacity={0.12} />
        </mesh>
      </group>
    </Float>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 6, 5]} intensity={4} color="#ffffff" />
      <pointLight position={[-5, -4, 3]} intensity={2} color="#6688ff" />
      <Environment preset="studio" />
    </>
  )
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.85} mipmapBlur />
    </EffectComposer>
  )
}

const CANVAS = {
  camera: { position: [0, 0, 4] as [number, number, number], fov: 42 },
  gl: { antialias: true, alpha: true, powerPreference: 'high-performance' as const },
  dpr: [0.8, 1.5] as [number, number],
  style: { width: '100%', height: '100%', background: 'transparent' },
}

export function EyesScene() {
  return (
    <Canvas {...CANVAS}>
      <Suspense fallback={null}>
        <Lights />
        <EyesObject />
        <PostFX />
      </Suspense>
    </Canvas>
  )
}

export function NoseScene3D() {
  return (
    <Canvas {...CANVAS}>
      <Suspense fallback={null}>
        <Lights />
        <NoseObject />
        <PostFX />
      </Suspense>
    </Canvas>
  )
}

export function BrainScene3D() {
  return (
    <Canvas {...CANVAS}>
      <Suspense fallback={null}>
        <Lights />
        <BrainObject />
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
