interface CharacterMeshProps {
  soleColor?: string
  shirtColor?: string
  pantColor?: string
  skinColor?: string
  hairColor?: string
  badge?: boolean
  badgeColor?: string
  logoStrip?: boolean
}

/**
 * Reusable blocky character mesh.
 * All measurements are in local space — parent group sets position/rotation.
 */
export default function CharacterMesh({
  soleColor  = '#00eeff',
  shirtColor = '#1a1a2e',
  pantColor  = '#1a2a4a',
  skinColor  = '#d4906a',
  hairColor  = '#1a0a00',
  badge      = false,
  badgeColor = '#ff00aa',
  logoStrip  = true,
}: CharacterMeshProps) {
  return (
    <>
      {/* Sneakers */}
      <mesh position={[-0.13, 0.08, 0.04]}><boxGeometry args={[0.18, 0.1, 0.28]} /><meshStandardMaterial color="#222" roughness={0.8} /></mesh>
      <mesh position={[0.13, 0.08, 0.04]}><boxGeometry args={[0.18, 0.1, 0.28]} /><meshStandardMaterial color="#222" roughness={0.8} /></mesh>
      {/* Sole neon */}
      <mesh position={[-0.13, 0.03, 0.04]}><boxGeometry args={[0.17, 0.02, 0.27]} /><meshStandardMaterial color={soleColor} emissive={soleColor} emissiveIntensity={3} /></mesh>
      <mesh position={[0.13, 0.03, 0.04]}><boxGeometry args={[0.17, 0.02, 0.27]} /><meshStandardMaterial color={soleColor} emissive={soleColor} emissiveIntensity={3} /></mesh>
      {/* Pants / trousers */}
      <mesh position={[-0.13, 0.5, 0]}><boxGeometry args={[0.19, 0.75, 0.19]} /><meshStandardMaterial color={pantColor} roughness={0.9} /></mesh>
      <mesh position={[0.13, 0.5, 0]}><boxGeometry args={[0.19, 0.75, 0.19]} /><meshStandardMaterial color={pantColor} roughness={0.9} /></mesh>
      {/* Shirt / hoodie body */}
      <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.54, 0.72, 0.28]} /><meshStandardMaterial color={shirtColor} roughness={0.85} /></mesh>
      {/* Optional logo strip on chest */}
      {logoStrip && (
        <mesh position={[0, 1.05, 0.145]}>
          <boxGeometry args={[0.35, 0.08, 0.01]} />
          <meshStandardMaterial color={soleColor} emissive={soleColor} emissiveIntensity={2} />
        </mesh>
      )}
      {/* Optional name badge */}
      {badge && (
        <mesh position={[0.14, 1.08, 0.145]}>
          <boxGeometry args={[0.14, 0.07, 0.01]} />
          <meshStandardMaterial color={badgeColor} emissive={badgeColor} emissiveIntensity={1.5} />
        </mesh>
      )}
      {/* Arms */}
      <mesh position={[-0.36, 1.0, 0]}><boxGeometry args={[0.17, 0.62, 0.17]} /><meshStandardMaterial color={shirtColor} roughness={0.85} /></mesh>
      <mesh position={[0.36, 1.0, 0]}><boxGeometry args={[0.17, 0.62, 0.17]} /><meshStandardMaterial color={shirtColor} roughness={0.85} /></mesh>
      {/* Head */}
      <mesh position={[0, 1.55, 0]}><boxGeometry args={[0.3, 0.3, 0.28]} /><meshStandardMaterial color={skinColor} roughness={0.8} /></mesh>
      {/* Hair */}
      <mesh position={[0, 1.73, 0]}><boxGeometry args={[0.32, 0.08, 0.3]} /><meshStandardMaterial color={hairColor} roughness={0.9} /></mesh>
      {/* Cap brim */}
      <mesh position={[0, 1.75, 0.19]}><boxGeometry args={[0.28, 0.025, 0.1]} /><meshStandardMaterial color="#111" roughness={0.9} /></mesh>
    </>
  )
}
