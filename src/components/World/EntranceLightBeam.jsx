import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function LightShaft({ position, rotation, color = '#ffcc44' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.material.opacity = 0.04 + Math.sin(t * 0.7 + position[0]) * 0.015
    }
  })
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <coneGeometry args={[1.2, 9, 6, 1, true]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={0.05}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function EntranceLightBeam() {
  return (
    <group position={[0, 0, 11]}>
      <LightShaft position={[0, 4.5, -1]} rotation={[0.35, 0, 0]} />
      <LightShaft position={[-0.8, 4.2, -1.5]} rotation={[0.38, 0.12, 0.08]} color="#ffaa22" />
      <LightShaft position={[0.8, 4.2, -1.5]} rotation={[0.38, -0.12, -0.08]} color="#ffaa22" />
      <LightShaft position={[0, 3.8, -0.5]} rotation={[0.28, 0, 0]} color="#ffdd88" />
      {/* Entrance warm glow on floor */}
      <pointLight position={[0, 0.5, -1]} color="#ffbb44" intensity={1.5} distance={5} decay={2} />
    </group>
  )
}
