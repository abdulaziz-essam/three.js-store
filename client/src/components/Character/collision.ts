import * as THREE from 'three'

const PLAYER_RADIUS = 0.35

interface AABB {
  cx: number
  cz: number
  hw: number
  hd: number
}

const COLLIDERS: AABB[] = [
  { cx: -9,   cz:  0,  hw: 0.1, hd: 13  },
  { cx:  9,   cz:  0,  hw: 0.1, hd: 13  },
  { cx:  0,   cz: -13, hw: 9,   hd: 0.1 },
  { cx:  0,   cz:  13, hw: 9,   hd: 0.1 },
  { cx: -7.5, cz: -8,  hw: 0.5, hd: 1.2 },
  { cx: -7.5, cz: -3,  hw: 0.5, hd: 1.2 },
  { cx: -7.5, cz:  3,  hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz: -8,  hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz: -3,  hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz:  3,  hw: 0.5, hd: 1.2 },
  { cx:  0,   cz: -10, hw: 2.5, hd: 0.8 },
]

export function resolveCollisions(pos: THREE.Vector3, vel: THREE.Vector3) {
  for (const box of COLLIDERS) {
    const ox = (box.hw + PLAYER_RADIUS) - Math.abs(pos.x - box.cx)
    const oz = (box.hd + PLAYER_RADIUS) - Math.abs(pos.z - box.cz)

    if (ox <= 0 || oz <= 0) continue

    if (ox < oz) {
      pos.x += ox * Math.sign(pos.x - box.cx)
      vel.x  = 0
    } else {
      pos.z += oz * Math.sign(pos.z - box.cz)
      vel.z  = 0
    }
  }
}
