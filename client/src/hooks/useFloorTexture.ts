import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { BUILDING } from '../data/storeLayout'

const FLOOR_TILE_SCALE = 1.8  // world units per texture tile

/**
 * Loads and tiles the floor texture set (diffuse, normal, roughness).
 * Tiling is derived from building dimensions so the texture density stays consistent.
 */
export function useFloorTexture() {
  const textures = useTexture({
    map:          '/textures/floor/diff.jpg',
    normalMap:    '/textures/floor/nor.jpg',
    roughnessMap: '/textures/floor/rough.jpg',
  })

  useMemo(() => {
    const repeatX = BUILDING.width  / FLOOR_TILE_SCALE
    const repeatZ = BUILDING.depth  / FLOOR_TILE_SCALE
    Object.values(textures).forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(repeatX, repeatZ)
    })
  }, [textures])

  return textures
}
