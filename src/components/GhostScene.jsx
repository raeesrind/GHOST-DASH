/**
 * Three.js hero scene — floating ghost particles + rotating torus.
 * Used on the Landing page.
 */
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Torus, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Particles({ count = 1200 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 12
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.04
      ref.current.rotation.y -= delta * 0.06
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent color="#8b0000" size={0.04}
        sizeAttenuation depthWrite={false} opacity={0.8}
      />
    </Points>
  )
}

function FloatingTorus() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.3
      ref.current.rotation.y = state.clock.elapsedTime * 0.5
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })
  return (
    <Torus ref={ref} args={[1.4, 0.35, 32, 100]}>
      <MeshDistortMaterial
        color="#540000" attach="material"
        distort={0.4} speed={2}
        roughness={0.1} metalness={0.8}
        emissive="#300000" emissiveIntensity={0.5}
      />
    </Torus>
  )
}

function FloatingSphere({ position, scale = 1 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.4
      ref.current.rotation.x += 0.005
    }
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <MeshDistortMaterial
        color="#8b0000" distort={0.5} speed={3}
        roughness={0} metalness={1}
        emissive="#540000" emissiveIntensity={0.8}
      />
    </mesh>
  )
}

export default function GhostScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]}   color="#ff1a1a" intensity={2} />
      <pointLight position={[-5, -5, -5]} color="#540000" intensity={1} />
      <Particles />
      <FloatingTorus />
      <FloatingSphere position={[-3, 1, -1]} scale={0.8} />
      <FloatingSphere position={[3, -1, -2]} scale={0.6} />
      <FloatingSphere position={[2, 2, -1]}  scale={0.4} />
    </Canvas>
  )
}
