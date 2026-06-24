import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

const W = 14
const H = 5.5
const D = 24

// Shared materials
function useMaterials() {
  return useMemo(() => ({
    gold: { color: '#c8a84b', metalness: 0.95, roughness: 0.1, emissive: '#7a5000', emissiveIntensity: 0.4 },
    marble: { color: '#d8d0c0', roughness: 0.3, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.2 },
    darkWood: { color: '#1a1008', roughness: 0.85, metalness: 0.05 },
    wall: { color: '#1e1608', roughness: 0.88 },
    ceiling: { color: '#0d0a06', roughness: 0.95 },
  }), [])
}

function Column({ position }) {
  const mat = useMaterials()
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.65, 0.44, 0.65]} />
        <meshPhysicalMaterial {...mat.marble} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.19, 0.24, 3.8, 14]} />
        <meshPhysicalMaterial {...mat.marble} />
      </mesh>
      {/* Fluting lines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.195, 2.1, Math.sin(a) * 0.195]}>
            <cylinderGeometry args={[0.018, 0.018, 3.6, 4]} />
            <meshStandardMaterial color="#c8c0b0" roughness={0.5} />
          </mesh>
        )
      })}
      <mesh position={[0, 4.1, 0]}>
        <boxGeometry args={[0.6, 0.32, 0.6]} />
        <meshStandardMaterial {...mat.gold} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <torusGeometry args={[0.24, 0.032, 8, 28]} />
        <meshStandardMaterial {...mat.gold} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <torusGeometry args={[0.24, 0.032, 8, 28]} />
        <meshStandardMaterial {...mat.gold} />
      </mesh>
    </group>
  )
}

function Torch({ position }) {
  const lightRef = useRef()
  const flameRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (lightRef.current) {
      lightRef.current.intensity = 3.0 + Math.sin(t * 9 + position[0]) * 0.9 + Math.sin(t * 17 + position[2]) * 0.4
    }
    if (flameRef.current) {
      flameRef.current.scale.x = 1 + Math.sin(t * 12) * 0.08
      flameRef.current.scale.z = 1 + Math.sin(t * 15 + 1) * 0.08
    }
  })
  return (
    <group position={position}>
      {/* Bracket */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, -Math.PI / 5]}>
        <cylinderGeometry args={[0.025, 0.025, 0.42, 6]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Bowl */}
      <mesh position={[0.24, 0.12, 0]}>
        <cylinderGeometry args={[0.11, 0.075, 0.13, 10]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Flame outer */}
      <mesh ref={flameRef} position={[0.24, 0.28, 0]}>
        <coneGeometry args={[0.075, 0.28, 7]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={8} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      {/* Flame inner */}
      <mesh position={[0.24, 0.32, 0]}>
        <coneGeometry args={[0.04, 0.2, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffdd00" emissiveIntensity={12} transparent opacity={0.8} depthWrite={false} />
      </mesh>
      {/* Embers */}
      <pointLight ref={lightRef} position={[0.24, 0.32, 0]} color="#ff6600" intensity={3.0} distance={7} decay={2} />
    </group>
  )
}

function ArcWindow({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[1.7, 2.9, 0.1]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.3} />
      </mesh>
      {/* Glass bottom */}
      <mesh position={[0, -0.2, 0.06]}>
        <boxGeometry args={[1.38, 2.1, 0.03]} />
        <meshPhysicalMaterial color="#1a3a6a" emissive="#0a1a40" emissiveIntensity={1.2} transparent opacity={0.65} roughness={0} metalness={0.1} />
      </mesh>
      {/* Glass arch */}
      <mesh position={[0, 1.1, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.69, 0.69, 0.03, 18, 1, false, 0, Math.PI]} />
        <meshPhysicalMaterial color="#2244aa" emissive="#1133aa" emissiveIntensity={1.8} transparent opacity={0.7} roughness={0} />
      </mesh>
      {/* Mullion */}
      <mesh position={[0, 0.1, 0.09]}>
        <boxGeometry args={[0.055, 2.3, 0.04]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 0.09]}>
        <boxGeometry args={[1.38, 0.055, 0.04]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Window glow */}
      <rectAreaLight position={[0, 0, 0.5]} width={1.4} height={2.8} color="#3355ff" intensity={2.5} rotation={[0, Math.PI, 0]} />
      <pointLight position={[0, 0, 0.6]} color="#4466ff" intensity={0.8} distance={6} />
    </group>
  )
}

function SwayingBanner({ position, color }) {
  const { rotZ } = useSpring({
    from: { rotZ: -0.035 },
    to: { rotZ: 0.035 },
    config: { duration: 2200 },
    loop: { reverse: true },
  })
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.022, 0.022, 0.75, 6]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.2} />
      </mesh>
      <animated.mesh position-y={-0.7} rotation-z={rotZ}>
        <planeGeometry args={[0.65, 1.45]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </animated.mesh>
      {/* Banner gold fringe */}
      <animated.mesh position-y={-1.43} rotation-z={rotZ}>
        <boxGeometry args={[0.65, 0.06, 0.02]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.8} roughness={0.2} />
      </animated.mesh>
    </group>
  )
}

function GoldTrim({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.3} />
    </mesh>
  )
}

function FloorRuneCircle({ position, color = '#c8a84b', speed = 1 }) {
  const outerRef = useRef()
  const innerRef = useRef()
  const spokeGroupRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pulse = 0.6 + Math.sin(t * speed * 1.5) * 0.4
    if (outerRef.current) outerRef.current.material.emissiveIntensity = pulse * 2
    if (innerRef.current) innerRef.current.material.emissiveIntensity = pulse * 3
    if (spokeGroupRef.current) spokeGroupRef.current.rotation.y += 0.003 * speed
  })
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={outerRef}>
        <torusGeometry args={[0.85, 0.018, 8, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.62, 0.012, 8, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <mesh ref={innerRef}>
        <circleGeometry args={[0.22, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      <group ref={spokeGroupRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.53, Math.sin(a) * 0.53, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.014, 0.5, 0.008]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
            </mesh>
          )
        })}
      </group>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0]}>
            <circleGeometry args={[0.04, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
        )
      })}
    </group>
  )
}

function Chandelier({ position, scale = 1 }) {
  const chainRef = useRef()
  return (
    <group position={position}>
      {/* Drop chain */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.6, 6]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Outer ring */}
      <mesh position={[0, -0.45, 0]}>
        <torusGeometry args={[0.9 * scale, 0.05, 10, 36]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.4} />
      </mesh>
      {/* Inner ring */}
      <mesh position={[0, -0.45, 0]}>
        <torusGeometry args={[0.45 * scale, 0.035, 8, 24]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.12} emissive="#7a5000" emissiveIntensity={0.4} />
      </mesh>
      {/* Candles outer ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a) * 0.9 * scale, -0.45, Math.sin(a) * 0.9 * scale]}>
            <mesh position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.18, 6]} />
              <meshStandardMaterial color="#f0e8c8" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.02, 0]}>
              <coneGeometry args={[0.04, 0.12, 6]} />
              <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={10} transparent opacity={0.95} />
            </mesh>
            <pointLight position={[0, 0.0, 0]} color="#ffcc44" intensity={0.55} distance={5} decay={2} />
          </group>
        )
      })}
      {/* Candles inner ring */}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a) * 0.45 * scale, -0.45, Math.sin(a) * 0.45 * scale]}>
            <mesh position={[0, -0.08, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.14, 6]} />
              <meshStandardMaterial color="#f0e8c8" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.01, 0]}>
              <coneGeometry args={[0.035, 0.1, 6]} />
              <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={10} transparent opacity={0.95} />
            </mesh>
            <pointLight position={[0, 0, 0]} color="#ffcc44" intensity={0.4} distance={4} decay={2} />
          </group>
        )
      })}
      {/* Central downlight */}
      <pointLight position={[0, -0.6, 0]} color="#ffcc44" intensity={1.8 * scale} distance={10} decay={2} />
    </group>
  )
}

export default function Building() {
  const mat = useMaterials()

  return (
    <group>
      {/* ── REFLECTIVE FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={50}
          roughness={0.12}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#080606"
          metalness={0.6}
        />
      </mesh>
      {/* Gold floor inlay grid */}
      {[-4.5, 0, 4.5].map((x, i) => (
        <mesh key={`fl${i}`} position={[x, 0.025, 0]}>
          <boxGeometry args={[0.04, 0.02, D]} />
          <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {[-10, -7, -4, -1, 2, 5, 8].map((z, i) => (
        <mesh key={`fz${i}`} position={[0, 0.025, z]}>
          <boxGeometry args={[W, 0.02, 0.04]} />
          <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* ── FLOOR RUNE CIRCLES ── */}
      <FloorRuneCircle position={[-4.0, 0.03, -9]} color="#4488ff" speed={0.8} />
      <FloorRuneCircle position={[-4.0, 0.03, -4]} color="#aa44ff" speed={1.1} />
      <FloorRuneCircle position={[-4.0, 0.03,  1]} color="#ffaa00" speed={0.9} />
      <FloorRuneCircle position={[ 4.0, 0.03, -9]} color="#ff4488" speed={1.0} />
      <FloorRuneCircle position={[ 4.0, 0.03, -4]} color="#44ffaa" speed={0.85} />
      <FloorRuneCircle position={[ 4.0, 0.03,  1]} color="#ffcc00" speed={1.2} />

      {/* ── CEILING ── */}
      <mesh position={[0, H, 0]}>
        <boxGeometry args={[W, 0.2, D]} />
        <meshStandardMaterial {...mat.ceiling} />
      </mesh>
      {/* Coffered ceiling panels */}
      {Array.from({ length: 3 }).map((_, col) =>
        Array.from({ length: 7 }).map((_, row) => (
          <mesh key={`cp${col}-${row}`} position={[-3.5 + col * 3.5, H - 0.06, -10.5 + row * 3.5]}>
            <boxGeometry args={[3.0, 0.1, 3.0]} />
            <meshStandardMaterial color="#100c04" roughness={0.95} />
          </mesh>
        ))
      )}
      {/* Ceiling gold grid */}
      {[-5.25, -1.75, 1.75, 5.25].map((x, i) => (
        <GoldTrim key={`cgx${i}`} position={[x, H - 0.01, 0]} size={[0.1, 0.08, D]} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <GoldTrim key={`cgz${i}`} position={[0, H - 0.01, -12.25 + i * 3.5]} size={[W, 0.08, 0.1]} />
      ))}

      {/* ── WALLS ── */}
      <mesh position={[0, H / 2, -D / 2]}>
        <boxGeometry args={[W, H, 0.18]} />
        <meshStandardMaterial {...mat.wall} />
      </mesh>
      <mesh position={[0, H / 2, D / 2]}>
        <boxGeometry args={[W, H, 0.18]} />
        <meshStandardMaterial {...mat.wall} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]}>
        <boxGeometry args={[0.18, H, D]} />
        <meshStandardMaterial {...mat.wall} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]}>
        <boxGeometry args={[0.18, H, D]} />
        <meshStandardMaterial {...mat.wall} />
      </mesh>

      {/* Wall paneling — dark inset panels */}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <group key={`lwp${i}`}>
          <mesh position={[-6.7, 0.9, z]}>
            <boxGeometry args={[0.06, 1.4, 2.2]} />
            <meshStandardMaterial color="#120e06" roughness={0.9} />
          </mesh>
          <mesh position={[6.7, 0.9, z]}>
            <boxGeometry args={[0.06, 1.4, 2.2]} />
            <meshStandardMaterial color="#120e06" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Wall trim lines */}
      {[-W / 2 + 0.1, W / 2 - 0.1].map((x, i) => (
        <group key={`wt${i}`}>
          <GoldTrim position={[x, 1.25, 0]} size={[0.1, 0.07, D]} />
          <GoldTrim position={[x, H - 0.28, 0]} size={[0.1, 0.07, D]} />
          <GoldTrim position={[x, 2.85, 0]} size={[0.1, 0.05, D]} />
        </group>
      ))}
      <GoldTrim position={[0, 1.25, -D / 2 + 0.1]} size={[W, 0.07, 0.1]} />
      <GoldTrim position={[0, H - 0.28, -D / 2 + 0.1]} size={[W, 0.07, 0.1]} />

      {/* ── COLUMNS ── */}
      {[-8, -4, 0, 4, 8].map((z, i) => (
        <group key={`col${i}`}>
          <Column position={[-5.5, 0, z]} />
          <Column position={[5.5, 0, z]} />
        </group>
      ))}

      {/* ── ARC WINDOWS ── */}
      {[-8, -2, 4].map((z, i) => (
        <group key={`win${i}`}>
          <ArcWindow position={[-6.85, 3.1, z]} rotation={[0, Math.PI / 2, 0]} />
          <ArcWindow position={[6.85, 3.1, z]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
      ))}

      {/* ── TORCHES ── */}
      {[-9, -4.5, 0, 5].map((z, i) => (
        <group key={`tr${i}`}>
          <Torch position={[-5.3, 2.9, z]} />
          <Torch position={[5.3, 2.9, z]} />
        </group>
      ))}

      {/* ── CHANDELIERS ── */}
      <Chandelier position={[0, H - 0.22, 2]} scale={1.1} />
      <Chandelier position={[0, H - 0.22, -5]} scale={0.9} />
      <Chandelier position={[0, H - 0.22, -10]} scale={0.8} />

      {/* ── BANNERS ── */}
      <SwayingBanner position={[-5.1, 4.4, -7]} color="#8a0000" />
      <SwayingBanner position={[-5.1, 4.4, -1]} color="#00228a" />
      <SwayingBanner position={[-5.1, 4.4,  5]} color="#4a008a" />
      <SwayingBanner position={[5.1, 4.4, -7]} color="#00228a" />
      <SwayingBanner position={[5.1, 4.4, -1]} color="#8a0000" />
      <SwayingBanner position={[5.1, 4.4,  5]} color="#4a008a" />

      {/* ── ENTRANCE ARCH ── */}
      <mesh position={[0, 2.2, D / 2 - 0.09]}>
        <boxGeometry args={[3.8, 4.6, 0.22]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.92} roughness={0.12} emissive="#7a5000" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 4.55, D / 2 - 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.22, 20, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.92} roughness={0.12} emissive="#7a5000" emissiveIntensity={0.35} />
      </mesh>
      {/* Entrance opening */}
      <mesh position={[0, 2.1, D / 2 - 0.04]}>
        <boxGeometry args={[3.1, 4.3, 0.3]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* ── BACK WALL DECORATION ── */}
      {/* Large art deco panel */}
      <mesh position={[0, 2.8, -D / 2 + 0.22]}>
        <boxGeometry args={[9, 4.5, 0.12]} />
        <meshStandardMaterial color="#1a1208" roughness={0.88} />
      </mesh>
      {/* Outer gold frame */}
      <mesh position={[0, 2.8, -D / 2 + 0.32]}>
        <boxGeometry args={[8.6, 4.1, 0.06]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.92} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 2.8, -D / 2 + 0.38]}>
        <boxGeometry args={[8.0, 3.5, 0.06]} />
        <meshStandardMaterial color="#100c04" roughness={0.95} />
      </mesh>

      {/* NEON SIGN */}
      <Text
        position={[0, 4.2, -D / 2 + 0.55]}
        fontSize={0.52}
        letterSpacing={0.22}
        anchorX="center"
        anchorY="middle"
      >
        ARCANE EMPORIUM
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={5} />
      </Text>
      <Text
        position={[0, 3.55, -D / 2 + 0.55]}
        fontSize={0.2}
        letterSpacing={0.35}
        anchorX="center"
        anchorY="middle"
      >
        ✦ FINEST GAMES IN COLUMBIA ✦
        <meshStandardMaterial color="#c8a84b" emissive="#c8a84b" emissiveIntensity={3} />
      </Text>
      {/* Sign light */}
      <pointLight position={[0, 4.0, -D / 2 + 1.5]} color="#ffaa00" intensity={3} distance={8} />

      {/* Sunburst decoration */}
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2
        const r = 1.5
        return (
          <mesh key={`sb${i}`} position={[Math.cos(a) * r, 1.6 + Math.sin(a) * r, -D / 2 + 0.5]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.05, 0.9 + (i % 2) * 0.4, 0.04]} />
            <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.6} />
          </mesh>
        )
      })}
      <mesh position={[0, 1.6, -D / 2 + 0.55]}>
        <circleGeometry args={[0.38, 20]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} emissive="#c8a84b" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}
