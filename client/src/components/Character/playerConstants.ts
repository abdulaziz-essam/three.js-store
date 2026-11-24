import * as THREE from 'three'
import { BUILDING, COUNTER_POS as COUNTER_XYZ } from '../../data/storeLayout'

export { DISPLAY_SLOTS, SHELVES, PLAYER_START } from '../../data/storeLayout'
export type { Shelf } from '../../data/storeLayout'

export const SPEED        = 6   // m/s — a relaxed walking pace (was 18)
export const ACCELERATION = 10
export const FRICTION     = 10

export const CAM_DIST        = 5
export const CAM_HEIGHT      = 2.8
export const CAM_SENSITIVITY = 0.003
export const CAM_LERP_SPEED  = 0.1   // fraction per frame for free-roam camera
export const CAM_SHELF_LERP  = 0.06  // fraction per frame when lerping to shelf view
export const CAM_LOOK_AHEAD  = 1.2   // y offset above player that the camera looks at

export const ROTATION_LERP = 0.18    // fraction per frame for character body rotation
export const VELOCITY_THRESHOLD = 0.01 // below this speed, skip movement + rotation update

export const BOUNDS = { x: BUILDING.width / 2 - 0.6, zMin: -BUILDING.depth / 2 + 0.6, zMax: BUILDING.depth / 2 - 0.6 }

export const INTERACT_DIST = 2.6
export const COUNTER_DIST  = 3.8
export const SHELF_DIST    = 2.8
export const COUNTER_POS   = new THREE.Vector3(...COUNTER_XYZ)

// Seated pose offsets (character mesh sits at hip height, group.position is at floor)
export const SEAT_Y_OFFSET = 0.05    // small lift above the seat surface
export const HIP_HEIGHT    = 0.875   // y of the hip joint in the character mesh local space
export const SEATED_FACE_ROTATION = Math.PI // face the back wall (toward TVs)
