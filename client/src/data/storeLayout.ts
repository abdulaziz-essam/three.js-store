// Single source of truth for where things are in the store.
// Matches blender/pixel_vault_store.blend (exported to public/models/pixel_vault_store.glb).
// three.js coordinates: x = left/right, y = up, z = toward the entrance (+17) / back wall (-17).

export type Vec3 = [number, number, number]

export const STORE_MODEL_URL = '/models/pixel_vault_store.glb'

export const BUILDING = { width: 24, height: 5.5, depth: 34 }
const HW = BUILDING.width / 2
const HD = BUILDING.depth / 2

/** Center-aisle display pedestals, keyed by game id (3 themed rows of 4). */
const ROW_X = [-5.4, -1.8, 1.8, 5.4]
const ROWS: { z: number; ids: string[] }[] = [
  { z:  3.5, ids: ['spiderman', 'cyberpunk', 'tlou2', 'gow'] },              // NEW & HOT
  { z: -2.0, ids: ['eldenring', 'baldursgate', 'sekiro', 'batman'] },        // TOP RATED
  { z: -7.5, ids: ['witcher3', 'rdr2', 'kingdomhearts', 'bioshock'] },       // CLASSICS
]
export const DISPLAY_SLOTS: Record<string, Vec3> = Object.fromEntries(
  ROWS.flatMap(row => row.ids.map((id, i) => [id, [ROW_X[i], 0, row.z] as Vec3])),
)

/** Wall shelves: 4 per side wall, each 3 m wide. */
const SHELF_Z = [4.5, 0, -4.5, -9]
const SHELF_X = HW - 0.5
export const SHELF_WIDTH = 3
export const SHELVES = [
  ...['ACTION', 'RPG', 'ADVENTURE', 'SHOOTER'].map((label, i) => (
    { id: `L-${label}`, label, pos: [-SHELF_X, 0, SHELF_Z[i]] as Vec3, side: 'left' as const })),
  ...['SALE', 'PRE-ORDER', 'CLASSICS', 'FAMILY'].map((label, i) => (
    { id: `R-${label}`, label, pos: [SHELF_X, 0, SHELF_Z[i]] as Vec3, side: 'right' as const })),
]
export type Shelf = typeof SHELVES[number]

/** Checkout counter: front-right by the door, 6 m long, facing the aisle. */
export const COUNTER_POS: Vec3 = [8, 0, 12.5]

/** Consoles section: front-left, one kiosk per platform, facing the aisle. */
export const CONSOLE_KIOSKS = [
  { platform: 'pc',       label: 'PC',          pos: [-HW + 3.4, 0, 15.0] as Vec3 },
  { platform: 'ps5',      label: 'PLAYSTATION', pos: [-HW + 3.4, 0, 12.4] as Vec3 },
  { platform: 'xbox',     label: 'XBOX',        pos: [-HW + 3.4, 0,  9.8] as Vec3 },
  { platform: 'nintendo', label: 'NINTENDO',    pos: [-HW + 3.4, 0,  7.2] as Vec3 },
]

/** Just inside the door; the camera starts behind the player looking into the store. */
export const PLAYER_START: Vec3 = [0, 0, 11]

export interface AABB { cx: number; cz: number; hw: number; hd: number }

export const COLLIDERS: AABB[] = [
  // walls
  { cx: -HW, cz:   0, hw: 0.1, hd: HD },
  { cx:  HW, cz:   0, hw: 0.1, hd: HD },
  { cx:   0, cz: -HD, hw: HW,  hd: 0.1 },
  { cx:   0, cz:  HD, hw: HW,  hd: 0.1 },
  // wall shelves
  ...SHELVES.map(s => ({ cx: s.pos[0] + (s.side === 'left' ? -0.15 : 0.15), cz: s.pos[2], hw: 0.4, hd: SHELF_WIDTH / 2 + 0.05 })),
  // display pedestals
  ...Object.values(DISPLAY_SLOTS).map(([x, , z]) => ({ cx: x, cz: z, hw: 0.6, hd: 0.6 })),
  // checkout counter (rotated: its 6 m length runs along z)
  { cx: COUNTER_POS[0], cz: COUNTER_POS[2], hw: 0.65, hd: 3.05 },
  // console kiosks (1.2 m wide along z, 0.8 m deep along x)
  ...CONSOLE_KIOSKS.map(k => ({ cx: k.pos[0], cz: k.pos[2], hw: 0.45, hd: 0.65 })),
  // play zone: couch, TV cabinets, bean bags
  { cx:  0, cz: -13.8, hw: 1.6,  hd: 0.5 },
  { cx: -7, cz: -16.3, hw: 1.2,  hd: 0.3 },
  { cx:  0, cz: -16.3, hw: 1.2,  hd: 0.3 },
  { cx:  7, cz: -16.3, hw: 1.2,  hd: 0.3 },
  { cx: -7, cz: -14.0, hw: 1.2,  hd: 0.45 },
  { cx:  7, cz: -14.0, hw: 1.2,  hd: 0.45 },
]

// ───────── Play Zone: TVs that play trailers, and the seats facing them ─────────

export interface TV {
  id: 'left' | 'center' | 'right'
  /** center of the screen surface (just in front of the glass) */
  screen: Vec3
  width: number
  height: number
  /** trailer shown when nobody is watching this TV */
  defaultGame: string
}

const TV_Z = -HD + 0.45 + 0.05
export const TVS: TV[] = [
  { id: 'left',   screen: [-7, 2.6, TV_Z], width: 2.08, height: 1.14,  defaultGame: 'eldenring' },
  { id: 'center', screen: [ 0, 2.6, TV_Z], width: 2.6,  height: 1.425, defaultGame: 'cyberpunk' },
  { id: 'right',  screen: [ 7, 2.6, TV_Z], width: 2.08, height: 1.14,  defaultGame: 'gow' },
]

export interface Seat {
  id: string
  tv: TV['id']
  /** where the character sits (floor position under the seat) */
  pos: Vec3
  /** height of the sitting surface */
  seatHeight: number
  /** where the character stands up to (in front of the seat, toward the TV) */
  standPos: Vec3
}

export const SEATS: Seat[] = [
  { id: 'couch',      tv: 'center', pos: [ 0,   0, -13.75], seatHeight: 0.42, standPos: [ 0,   0, -14.8] },
  { id: 'beanbag-l1', tv: 'left',   pos: [-7.7, 0, -14.0],  seatHeight: 0.45, standPos: [-7.7, 0, -14.95] },
  { id: 'beanbag-l2', tv: 'left',   pos: [-6.3, 0, -14.0],  seatHeight: 0.45, standPos: [-6.3, 0, -14.95] },
  { id: 'beanbag-r1', tv: 'right',  pos: [ 6.3, 0, -14.0],  seatHeight: 0.45, standPos: [ 6.3, 0, -14.95] },
  { id: 'beanbag-r2', tv: 'right',  pos: [ 7.7, 0, -14.0],  seatHeight: 0.45, standPos: [ 7.7, 0, -14.95] },
]
export const SEAT_DIST = 1.4
