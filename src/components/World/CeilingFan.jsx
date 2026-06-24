import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function CeilingFan({ position, speed = 0.12 }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })

  return (
    <group ref={ref} position={position}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[1.3, 0.055, 10, 48]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#664400" emissiveIntensity={0.5} />
      </mesh>
      {/* Inner ring */}
      <mesh>
        <torusGeometry args={[0.65, 0.04, 10, 32]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} emissive="#664400" emissiveIntensity={0.4} />
      </mesh>
      {/* 8 spokes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.975, 0, Math.sin(a) * 0.975]} rotation={[0, a, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 1.3, 6]} />
            <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} />
          </mesh>
        )
      })}
      {/* Gear teeth on outer ring */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2
        return (
          <mesh key={`t${i}`} position={[Math.cos(a) * 1.36, 0, Math.sin(a) * 1.36]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.06, 0.04, 0.08]} />
            <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} />
          </mesh>
        )
      })}
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, 0.12, 16]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} emissive="#ffaa00" emissiveIntensity={1.2} />
      </mesh>
      {/* Hub glow */}
      <pointLight position={[0, -0.1, 0]} color="#ffcc44" intensity={0.6} distance={3} />
    </group>
  )
}
