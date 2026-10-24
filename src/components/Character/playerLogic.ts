import * as THREE from 'three'
import { getDirectionInput } from '../../hooks/useKeys'

export const PLAYER_R = 0.35
export interface AABB { cx: number; cz: number; hw: number; hd: number }

export const COLLIDERS: AABB[] = [
  { cx: -9,   cz:  0,   hw: 0.1, hd: 13 },
  { cx:  9,   cz:  0,   hw: 0.1, hd: 13 },
  { cx:  0,   cz: -13,  hw: 9,   hd: 0.1 },
  { cx:  0,   cz:  13,  hw: 9,   hd: 0.1 },
  { cx: -7.5, cz: -8,   hw: 0.5, hd: 1.2 },
  { cx: -7.5, cz: -3,   hw: 0.5, hd: 1.2 },
  { cx: -7.5, cz:  3,   hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz: -8,   hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz: -3,   hw: 0.5, hd: 1.2 },
  { cx:  7.5, cz:  3,   hw: 0.5, hd: 1.2 },
  { cx:  0,   cz: -10,  hw: 2.5, hd: 0.8 },
]

export function resolveCollisions(pos: THREE.Vector3, vel: THREE.Vector3) {
  for (const col of COLLIDERS) {
    const overlapX = (col.hw + PLAYER_R) - Math.abs(pos.x - col.cx)
    const overlapZ = (col.hd + PLAYER_R) - Math.abs(pos.z - col.cz)
    if (overlapX > 0 && overlapZ > 0) {
      if (overlapX < overlapZ) {
        pos.x += overlapX * Math.sign(pos.x - col.cx)
        vel.x = 0
      } else {
        pos.z += overlapZ * Math.sign(pos.z - col.cz)
        vel.z = 0
      }
    }
  }
}

export function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

export function getMovementVector(keys: Record<string, boolean>, yaw: number): THREE.Vector3 {
  const cameraForward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
  const cameraRight   = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw))
  const direction = new THREE.Vector3()
  const { up, down, left, right } = getDirectionInput(keys)

  if (up)    direction.add(cameraForward)
  if (down)  direction.sub(cameraForward)
  if (left)  direction.sub(cameraRight)
  if (right) direction.add(cameraRight)
  return direction
}
