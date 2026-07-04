import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const W = 18
const H = 5
const D = 26

function NeonTube({ start, end, color, radius = 0.025 }) {
  const ref = useRef()
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
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.emissiveIntensity = 2 + Math.sin(clock.getElapsedTime() * 2) * 0.3
  })
  return (
    <group position={mid.toArray()} quaternion={quat.toArray()}>
      <mesh ref={ref} castShadow>
        <cylinderGeometry args={[radius, radius, len, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.95} />
      </mesh>
      <pointLight color={color} intensity={0.8} distance={3} />
    </group>
  )
}

function NeonSign({ position, text, color, size = 0.45 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.material.emissiveIntensity = 3 + Math.sin(t * 1.5) * 0.8
    }
  })
  return (
    <group position={position}>
      {/* Backing panel */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[text.length * size * 0.62, size * 1.8, 0.08]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.9} />
      </mesh>
      <Text ref={ref} fontSize={size} letterSpacing={0.08} anchorX="center" anchorY="middle">
        {text}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </Text>
      <pointLight color={color} intensity={2} distance={6} />
    </group>
  )
}

function CeilingLight({ position, color = '#ffffff' }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.intensity = 3 + Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.3
  })
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.35, 0.02, 0.35]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
      <pointLight ref={ref} color={color} intensity={3} distance={8} castShadow shadow-mapSize={[256, 256]} />
    </group>
  )
}

function ShelfUnit({ position, rotation = [0, 0, 0] }) {
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

  return (
    <group position={position} rotation={rotation} castShadow>
      {/* Back panel */}
      <mesh position={[0, 1.2, -0.38]} receiveShadow>
        <boxGeometry args={[2.0, 2.4, 0.06]} />
        <meshStandardMaterial {...woodTex} color="#1a1008" roughness={0.9} />
      </mesh>
      {/* Shelves */}
      {[0.1, 0.75, 1.4, 2.05].map((y, i) => (
        <mesh key={i} position={[0, y, -0.18]} receiveShadow>
          <boxGeometry args={[2.0, 0.055, 0.42]} />
          <meshStandardMaterial {...woodTex} color="#221508" roughness={0.7} />
        </mesh>
      ))}
      {/* Side panels */}
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 1.1, -0.18]} receiveShadow>
          <boxGeometry args={[0.055, 2.2, 0.42]} />
          <meshStandardMaterial {...woodTex} color="#1a1008" roughness={0.85} />
        </mesh>
      ))}
      {/* LED strip under each shelf */}
      {[0.72, 1.37, 2.02].map((y, i) => (
        <mesh key={i} position={[0, y, 0.04]}>
          <boxGeometry args={[1.9, 0.015, 0.015]} />
          <meshStandardMaterial color="#ffffff" emissive="#aaddff" emissiveIntensity={3} />
        </mesh>
      ))}
    </group>
  )
}

function TVScreen({ position, color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.material.emissiveIntensity = 1.5 + Math.sin(t * 3 + position[0]) * 0.3
    }
  })
  return (
    <group position={position}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.95, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.8} metalness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh ref={ref} position={[0, 0, 0.035]}>
        <boxGeometry args={[1.5, 0.85, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      {/* Screen glow */}
      <pointLight color={color} intensity={1.5} distance={4} position={[0, 0, 0.2]} />
      {/* Stand */}
      <mesh position={[0, -0.56, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.06]} />
        <meshStandardMaterial color="#222" roughness={0.8} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.65, 0.05]}>
        <boxGeometry args={[0.4, 0.04, 0.18]} />
        <meshStandardMaterial color="#222" roughness={0.8} metalness={0.6} />
      </mesh>
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

  return (
    <group>
      {/* ── FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <MeshReflectorMaterial
          blur={[512, 128]}
          resolution={1024}
          mixBlur={0.8}
          mixStrength={40}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0d0d14"
          metalness={0.5}
          map={floorTex.map}
          normalMap={floorTex.normalMap}
          roughnessMap={floorTex.roughnessMap}
        />
      </mesh>

      {/* ── CEILING ── */}
      <mesh position={[0, H, 0]}>
        <boxGeometry args={[W, 0.15, D]} />
        <meshStandardMaterial color="#080810" roughness={0.95} />
      </mesh>

      {/* Ceiling grid panels */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 7 }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[-6 + row * 3, H - 0.05, -10.5 + col * 3.5]}>
            <boxGeometry args={[2.8, 0.08, 3.3]} />
            <meshStandardMaterial color="#06060c" roughness={0.95} />
          </mesh>
        ))
      )}

      {/* ── WALLS ── */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <boxGeometry args={[W, H, 0.15]} />
        <meshStandardMaterial {...wallTex} color="#10101a" roughness={0.9} />
      </mesh>
      <mesh position={[0, H / 2, D / 2]} receiveShadow>
        <boxGeometry args={[W, H, 0.15]} />
        <meshStandardMaterial {...wallTex} color="#10101a" roughness={0.9} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, H, D]} />
        <meshStandardMaterial {...wallTex} color="#10101a" roughness={0.9} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} receiveShadow>
        <boxGeometry args={[0.15, H, D]} />
        <meshStandardMaterial {...wallTex} color="#10101a" roughness={0.9} />
      </mesh>

      {/* ── NEON BORDER STRIPS on walls ── */}
      {/* Left wall top */}
      <NeonTube start={[-W / 2 + 0.16, 4.5, -D / 2 + 0.5]} end={[-W / 2 + 0.16, 4.5, D / 2 - 0.5]} color="#00eeff" />
      <NeonTube start={[-W / 2 + 0.16, 0.12, -D / 2 + 0.5]} end={[-W / 2 + 0.16, 0.12, D / 2 - 0.5]} color="#ff00aa" />
      {/* Right wall */}
      <NeonTube start={[W / 2 - 0.16, 4.5, -D / 2 + 0.5]} end={[W / 2 - 0.16, 4.5, D / 2 - 0.5]} color="#ff00aa" />
      <NeonTube start={[W / 2 - 0.16, 0.12, -D / 2 + 0.5]} end={[W / 2 - 0.16, 0.12, D / 2 - 0.5]} color="#00eeff" />
      {/* Back wall top */}
      <NeonTube start={[-W / 2 + 0.5, 4.5, -D / 2 + 0.16]} end={[W / 2 - 0.5, 4.5, -D / 2 + 0.16]} color="#aa00ff" />
      <NeonTube start={[-W / 2 + 0.5, 0.12, -D / 2 + 0.16]} end={[W / 2 - 0.5, 0.12, -D / 2 + 0.16]} color="#aa00ff" />

      {/* ── CEILING LIGHTS ── */}
      {[[-5, H - 0.04, -8], [0, H - 0.04, -8], [5, H - 0.04, -8],
        [-5, H - 0.04, -2], [0, H - 0.04, -2], [5, H - 0.04, -2],
        [-5, H - 0.04,  4], [0, H - 0.04,  4], [5, H - 0.04,  4],
      ].map(([x, y, z], i) => (
        <CeilingLight key={i} position={[x, y, z]} color={i % 3 === 0 ? '#e0e8ff' : i % 3 === 1 ? '#ffe8d0' : '#d0ffee'} />
      ))}

      {/* ── MAIN STORE SIGN ── */}
      <NeonSign position={[0, 4.3, -D / 2 + 0.5]} text="PIXEL VAULT" color="#00eeff" size={0.55} />
      <NeonSign position={[0, 3.55, -D / 2 + 0.5]} text="VIDEO GAME STORE" color="#ff00aa" size={0.22} />

      {/* ── TV SCREENS on back wall ── */}
      <TVScreen position={[-4.5, 3.0, -D / 2 + 0.4]} color="#ff0066" />
      <TVScreen position={[0,    3.0, -D / 2 + 0.4]} color="#00ccff" />
      <TVScreen position={[4.5,  3.0, -D / 2 + 0.4]} color="#aa00ff" />

      {/* ── SHELF UNITS along walls ── */}
      {/* Left wall shelves */}
      <ShelfUnit position={[-7.5, 0, -8]}  rotation={[0,  Math.PI / 2, 0]} />
      <ShelfUnit position={[-7.5, 0, -3]}  rotation={[0,  Math.PI / 2, 0]} />
      <ShelfUnit position={[-7.5, 0,  3]}  rotation={[0,  Math.PI / 2, 0]} />
      {/* Right wall shelves */}
      <ShelfUnit position={[7.5, 0, -8]}  rotation={[0, -Math.PI / 2, 0]} />
      <ShelfUnit position={[7.5, 0, -3]}  rotation={[0, -Math.PI / 2, 0]} />
      <ShelfUnit position={[7.5, 0,  3]}  rotation={[0, -Math.PI / 2, 0]} />

      {/* ── CHECKOUT COUNTER ── */}
      <group position={[0, 0, -10]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 1.0, 1.2]} />
          <meshStandardMaterial color="#0d0d1a" roughness={0.8} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[5.1, 0.05, 1.25]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Counter neon edge */}
        <NeonTube start={[-2.55, 1.06, -0.63]} end={[2.55, 1.06, -0.63]} color="#00eeff" radius={0.015} />
        <NeonTube start={[-2.55, 1.06,  0.63]} end={[2.55, 1.06,  0.63]} color="#00eeff" radius={0.015} />
        {/* Register screen */}
        <mesh position={[0, 1.45, -0.3]}>
          <boxGeometry args={[0.6, 0.4, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.45, -0.27]}>
          <boxGeometry args={[0.55, 0.35, 0.01]} />
          <meshStandardMaterial color="#003355" emissive="#00aaff" emissiveIntensity={2} />
        </mesh>
        <pointLight position={[0, 1.5, -0.1]} color="#00aaff" intensity={0.8} distance={3} />
      </group>

      {/* ── ENTRANCE ── */}
      {/* Door frame neon */}
      <NeonTube start={[-1.5, 0, D / 2 - 0.16]} end={[-1.5, 3.5, D / 2 - 0.16]} color="#00eeff" />
      <NeonTube start={[ 1.5, 0, D / 2 - 0.16]} end={[ 1.5, 3.5, D / 2 - 0.16]} color="#00eeff" />
      <NeonTube start={[-1.5, 3.5, D / 2 - 0.16]} end={[1.5, 3.5, D / 2 - 0.16]} color="#00eeff" />
      {/* Welcome mat */}
      <mesh position={[0, 0.01, D / 2 - 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 1.2]} />
        <meshStandardMaterial color="#1a0033" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.02, D / 2 - 1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.18} letterSpacing={0.1} anchorX="center" anchorY="middle">
        WELCOME
        <meshStandardMaterial color="#aa00ff" emissive="#aa00ff" emissiveIntensity={2} />
      </Text>

      {/* ── DECORATIVE NEON ART on side walls ── */}
      <NeonSign position={[-W / 2 + 0.3, 2.5, -5]} text="◈ NEW ARRIVALS" color="#ff00aa" size={0.2} />
      <NeonSign position={[-W / 2 + 0.3, 2.5,  2]} text="◈ BEST SELLERS" color="#ffcc00" size={0.2} />
      <NeonSign position={[W / 2 - 0.3, 2.5, -5]} text="DEALS ◈" color="#00ff88" size={0.2} />
      <NeonSign position={[W / 2 - 0.3, 2.5,  2]} text="PRE-ORDER ◈" color="#ff6600" size={0.2} />
    </group>
  )
}
