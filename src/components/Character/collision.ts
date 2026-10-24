import * as THREE from 'three'

// Player capsule radius used for all collision checks
const PLAYER_RADIUS = 0.35

interface AABB {
  cx: number
  cz: number
  hw: number // half-width  (X axis)
  hd: number // half-depth  (Z axis)
}

const COLLIDERS: AABB[] = [
  // Walls
  { cx: -9,   cz:  0,  hw: 0.1, hd: 13  },  // left
  { cx:  9,   cz:  0,  hw: 0.1, hd: 13  },  // right
  { cx:  0,   cz: -13, hw: 9,   hd: 0.1 },  // back
  { cx:  0,   cz:  13, hw: 9,   hd: 0.1 },  // front
  // Left shelves
  { cx: -7.5, cz: -8,  hw: 0.5, hd: 1.2 },
  { cx: -7.5, cz: -3,  hw: 0.5, hd: 1.2 },
  { cx: -7.5, cz:  3,  hw: 0.5, hd: 1.2 },
  // Right shelves
  { cx:  7.5, cz: -8,  hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz: -3,  hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz:  3,  hw: 0.5, hd: 1.2 },
  // Checkout counter
  { cx:  0,   cz: -10, hw: 2.5, hd: 0.8 },
]

/**
 * Pushes `pos` out of any penetrated AABB and zeroes the corresponding
 * velocity component so the player slides along surfaces.
 */
export function resolveCollisions(pos: THREE.Vector3, vel: THREE.Vector3) {
  for (const box of COLLIDERS) {
    const ox = (box.hw + PLAYER_RADIUS) - Math.abs(pos.x - box.cx)
    const oz = (box.hd + PLAYER_RADIUS) - Math.abs(pos.z - box.cz)

    if (ox <= 0 || oz <= 0) continue  // no overlap

    if (ox < oz) {
      pos.x += ox * Math.sign(pos.x - box.cx)
      vel.x  = 0
    } else {
      pos.z += oz * Math.sign(pos.z - box.cz)
      vel.z  = 0
    }
  }
}
