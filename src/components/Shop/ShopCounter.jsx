import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

function LanternFlame({ position }) {
  const lightRef = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (lightRef.current) lightRef.current.intensity = 1.5 + Math.sin(t * 11) * 0.5
  })
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff5500" emissiveIntensity={8} transparent opacity={0.9} />
      </mesh>
      <pointLight ref={lightRef} color="#ff6600" intensity={1.5} distance={4} decay={2} />
    </group>
  )
}

function Shopkeeper() {
  return (
    <group position={[0, 0, -10.8]}>
      {/* Legs */}
      <mesh position={[-0.12, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <meshStandardMaterial color="#1a1010" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <meshStandardMaterial color="#1a1010" roughness={0.8} />
      </mesh>
      {/* Body - deep burgundy coat */}
      <mesh position={[0, 0.88, 0]}>
        <boxGeometry args={[0.5, 0.68, 0.26]} />
        <meshStandardMaterial color="#3a0808" roughness={0.85} />
      </mesh>
      {/* Vest */}
      <mesh position={[0, 0.9, 0.14]}>
        <boxGeometry args={[0.26, 0.5, 0.04]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.7} roughness={0.3} emissive="#7a5000" emissiveIntensity={0.3} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.33, 0.84, 0]}>
        <boxGeometry args={[0.15, 0.58, 0.15]} />
        <meshStandardMaterial color="#3a0808" roughness={0.85} />
      </mesh>
      <mesh position={[0.33, 0.84, 0]}>
        <boxGeometry args={[0.15, 0.58, 0.15]} />
        <meshStandardMaterial color="#3a0808" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.3, 0.32, 0.28]} />
        <meshStandardMaterial color="#c8956a" roughness={0.8} />
      </mesh>
      {/* Monocle */}
      <mesh position={[0.1, 1.44, 0.15]}>
        <torusGeometry args={[0.06, 0.01, 6, 16]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Top hat brim */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.46, 0.04, 0.4]} />
        <meshStandardMaterial color="#0a0505" roughness={0.9} />
      </mesh>
      {/* Hat crown */}
      <mesh position={[0, 1.82, 0]}>
        <boxGeometry args={[0.29, 0.44, 0.27]} />
        <meshStandardMaterial color="#0a0505" roughness={0.9} />
      </mesh>
      {/* Hat gold band */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.3, 0.07, 0.28]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.85} roughness={0.15} emissive="#7a5000" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export default function ShopCounter() {
  return (
    <group>
      {/* Counter main body */}
      <mesh position={[0, 0.5, -10.5]}>
        <boxGeometry args={[7, 1.0, 1.2]} />
        <meshStandardMaterial color="#1a1008" roughness={0.82} metalness={0.05} />
      </mesh>
      {/* Counter top surface - dark with gold trim */}
      <mesh position={[0, 1.02, -10.5]}>
        <boxGeometry args={[7.1, 0.06, 1.3]} />
        <meshStandardMaterial color="#120e04" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Front gold trim */}
      <mesh position={[0, 1.04, -9.84]}>
        <boxGeometry args={[7.1, 0.06, 0.05]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.95} roughness={0.1} emissive="#7a5000" emissiveIntensity={0.5} />
      </mesh>
      {/* Front panel gold filigree - horizontal bars */}
      {[0.25, 0.5, 0.75].map((y, i) => (
        <mesh key={i} position={[0, y, -9.9]}>
          <boxGeometry args={[6.9, 0.04, 0.04]} />
          <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.12} emissive="#7a5000" emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* Vertical dividers */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -9.9]}>
          <boxGeometry args={[0.04, 1.0, 0.04]} />
          <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.12} emissive="#7a5000" emissiveIntensity={0.35} />
        </mesh>
      ))}

      {/* Shelves behind counter */}
      {[1.4, 2.5, 3.5].map((y, i) => (
        <mesh key={i} position={[0, y, -11.8]}>
          <boxGeometry args={[7, 0.07, 0.6]} />
          <meshStandardMaterial color="#1a1008" roughness={0.85} />
        </mesh>
      ))}
      {/* Shelf brackets */}
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <group key={i}>
          {[1.4, 2.5, 3.5].map((y, j) => (
            <mesh key={j} position={[x, y - 0.1, -11.55]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.05, 0.25, 0.04]} />
              <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Shelf decoration — small boxes (game cases) */}
      {[[-2.5, 1.5, -11.6], [-1.2, 1.5, -11.6], [0.2, 1.5, -11.6], [1.5, 1.5, -11.6], [2.8, 1.5, -11.6],
        [-2.5, 2.6, -11.6], [-1.2, 2.6, -11.6], [0.2, 2.6, -11.6], [1.5, 2.6, -11.6], [2.8, 2.6, -11.6],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.22, 0.3, 0.06]} />
          <meshStandardMaterial
            color={['#4488ff', '#ff4488', '#44ffaa', '#ffcc00', '#aa44ff'][i % 5]}
            emissive={['#1133aa', '#aa1144', '#004422', '#886600', '#440088'][i % 5]}
            emissiveIntensity={0.8}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* Lanterns on counter */}
      <group position={[-2.5, 1.08, -10.1]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.35, 8]} />
          <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} transparent opacity={0.4} />
        </mesh>
        <LanternFlame position={[0, 0.22, 0]} />
      </group>
      <group position={[2.5, 1.08, -10.1]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.35, 8]} />
          <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.15} transparent opacity={0.4} />
        </mesh>
        <LanternFlame position={[0, 0.22, 0]} />
      </group>

      {/* "WELCOME" sign above counter */}
      <Text
        position={[0, 4.6, -11.5]}
        fontSize={0.32}
        letterSpacing={0.25}
        anchorX="center"
        anchorY="middle"
      >
        WELCOME, TRAVELER
        <meshStandardMaterial color="#c8a84b" emissive="#c8a84b" emissiveIntensity={3} />
      </Text>

      <Shopkeeper />
    </group>
  )
}
