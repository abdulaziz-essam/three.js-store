interface CharacterMeshProps {
  soleColor?: string
  shirtColor?: string
  pantColor?: string
  skinColor?: string
  hairColor?: string
  badge?: boolean
  badgeColor?: string
  logoStrip?: boolean
  /** Seated pose: thighs forward, shins down (hip at y=0.875, knee at y=0.5) */
  sitting?: boolean
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
  sitting    = false,
}: CharacterMeshProps) {
  const hipRot  = sitting ? -Math.PI / 2 : 0
  const kneeRot = sitting ?  Math.PI / 2 : 0
  return (
    <>
      {/* Legs: hip pivot at y=0.875, knee pivot 0.375 below it (same layout as before when standing) */}
      {[-0.13, 0.13].map(x => (
        <group key={x} position={[x, 0.875, 0]} rotation={[hipRot, 0, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.1875, 0]}><boxGeometry args={[0.19, 0.375, 0.19]} /><meshStandardMaterial color={pantColor} roughness={0.9} /></mesh>
          <group position={[0, -0.375, 0]} rotation={[kneeRot, 0, 0]}>
            {/* Shin */}
            <mesh position={[0, -0.1875, 0]}><boxGeometry args={[0.19, 0.375, 0.19]} /><meshStandardMaterial color={pantColor} roughness={0.9} /></mesh>
            {/* Sneaker + neon sole */}
            <mesh position={[0, -0.42, 0.04]}><boxGeometry args={[0.18, 0.1, 0.28]} /><meshStandardMaterial color="#222" roughness={0.8} /></mesh>
            <mesh position={[0, -0.47, 0.04]}><boxGeometry args={[0.17, 0.02, 0.27]} /><meshStandardMaterial color={soleColor} emissive={soleColor} emissiveIntensity={3} /></mesh>
          </group>
        </group>
      ))}
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
