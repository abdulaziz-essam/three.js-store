import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Text, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import { useStore } from '../../hooks/useStore'
import type { Game } from '../../data/games'
import type { Mesh, PointLight, MeshStandardMaterial, Group } from 'three'

interface CoverImageProps { url: string }
interface FallbackCoverProps { game: Game }
interface FloatingGameProps { game: Game }
interface GameDisplayProps { game: Game; position: [number, number, number] }

function CoverImage({ url }: CoverImageProps) {
  const texture = useTexture(url)
  return (
    <mesh castShadow>
      <boxGeometry args={[0.72, 1.0, 0.06]} />
      <meshStandardMaterial map={texture} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

function FallbackCover({ game }: FallbackCoverProps) {
  return (
    <mesh castShadow>
      <boxGeometry args={[0.72, 1.0, 0.06]} />
      <meshStandardMaterial color={game.color} emissive={game.accent} emissiveIntensity={1.5} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

function FloatingGame({ game }: FloatingGameProps) {
  const groupRef = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y += 0.006
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.08
  })
  return (
    <group ref={groupRef}>
      <Suspense fallback={<FallbackCover game={game} />}>
        <CoverImage url={game.cover} />
      </Suspense>
      {/* Spine */}
      <mesh position={[-0.38, 0, 0]}>
        <boxGeometry args={[0.06, 1.0, 0.06]} />
        <meshStandardMaterial color={game.accent} roughness={0.6} />
      </mesh>
      {/* Glow behind */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[0.9, 1.2]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={2} transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  )
}

function GlassDome() {
  return (
    <mesh position={[0, 0.4, 0]}>
      <sphereGeometry args={[0.85, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.2}
        roughness={0.03}
        chromaticAberration={0.05}
        samples={6}
        color="#88aaff"
        transparent
        opacity={0.15}
      />
    </mesh>
  )
}

export default function GameDisplay({ game, position }: GameDisplayProps) {
  const selectGame = useStore(s => s.selectGame)
  const nearbyGame = useStore(s => s.nearbyGame)
  const owned      = useStore(s => s.owned)
  const isNear  = nearbyGame?.id === game.id
  const isOwned = owned.has(game.id)
  const lightRef    = useRef<PointLight>(null)
  const baseRingRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (lightRef.current) lightRef.current.intensity = (isNear ? 5 : 2) + Math.sin(t * 2) * 0.5
    if (baseRingRef.current) {
      const mat = baseRingRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity = (isNear ? 4 : 1.5) + Math.sin(t * 3) * 0.5
    }
  })

  void isOwned

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.65, 0.7, 0.16, 20]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.6} metalness={0.5} />
      </mesh>
      {/* Glowing ring */}
      <mesh ref={baseRingRef} position={[0, 0.17, 0]}>
        <torusGeometry args={[0.62, 0.022, 8, 36]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={1.5} />
      </mesh>
      {/* Pedestal column */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.15, 12]} />
        <meshStandardMaterial color="#0d0d1a" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Display platform */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.55, 0.45, 0.1, 20]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Top glow ring */}
      <mesh position={[0, 1.42, 0]}>
        <torusGeometry args={[0.52, 0.018, 8, 32]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={2} />
      </mesh>

      {/* Glass dome */}
      <group position={[0, 1.38, 0]}>
        <GlassDome />
      </group>

      {/* Floating game cover */}
      <group position={[0, 2.0, 0]}>
        <FloatingGame game={game} />
      </group>

      {/* Sparkles */}
      <Sparkles count={14} scale={1.4} size={2} speed={0.2} color={game.color} position={[0, 1.9, 0]} opacity={0.6} />

      {/* Light */}
      <pointLight ref={lightRef} position={[0, 2.1, 0]} color={game.color} intensity={2} distance={5} decay={2} />

      {/* Price tag */}
      <group position={[0, 0.88, 0.17]}>
        <mesh>
          <planeGeometry args={[0.55, 0.2]} />
          <meshStandardMaterial color="#0a0a14" transparent opacity={0.92} />
        </mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.09} letterSpacing={0.05} anchorX="center" anchorY="middle">
          {`$${game.price}`}
          <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={2} />
        </Text>
      </group>

      {/* Game title under dome */}
      <Text position={[0, 1.08, 0.5]} fontSize={0.085} letterSpacing={0.04} anchorX="center" anchorY="middle" maxWidth={1.1} textAlign="center">
        {game.title}
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={isNear ? 3 : 1.5} />
      </Text>

      {/* Tag badge */}
      {game.tag && (
        <group position={[0.55, 2.55, 0]}>
          <mesh>
            <planeGeometry args={[0.38, 0.15]} />
            <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={1} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.08} letterSpacing={0.06} anchorX="center" anchorY="middle">
            {game.tag}
            <meshStandardMaterial color="#000" />
          </Text>
        </group>
      )}

      {/* Interact prompt */}
      {isNear && (
        <group position={[0, 3.2, 0]}>
          <mesh>
            <planeGeometry args={[1.6, 0.35]} />
            <meshStandardMaterial color="#0a0a14" transparent opacity={0.92} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[1.55, 0.3]} />
            <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={0.4} transparent opacity={0.18} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.1} letterSpacing={0.12} anchorX="center" anchorY="middle">
            [E] VIEW GAME
            <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={3} />
          </Text>
        </group>
      )}

      {/* Trigger select on click */}
      <mesh position={[0, 1.5, 0]} visible={false} onClick={() => selectGame(game)}>
        <sphereGeometry args={[1.0]} />
      </mesh>
    </group>
  )
}
