import * as THREE from 'three'

export const SPEED        = 18
export const ACCELERATION = 12
export const FRICTION     = 10

export const CAM_DIST   = 5
export const CAM_HEIGHT = 2.8
export const CAM_SENSITIVITY = 0.003

export const BOUNDS = { x: 7.5, zMin: -11.5, zMax: 11.5 }

export const INTERACT_DIST = 2.6
export const COUNTER_DIST  = 3.5
export const SHELF_DIST    = 2.8
export const COUNTER_POS   = new THREE.Vector3(0, 0, -10)

export const DISPLAY_POSITIONS: [number, number, number][] = [
  [-3.5, 0, -8], [-1.0, 0, -8], [1.5, 0, -8], [4.0, 0, -8],
  [-3.5, 0, -2], [-1.0, 0, -2], [1.5, 0, -2], [4.0, 0, -2],
]

export const SHELVES = [
  { id: 'L0', pos: [-7.5, 0, -8] as [number, number, number], side: 'left'  as const },
  { id: 'L1', pos: [-7.5, 0, -3] as [number, number, number], side: 'left'  as const },
  { id: 'L2', pos: [-7.5, 0,  3] as [number, number, number], side: 'left'  as const },
  { id: 'R0', pos: [ 7.5, 0, -8] as [number, number, number], side: 'right' as const },
  { id: 'R1', pos: [ 7.5, 0, -3] as [number, number, number], side: 'right' as const },
  { id: 'R2', pos: [ 7.5, 0,  3] as [number, number, number], side: 'right' as const },
]

export type Shelf = typeof SHELVES[number]
