import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, MeshTransmissionMaterial, Text } from '@react-three/drei'
import { useStore } from '../../hooks/useStore'

function GameCover({ game }) {
  const meshRef = useRef()
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.55
  })
  return (
    <group ref={meshRef}>
      {/* Game box */}
      <mesh castShadow>
        <boxGeometry args={[0.52, 0.72, 0.075]} />
        <meshStandardMaterial color={game.color} emissive={game.emissive} emissiveIntensity={2.5} metalness={0.25} roughness={0.45} />
      </mesh>
      {/* Spine */}
      <mesh position={[-0.295, 0, 0]}>
        <boxGeometry args={[0.075, 0.72, 0.075]} />
        <meshStandardMaterial color={game.emissive} roughness={0.6} emissive={game.emissive} emissiveIntensity={1} />
      </mesh>
      {/* Cover highlight */}
      <mesh position={[0.08, 0.12, 0.042]}>
        <boxGeometry args={[0.22, 0.32, 0.01]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.07} roughness={0} metalness={1} />
      </mesh>
      {/* Glow disc behind */}
      <mesh position={[0, 0, -0.15]}>
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={3} transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  )
}

function GlassDome() {
  return (
    <mesh position={[0, 0.32, 0]}>
      <sphereGeometry args={[0.72, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.25}
        roughness={0.04}
        chromaticAberration={0.04}
        samples={4}
        color="#aaccff"
        transparent
        opacity={0.18}
      />
    </mesh>
  )
}

export default function GamePedestal({ game, position }) {
  const { nearbyGame } = useStore()
  const isNear = nearbyGame?.id === game.id
  const lightRef = useRef()
  const ringRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (lightRef.current) {
      lightRef.current.intensity = (isNear ? 5 : 2.5) + Math.sin(t * 2.5) * 0.6
    }
    if (ringRef.current) {
      ringRef.current.material.emissiveIntensity = (isNear ? 4 : 1.8) + Math.sin(t * 3) * 0.8
    }
  })

  return (
    <group position={position}>
      {/* Base plinth */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.36, 1.1]} />
        <meshStandardMaterial color="#1a1208" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Plinth gold trim */}
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[1.15, 0.06, 1.15]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.4} />
      </mesh>
      {/* Column */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.21, 1.3, 12]} />
        <meshStandardMaterial color="#1e1608" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Gold rings on column */}
      <mesh position={[0, 0.52, 0]}>
        <torusGeometry args={[0.22, 0.028, 8, 24]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <torusGeometry args={[0.22, 0.028, 8, 24]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Display top */}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.48, 0.36, 0.12, 20]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.12} emissive="#7a5000" emissiveIntensity={0.3} />
      </mesh>
      {/* Glowing base ring */}
      <mesh ref={ringRef} position={[0, 1.69, 0]}>
        <torusGeometry args={[0.46, 0.022, 8, 36]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={isNear ? 4 : 1.8} />
      </mesh>

      {/* Glass dome */}
      <group position={[0, 1.65, 0]}>
        <GlassDome />
      </group>

      {/* Game cover floating */}
      <group position={[0, 2.25, 0]}>
        <GameCover game={game} />
      </group>

      {/* Sparkle particles inside dome */}
      <Sparkles
        count={18}
        scale={1.2}
        size={2.5}
        speed={0.25}
        color={game.color}
        position={[0, 2.1, 0]}
        opacity={0.7}
      />

      {/* Game light */}
      <pointLight ref={lightRef} position={[0, 2.3, 0]} color={game.color} intensity={2.5} distance={5} decay={2} />

      {/* Name label */}
      <Text
        position={[0, 1.1, 0.55]}
        fontSize={0.095}
        letterSpacing={0.08}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        {game.title.toUpperCase()}
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={isNear ? 4 : 2} />
      </Text>

      {/* Interaction prompt */}
      {isNear && (
        <group position={[0, 3.3, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 0.38]} />
            <meshStandardMaterial color="#050308" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.45, 0.33]} />
            <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={0.5} transparent opacity={0.15} />
          </mesh>
          <Text
            position={[0, 0, 0.025]}
            fontSize={0.1}
            letterSpacing={0.15}
            anchorX="center"
            anchorY="middle"
          >
            [E] INSPECT
            <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={3} />
          </Text>
        </group>
      )}
    </group>
  )
}
