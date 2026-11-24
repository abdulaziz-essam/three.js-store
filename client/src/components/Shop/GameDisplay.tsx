import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Text, Sparkles } from '@react-three/drei'
import { useStore } from '../../hooks/useStore'
import type { Game } from '../../data/games'
import type { Mesh, MeshStandardMaterial, Group } from 'three'

// Game cover box dimensions
const COVER_WIDTH   = 0.72
const COVER_HEIGHT  = 1.0
const COVER_DEPTH   = 0.06

// Floating animation
const FLOAT_ROTATION_SPEED = 0.006
const FLOAT_BOB_FREQUENCY  = 0.9
const FLOAT_BOB_AMPLITUDE  = 0.08

// Spine strip offset from cover center
const SPINE_X_OFFSET = -0.38

// Glow plane behind the cover
const GLOW_Z_OFFSET  = -0.1
const GLOW_WIDTH     = 0.9
const GLOW_HEIGHT    = 1.2

// Glass dome
const DOME_Y_OFFSET  = 0.02
const DOME_SCALE_Y   = 1.35
const DOME_RADIUS    = 0.85

// Base ring emissive intensities
const RING_GLOW_NEAR = 1.6
const RING_GLOW_BASE = 0.5
const RING_PULSE_FREQUENCY = 1.2
const RING_PULSE_AMPLITUDE = 0.1

interface CoverImageProps   { url: string }
interface FallbackCoverProps { game: Game }
interface FloatingGameProps  { game: Game }
interface GameDisplayProps   { game: Game; position: [number, number, number] }

function CoverImage({ url }: CoverImageProps) {
  const texture = useTexture(url)
  return (
    <mesh>
      <boxGeometry args={[COVER_WIDTH, COVER_HEIGHT, COVER_DEPTH]} />
      <meshStandardMaterial map={texture} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

function FallbackCover({ game }: FallbackCoverProps) {
  return (
    <mesh>
      <boxGeometry args={[COVER_WIDTH, COVER_HEIGHT, COVER_DEPTH]} />
      <meshStandardMaterial color={game.color} emissive={game.accent} emissiveIntensity={0.3} roughness={0.5} metalness={0.1} />
    </mesh>
  )
}

function FloatingGame({ game }: FloatingGameProps) {
  const groupRef = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const elapsed = clock.getElapsedTime()
    groupRef.current.rotation.y += FLOAT_ROTATION_SPEED
    groupRef.current.position.y = Math.sin(elapsed * FLOAT_BOB_FREQUENCY) * FLOAT_BOB_AMPLITUDE
  })
  return (
    <group ref={groupRef}>
      <Suspense fallback={<FallbackCover game={game} />}>
        <CoverImage url={game.cover} />
      </Suspense>
      {/* Spine */}
      <mesh position={[SPINE_X_OFFSET, 0, 0]}>
        <boxGeometry args={[COVER_DEPTH, COVER_HEIGHT, COVER_DEPTH]} />
        <meshStandardMaterial color={game.accent} roughness={0.6} />
      </mesh>
      {/* Glow plane behind cover */}
      <mesh position={[0, 0, GLOW_Z_OFFSET]}>
        <planeGeometry args={[GLOW_WIDTH, GLOW_HEIGHT]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={0.6} transparent opacity={0.06} depthWrite={false} />
      </mesh>
    </group>
  )
}

function GlassDome() {
  return (
    <mesh position={[0, DOME_Y_OFFSET, 0]} scale={[1, DOME_SCALE_Y, 1]}>
      <sphereGeometry args={[DOME_RADIUS, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      {/* Plain see-through glass — MeshTransmissionMaterial re-rendered the whole scene per dome every frame */}
      <meshPhysicalMaterial
        color="#eef1f2"
        roughness={0.05}
        metalness={0}
        clearcoat={1}
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function GameDisplay({ game, position }: GameDisplayProps) {
  const selectGame = useStore(s => s.selectGame)
  const nearbyGame = useStore(s => s.nearbyGame)
  const owned      = useStore(s => s.owned)
  const isNear     = nearbyGame?.id === game.id
  const isOwned    = owned.has(game.id)
  const baseRingRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    if (baseRingRef.current) {
      const mat = baseRingRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity =
        (isNear ? RING_GLOW_NEAR : RING_GLOW_BASE) +
        Math.sin(elapsed * RING_PULSE_FREQUENCY) * RING_PULSE_AMPLITUDE
    }
  })

  void isOwned

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.65, 0.7, 0.16, 20]} />
        <meshStandardMaterial color="#1f1d1b" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Glowing ring */}
      <mesh ref={baseRingRef} position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.022, 8, 36]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={RING_GLOW_BASE} />
      </mesh>
      {/* Pedestal column */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1.15, 12]} />
        <meshStandardMaterial color="#1f1d1b" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Display platform */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.55, 0.45, 0.1, 20]} />
        <meshStandardMaterial color="#2c2926" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Top glow ring */}
      <mesh position={[0, 1.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.018, 8, 32]} />
        <meshStandardMaterial color={game.color} emissive={game.color} emissiveIntensity={0.6} />
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
      <Sparkles count={6} scale={1.4} size={1.5} speed={0.15} color="#fff4e6" position={[0, 1.9, 0]} opacity={0.35} />

      {/* Info plate: title above price, on the front of the column */}
      <group position={[0, 0.85, 0.17]}>
        <mesh>
          <planeGeometry args={[0.62, 0.34]} />
          <meshStandardMaterial color="#0a0a14" transparent opacity={0.92} />
        </mesh>
        <Text position={[0, 0.07, 0.01]} fontSize={0.06} letterSpacing={0.04} anchorX="center" anchorY="middle" maxWidth={0.58} textAlign="center">
          {game.title.split(':')[0]}
          <meshStandardMaterial color="#f2ece2" emissive="#f2ece2" emissiveIntensity={isNear ? 0.9 : 0.4} />
        </Text>
        <Text position={[0, -0.07, 0.01]} fontSize={0.09} letterSpacing={0.05} anchorX="center" anchorY="middle">
          {`$${game.price}`}
          <meshStandardMaterial color="#f2d29b" emissive="#f2d29b" emissiveIntensity={0.6} />
        </Text>
      </group>

      {/* Tag badge */}
      {game.tag && (
        <group position={[0.55, 2.55, 0]}>
          <mesh>
            <planeGeometry args={[0.38, 0.15]} />
            <meshStandardMaterial color="#d9a066" emissive="#d9a066" emissiveIntensity={0.3} />
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
            <meshStandardMaterial color="#d9a066" emissive="#d9a066" emissiveIntensity={0.2} transparent opacity={0.12} />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.1} letterSpacing={0.12} anchorX="center" anchorY="middle">
            [E] VIEW GAME
            <meshStandardMaterial color="#f2ece2" emissive="#f2ece2" emissiveIntensity={1} />
          </Text>
        </group>
      )}

      {/* Invisible click target */}
      <mesh position={[0, 1.5, 0]} visible={false} onClick={() => selectGame(game)}>
        <sphereGeometry args={[1.0]} />
      </mesh>
    </group>
  )
}
