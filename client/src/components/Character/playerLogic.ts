import * as THREE from 'three'
import { getDirectionInput } from '../../hooks/useKeys'
import { COLLIDERS } from '../../data/storeLayout'

export { COLLIDERS }

export const PLAYER_R = 0.35
export type { AABB } from '../../data/storeLayout'

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
  const moveDir = new THREE.Vector3()
  const { up, down, left, right } = getDirectionInput(keys)

  if (up)    moveDir.add(cameraForward)
  if (down)  moveDir.sub(cameraForward)
  if (left)  moveDir.sub(cameraRight)
  if (right) moveDir.add(cameraRight)
  return moveDir
}
