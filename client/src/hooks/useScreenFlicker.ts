import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FLICKER_FREQUENCY = 0.8   // Hz — how fast screens breathe
const FLICKER_AMPLITUDE = 0.05  // fraction of base intensity to oscillate by

/**
 * Finds all MeshStandardMaterial instances whose name starts with "Screen_"
 * in the given scene and applies a gentle per-screen breathing/flicker each frame.
 */
export function useScreenFlicker(scene: THREE.Object3D) {
  const screens = useMemo(() => {
    const screenMaterials: THREE.MeshStandardMaterial[] = []
    scene.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (mat?.name?.startsWith('Screen_') && !screenMaterials.includes(mat)) {
        screenMaterials.push(mat)
      }
    })
    return screenMaterials.map(mat => ({ mat, baseIntensity: mat.emissiveIntensity || 1 }))
  }, [scene])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    screens.forEach(({ mat, baseIntensity }, index) => {
      mat.emissiveIntensity = baseIntensity * (1 + Math.sin(elapsed * FLICKER_FREQUENCY + index) * FLICKER_AMPLITUDE)
    })
  })
}
