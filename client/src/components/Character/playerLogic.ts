import { CAM_DIST } from './playerConstants'
import * as THREE from 'three'
import { getDirectionInput } from '../../hooks/useKeys'
import { BUILDING, COLLIDERS } from '../../data/storeLayout'

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

// The follow camera trails CAM_DIST behind the player; near a wall that point is
// outside the building, so keep it this far inside the walls and below the ceiling.
export const CAM_WALL_MARGIN = 0.35
export const CAM_MAX_X = BUILDING.width / 2 - CAM_WALL_MARGIN
export const CAM_MAX_Z = BUILDING.depth / 2 - CAM_WALL_MARGIN
export const CAM_MAX_Y = BUILDING.height - 0.3
export const CAM_WALL_LIFT = 0.9   // metres of extra height per metre the camera is pulled in

/** How far behind the player (along dirX/dirZ) the camera can sit before leaving the store. */
export function getCameraDistance(px: number, pz: number, dirX: number, dirZ: number) {
  let d = CAM_DIST
  if (dirX > 1e-6)  d = Math.min(d, (CAM_MAX_X - px) / dirX)
  if (dirX < -1e-6) d = Math.min(d, (-CAM_MAX_X - px) / dirX)
  if (dirZ > 1e-6)  d = Math.min(d, (CAM_MAX_Z - pz) / dirZ)
  if (dirZ < -1e-6) d = Math.min(d, (-CAM_MAX_Z - pz) / dirZ)
  return Math.max(0, d)
}
