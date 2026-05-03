import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface BlobMeshProps {
  speed?: number
  distort?: number
}

function BlobMesh({ speed = 1, distort = 0.4 }: BlobMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12 * speed
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18 * speed
    meshRef.current.scale.setScalar(
      1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    )
  })

  return (
    <Sphere ref={meshRef} args={[1, 128, 128]}>
      <MeshDistortMaterial
        color="#909090"
        attach="material"
        distort={distort}
        speed={2.5}
        roughness={0}
        metalness={1}
        envMapIntensity={3}
      />
    </Sphere>
  )
}

interface ChromeBlobProps {
  size?: number
  speed?: number
  distort?: number
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export function ChromeBlob({
  size = 400,
  speed = 1,
  distort = 0.4,
  className = '',
  style = {},
  onClick,
}: ChromeBlobProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        position: 'absolute',
        pointerEvents: onClick ? 'auto' : 'none',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#aaaaff" />
        <pointLight position={[0, -10, 5]} intensity={0.5} color="#ffffff" />
        <Environment preset="studio" />
        <BlobMesh speed={speed} distort={distort} />
      </Canvas>
    </div>
  )
}
