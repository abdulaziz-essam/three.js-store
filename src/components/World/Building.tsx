import { useRef, useMemo, Suspense, Component } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { GAMES } from '../../data/games'
import type { Game } from '../../data/games'
import CharacterMesh from '../Character/CharacterMesh'
import type { PointLight } from 'three'

const BUILDING_WIDTH  = 18
const BUILDING_HEIGHT = 5
const BUILDING_DEPTH  = 26

const COL = {
  red:        '#cc0000',
  redBright:  '#ff2222',
  white:      '#ffffff',
  warmWhite:  '#fff5e0',
  blue:       '#0055cc',
  yellow:     '#ffcc00',
  wallDark:   '#12121a',
  wallMid:    '#1a1a26',
  floorDark:  '#0e0e14',
  ceiling:    '#0a0a12',
}

interface PosterDef {
  url: string
  fallbackColor: string
  label: string
  side: 'left' | 'right'
  z: number
  y: number
  w: number
  h: number
}

const POSTERS: PosterDef[] = [
  {
    url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1241440/library_600x900.jpg',
    fallbackColor: '#cc2200',
    label: 'SUPER MARIO ODYSSEY',
    side: 'left', z: -7, y: 2.5, w: 1.4, h: 2.0,
  },
  {
    url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r77.jpg',
    fallbackColor: '#1a3a7a',
    label: 'EPIC MICKEY',
    side: 'left', z: -1, y: 2.5, w: 1.4, h: 2.0,
  },
  {
    url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888160/library_600x900.jpg',
    fallbackColor: '#1a4a1a',
    label: 'THE LAST OF US',
    side: 'left', z: 5, y: 2.5, w: 1.4, h: 2.0,
  },
  {
    url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg',
    fallbackColor: '#1a2a4a',
    label: 'GOD OF WAR',
    side: 'right', z: -7, y: 2.5, w: 1.4, h: 2.0,
  },
  {
    url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/976730/library_600x900.jpg',
    fallbackColor: '#1a1a3a',
    label: 'HALO',
    side: 'right', z: -1, y: 2.5, w: 1.4, h: 2.0,
  },
  {
    url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg',
    fallbackColor: '#2a1a0a',
    label: 'THE WITCHER 3',
    side: 'right', z: 5, y: 2.5, w: 1.4, h: 2.0,
  },
]

interface StoreLightProps { position: [number, number, number]; length?: number }
function StoreLight({ position, length = 2.0 }: StoreLightProps) {
  const ref = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.intensity = 4 + Math.sin(clock.getElapsedTime() * 0.3 + position[0]) * 0.15
  })
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[length, 0.06, 0.12]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.035, 0]}>
        <boxGeometry args={[length - 0.04, 0.01, 0.1]} />
        <meshStandardMaterial color={COL.warmWhite} emissive={COL.warmWhite} emissiveIntensity={5} />
      </mesh>
      <pointLight ref={ref} color={COL.warmWhite} intensity={4} distance={7} castShadow shadow-mapSize={[256, 256]} />
    </group>
  )
}

interface FluorescentStripProps { position: [number, number, number]; length?: number }
function FluorescentStrip({ position, length = 3.0 }: FluorescentStripProps) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[length, 0.08, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[length - 0.1, 0.01, 0.14]} />
        <meshStandardMaterial color={COL.white} emissive={COL.white} emissiveIntensity={4} />
      </mesh>
      <pointLight color={COL.warmWhite} intensity={5} distance={9} />
    </group>
  )
}

interface WallStripeProps { start: [number, number, number]; end: [number, number, number]; color?: string }
function WallStripe({ start, end, color = COL.red }: WallStripeProps) {
  const mid = useMemo(() => new THREE.Vector3().addVectors(
    new THREE.Vector3(...start), new THREE.Vector3(...end)
  ).multiplyScalar(0.5), [start, end])
  const len = useMemo(() => new THREE.Vector3(...start).distanceTo(new THREE.Vector3(...end)), [start, end])
  const dir = useMemo(() => new THREE.Vector3(...end).sub(new THREE.Vector3(...start)).normalize(), [start, end])
  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    return q
  }, [dir])
  return (
    <group position={mid.toArray() as [number, number, number]} quaternion={quat.toArray() as [number, number, number, number]}>
      <mesh>
        <boxGeometry args={[0.06, len, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.4} />
      </mesh>
      <pointLight color={color} intensity={0.5} distance={4} />
    </group>
  )
}

interface StoreSignProps { position: [number, number, number]; text: string; color: string; bgColor?: string; size?: number }
function StoreSign({ position, text, color, bgColor = '#111', size = 0.45 }: StoreSignProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[text.length * size * 0.6 + 0.4, size * 2.0, 0.1]} />
        <meshStandardMaterial color={bgColor} roughness={0.9} />
      </mesh>
      <Text fontSize={size} letterSpacing={0.06} anchorX="center" anchorY="middle">
        {text}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Text>
      <pointLight color={color} intensity={1.5} distance={5} />
    </group>
  )
}

interface TextureErrorBoundaryProps {
  children: React.ReactNode
  fallbackColor: string
  w: number
  h: number
}
interface TextureErrorBoundaryState { failed: boolean }

class TextureErrorBoundary extends Component<TextureErrorBoundaryProps, TextureErrorBoundaryState> {
  constructor(props: TextureErrorBoundaryProps) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError(): TextureErrorBoundaryState { return { failed: true } }
  render() {
    if (this.state.failed) {
      return (
        <mesh>
          <boxGeometry args={[this.props.w, this.props.h, 0.01]} />
          <meshStandardMaterial color={this.props.fallbackColor} roughness={0.7} />
        </mesh>
      )
    }
    return this.props.children
  }
}

function PosterTexture({ url }: { url: string }) {
  const tex = useTexture(url)
  return <meshStandardMaterial map={tex} roughness={0.7} />
}

interface PosterSurfaceProps { url: string; fallbackColor: string; w: number; h: number }
function PosterSurface({ url, fallbackColor, w, h }: PosterSurfaceProps) {
  return (
    <TextureErrorBoundary fallbackColor={fallbackColor} w={w} h={h}>
      <mesh>
        <boxGeometry args={[w, h, 0.01]} />
        <Suspense fallback={<meshStandardMaterial color={fallbackColor} roughness={0.7} />}>
          <PosterTexture url={url} />
        </Suspense>
      </mesh>
    </TextureErrorBoundary>
  )
}

function GamePoster({ poster }: { poster: PosterDef }) {
  const { url, fallbackColor, side, z, y, w, h } = poster
  const wx = BUILDING_WIDTH / 2
  const px = side === 'left' ? -wx + 0.14 : wx - 0.14
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2

  return (
    <group position={[px, y, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.01]} />
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      <PosterSurface url={url} fallbackColor={fallbackColor} w={w} h={h} />
      <pointLight color={COL.warmWhite} intensity={1.2} distance={3} position={[0, h / 2 + 0.5, 0.3]} />
    </group>
  )
}

interface TVScreenProps { position: [number, number, number]; color: string }
function TVScreen({ position, color }: TVScreenProps) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.2 + Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.2
    }
  })
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.8, 1.05, 0.07]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.6} metalness={0.6} />
      </mesh>
      <mesh ref={ref} position={[0, 0, 0.038]}>
        <boxGeometry args={[1.68, 0.94, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      <pointLight color={color} intensity={1.2} distance={5} position={[0, 0, 0.3]} />
      <mesh position={[0, -0.62, -0.04]}>
        <boxGeometry args={[0.3, 0.12, 0.08]} />
        <meshStandardMaterial color="#222" roughness={0.7} metalness={0.5} />
      </mesh>
    </group>
  )
}

const COVER_SLOTS = [-0.65, 0, 0.65]
const SHELF_YS    = [0.13, 0.78, 1.43]
const COVER_W     = 0.38
const COVER_H     = 0.52
const COVER_D     = 0.05

function GameCoverMesh({ game }: { game: Game }) {
  const tex = useTexture(game.cover)
  return <meshStandardMaterial map={tex} roughness={0.6} metalness={0.05} />
}

function ShelfGameBox({ game, position }: { game: Game; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[COVER_W, COVER_H, COVER_D]} />
        <Suspense fallback={<meshStandardMaterial color={game.color} roughness={0.6} />}>
          <GameCoverMesh game={game} />
        </Suspense>
      </mesh>
    </group>
  )
}

interface ShelfUnitProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  games?: Game[]
}

function ShelfUnit({ position, rotation = [0, 0, 0], games = [] }: ShelfUnitProps) {
  const woodTex = useTexture({
    map: '/textures/wood/diff.jpg',
    normalMap: '/textures/wood/nor.jpg',
    roughnessMap: '/textures/wood/rough.jpg',
  })
  useMemo(() => {
    Object.values(woodTex).forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(3, 1)
    })
  }, [woodTex])

  const slots: { game: Game; x: number; y: number; z: number }[] = []
  SHELF_YS.forEach((shelfY, row) => {
    COVER_SLOTS.forEach((slotX, col) => {
      const game = games[row * COVER_SLOTS.length + col]
      if (game) slots.push({ game, x: slotX, y: shelfY + COVER_H / 2 + 0.02, z: -0.14 })
    })
  })

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.2, -0.38]} receiveShadow>
        <boxGeometry args={[2.0, 2.4, 0.06]} />
        <meshStandardMaterial {...woodTex} color="#2a1c0e" roughness={0.9} />
      </mesh>
      {[0.1, 0.75, 1.4, 2.05].map((y, i) => (
        <mesh key={i} position={[0, y, -0.18]} receiveShadow>
          <boxGeometry args={[2.0, 0.06, 0.42]} />
          <meshStandardMaterial {...woodTex} color="#3a2510" roughness={0.7} />
        </mesh>
      ))}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 1.1, -0.18]} receiveShadow>
          <boxGeometry args={[0.06, 2.2, 0.42]} />
          <meshStandardMaterial {...woodTex} color="#2a1c0e" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 2.1, -0.05]}>
        <boxGeometry args={[2.0, 0.06, 0.04]} />
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      {[0.72, 1.37, 2.02].map((y, i) => (
        <mesh key={i} position={[0, y, 0.04]}>
          <boxGeometry args={[1.9, 0.012, 0.012]} />
          <meshStandardMaterial color={COL.warmWhite} emissive={COL.warmWhite} emissiveIntensity={4} />
        </mesh>
      ))}
      {slots.map(({ game, x, y, z }, i) => (
        <ShelfGameBox key={game.id + i} game={game} position={[x, y, z]} />
      ))}
    </group>
  )
}

export default function Building() {
  const floorTex = useTexture({
    map: '/textures/floor/diff.jpg',
    normalMap: '/textures/floor/nor.jpg',
    roughnessMap: '/textures/floor/rough.jpg',
  })
  const wallTex = useTexture({
    map: '/textures/wall/diff.jpg',
    normalMap: '/textures/wall/nor.jpg',
    roughnessMap: '/textures/wall/rough.jpg',
  })

  useMemo(() => {
    Object.values(floorTex).forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 14) })
    Object.values(wallTex).forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 3) })
  }, [floorTex, wallTex])

  const hw = BUILDING_WIDTH  / 2
  const hd = BUILDING_DEPTH  / 2
  const hh = BUILDING_HEIGHT / 2

  void WallStripe

  return (
    <group>
      {/* ── FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[BUILDING_WIDTH, BUILDING_DEPTH]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={0.6}
          mixStrength={20}
          roughness={0.35}
          depthScale={1.0}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#18181e"
          metalness={0.3}
          map={floorTex.map}
          normalMap={floorTex.normalMap}
          roughnessMap={floorTex.roughnessMap}
        />
      </mesh>

      {/* ── CEILING ── */}
      <mesh position={[0, BUILDING_HEIGHT, 0]}>
        <boxGeometry args={[BUILDING_WIDTH, 0.18, BUILDING_DEPTH]} />
        <meshStandardMaterial color={COL.ceiling} roughness={0.95} />
      </mesh>

      {/* Ceiling drop tiles */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 7 }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[-6 + row * 3, BUILDING_HEIGHT - 0.06, -10.5 + col * 3.5]}>
            <boxGeometry args={[2.85, 0.06, 3.35]} />
            <meshStandardMaterial color="#0e0e16" roughness={0.95} />
          </mesh>
        ))
      )}

      {/* ── WALLS ── */}
      <mesh position={[0, hh, -hd]} receiveShadow>
        <boxGeometry args={[BUILDING_WIDTH, BUILDING_HEIGHT, 0.18]} />
        <meshStandardMaterial {...wallTex} color="#1c1c28" roughness={0.88} />
      </mesh>
      <mesh position={[0, hh, hd]} receiveShadow>
        <boxGeometry args={[BUILDING_WIDTH, BUILDING_HEIGHT, 0.18]} />
        <meshStandardMaterial {...wallTex} color="#1c1c28" roughness={0.88} />
      </mesh>
      <mesh position={[-hw, hh, 0]} receiveShadow>
        <boxGeometry args={[0.18, BUILDING_HEIGHT, BUILDING_DEPTH]} />
        <meshStandardMaterial {...wallTex} color="#1a1a24" roughness={0.88} />
      </mesh>
      <mesh position={[hw, hh, 0]} receiveShadow>
        <boxGeometry args={[0.18, BUILDING_HEIGHT, BUILDING_DEPTH]} />
        <meshStandardMaterial {...wallTex} color="#1a1a24" roughness={0.88} />
      </mesh>

      {/* ── FLUORESCENT CEILING STRIPS ── */}
      {([
        [-5, BUILDING_HEIGHT - 0.05, -12], [0, BUILDING_HEIGHT - 0.05, -12], [5, BUILDING_HEIGHT - 0.05, -12],
        [-5, BUILDING_HEIGHT - 0.05,  -8], [0, BUILDING_HEIGHT - 0.05,  -8], [5, BUILDING_HEIGHT - 0.05,  -8],
        [-5, BUILDING_HEIGHT - 0.05,  -2], [0, BUILDING_HEIGHT - 0.05,  -2], [5, BUILDING_HEIGHT - 0.05,  -2],
        [-5, BUILDING_HEIGHT - 0.05,   4], [0, BUILDING_HEIGHT - 0.05,   4], [5, BUILDING_HEIGHT - 0.05,   4],
      ] as [number, number, number][]).map((pos, i) => (
        <FluorescentStrip key={i} position={pos} length={3.0} />
      ))}

      {/* ── MAIN STORE SIGN ── */}
      <StoreSign position={[0, 4.35, -hd + 0.55]} text="PIXEL VAULT" color={COL.redBright} bgColor="#0a0a0a" size={0.55} />
      <StoreSign position={[0, 3.6,  -hd + 0.55]} text="VIDEO GAME STORE" color={COL.white}    bgColor="#cc0000"  size={0.22} />

      {/* ── TV SCREENS on back wall ── */}
      <TVScreen position={[-5.0, 3.2, -hd + 0.45]} color="#cc2200" />
      <TVScreen position={[ 0,   3.2, -hd + 0.45]} color="#0044cc" />
      <TVScreen position={[ 5.0, 3.2, -hd + 0.45]} color="#22aa00" />

      {/* ── SHELF UNITS ── */}
      <ShelfUnit position={[-7.5, 0, -8]} rotation={[0,  Math.PI / 2, 0]} games={GAMES.slice(0, 9)} />
      <ShelfUnit position={[-7.5, 0, -3]} rotation={[0,  Math.PI / 2, 0]} games={GAMES.slice(0, 9)} />
      <ShelfUnit position={[-7.5, 0,  3]} rotation={[0,  Math.PI / 2, 0]} games={GAMES.slice(0, 9)} />
      <ShelfUnit position={[ 7.5, 0, -8]} rotation={[0, -Math.PI / 2, 0]} games={GAMES.slice(0, 9)} />
      <ShelfUnit position={[ 7.5, 0, -3]} rotation={[0, -Math.PI / 2, 0]} games={GAMES.slice(0, 9)} />
      <ShelfUnit position={[ 7.5, 0,  3]} rotation={[0, -Math.PI / 2, 0]} games={GAMES.slice(0, 9)} />

      {/* Overhead store lights above shelves */}
      <StoreLight position={[-7.2, 2.6, -8]} length={2.2} />
      <StoreLight position={[-7.2, 2.6, -3]} length={2.2} />
      <StoreLight position={[-7.2, 2.6,  3]} length={2.2} />
      <StoreLight position={[ 7.2, 2.6, -8]} length={2.2} />
      <StoreLight position={[ 7.2, 2.6, -3]} length={2.2} />
      <StoreLight position={[ 7.2, 2.6,  3]} length={2.2} />

      {/* ── GAME POSTERS on side walls ── */}
      {POSTERS.map((p, i) => <GamePoster key={i} poster={p} />)}

      {/* ── CHECKOUT COUNTER ── */}
      <group position={[0, 0, -10]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 1.0, 1.2]} />
          <meshStandardMaterial color="#14141e" roughness={0.75} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[5.1, 0.05, 1.25]} />
          <meshStandardMaterial color="#22222e" roughness={0.25} metalness={0.55} />
        </mesh>
        <mesh position={[0, 0.55, 0.62]}>
          <boxGeometry args={[5.05, 0.06, 0.04]} />
          <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.45, -0.3]}>
          <boxGeometry args={[0.65, 0.44, 0.05]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.8} metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.45, -0.275]}>
          <boxGeometry args={[0.58, 0.38, 0.01]} />
          <meshStandardMaterial color="#001a33" emissive="#0055cc" emissiveIntensity={1.5} />
        </mesh>
        <pointLight position={[0, 1.6, -0.1]} color={COL.warmWhite} intensity={1.2} distance={4} />

        {/* ── CASHIER NPC ── */}
        <group position={[0, 0, -0.9]}>
          <CharacterMesh
            soleColor={COL.red}
            shirtColor="#cc0000"
            pantColor="#1a1a2a"
            skinColor="#c47a4a"
            hairColor="#1a0a00"
            badge
            badgeColor={COL.white}
            logoStrip={false}
          />
        </group>
      </group>

      {/* ── ENTRANCE ── */}
      <mesh position={[-1.5, 1.75, hd - 0.12]}>
        <boxGeometry args={[0.18, 3.5, 0.18]} />
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[1.5, 1.75, hd - 0.12]}>
        <boxGeometry args={[0.18, 3.5, 0.18]} />
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.59, hd - 0.12]}>
        <boxGeometry args={[3.18, 0.18, 0.18]} />
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.4} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 3.2, hd - 0.3]} color={COL.redBright} intensity={1.5} distance={5} />

      {/* Welcome mat */}
      <mesh position={[0, 0.01, hd - 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 1.4]} />
        <meshStandardMaterial color="#1a0000" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.02, hd - 1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} letterSpacing={0.12} anchorX="center" anchorY="middle">
        WELCOME
        <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={0.8} />
      </Text>

      {/* ── SALE SIGNS on side walls ── */}
      <StoreSign position={[-hw + 0.3, 1.5, -5]} text="NEW" color={COL.yellow} bgColor={COL.red} size={0.28} />
      <StoreSign position={[-hw + 0.3, 1.5,  2]} text="SALE" color={COL.white} bgColor={COL.red} size={0.28} />
      <StoreSign position={[ hw - 0.3, 1.5, -5]} text="HOT" color={COL.yellow} bgColor="#111" size={0.28} />
      <StoreSign position={[ hw - 0.3, 1.5,  2]} text="PRE-ORDER" color={COL.white} bgColor="#111" size={0.2} />
    </group>
  )
}
