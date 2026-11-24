import * as THREE from 'three'
import { resolveCollisions, lerp, getMovementVector } from '../components/Character/playerLogic'
// playerLogic.ts also imports from hooks/useKeys which is fine

describe('lerp', () => {
  it('lerp(0, 10, 0) === 0', () => {
    expect(lerp(0, 10, 0)).toBe(0)
  })

  it('lerp(0, 10, 1) === 10', () => {
    expect(lerp(0, 10, 1)).toBe(10)
  })

  it('lerp(0, 10, 0.5) === 5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('lerp(5, 15, 0.2) is close to 7', () => {
    expect(lerp(5, 15, 0.2)).toBeCloseTo(7, 5)
  })
})

describe('resolveCollisions', () => {
  // Store is 24 x 34 m: walls at x = ±12 and z = ±17 (see data/storeLayout.ts). Player radius = 0.35.
  it('position far from all colliders — not modified', () => {
    const pos = new THREE.Vector3(0, 0, 0)
    const vel = new THREE.Vector3(1, 0, 1)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeCloseTo(0)
    expect(pos.z).toBeCloseTo(0)
    expect(vel.x).toBe(1)
    expect(vel.z).toBe(1)
  })

  it('position overlapping left wall (cx:-12) — pushed right, vel.x zeroed', () => {
    // Between shelves (shelves sit at z = 4.5, 0, -4.5, -9) so only the wall applies
    const pos = new THREE.Vector3(-11.7, 0, 13)
    const vel = new THREE.Vector3(-2, 0, 0)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeGreaterThan(-11.7)
    expect(vel.x).toBe(0)
  })

  it('position overlapping right wall (cx:12) — pushed left, vel.x zeroed', () => {
    const pos = new THREE.Vector3(11.7, 0, -13)
    const vel = new THREE.Vector3(2, 0, 0)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeLessThan(11.7)
    expect(vel.x).toBe(0)
  })

  it('position overlapping checkout counter — pushed back into the aisle', () => {
    // Counter: cx=8, cz=12.5, hw=0.65, hd=3.05.
    // overlapX = (0.65+0.35) - |7.2 - 8| = 0.2 ; overlapZ = (3.05+0.35) - 0 = 3.4 → push along X
    const pos = new THREE.Vector3(7.2, 0, 12.5)
    const vel = new THREE.Vector3(1, 0, 0.5)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeCloseTo(7.0)
    expect(vel.x).toBe(0)
    expect(vel.z).toBe(0.5)
  })

  it('position overlapping a display pedestal — pushed out', () => {
    // Spider-Man 2 pedestal at (-5.4, 3.5), collider half-size 0.6
    const pos = new THREE.Vector3(-5.4, 0, 3.5 + 0.8)
    const vel = new THREE.Vector3(0, 0, -1)
    resolveCollisions(pos, vel)
    expect(pos.z).toBeCloseTo(3.5 + 0.95)
    expect(vel.z).toBe(0)
  })

  it('position overlapping a console kiosk — pushed out', () => {
    // PlayStation kiosk at (-8.6, 12.4), hw=0.45 → x-extent with player radius: 0.8
    const pos = new THREE.Vector3(-8.6 + 0.7, 0, 12.4)
    const vel = new THREE.Vector3(-1, 0, 0)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeCloseTo(-8.6 + 0.8)
    expect(vel.x).toBe(0)
  })

  it('velocity not zeroed on the non-collision axis', () => {
    const pos = new THREE.Vector3(-11.7, 0, 13)
    const vel = new THREE.Vector3(-1, 0, 3)
    resolveCollisions(pos, vel)
    expect(vel.x).toBe(0)
    expect(vel.z).toBe(3)
  })

  it('position clearly inside back wall collider — pushed out and z vel zeroed', () => {
    // Back wall: cz=-17. Use x=3.5 to stay clear of the play-zone furniture
    const pos = new THREE.Vector3(3.5, 0, -16.7)
    const vel = new THREE.Vector3(0, 0, -2)
    resolveCollisions(pos, vel)
    expect(pos.z).toBeGreaterThan(-16.7)
    expect(vel.z).toBe(0)
  })
})

describe('getMovementVector', () => {
  it('no keys — zero vector', () => {
    const dir = getMovementVector({}, 0)
    expect(dir.length()).toBeCloseTo(0)
  })

  it('forward (KeyW) with yaw=0 — direction roughly (0, 0, -1)', () => {
    const dir = getMovementVector({ KeyW: true }, 0)
    // yaw=0: cameraForward = (-sin(0), 0, -cos(0)) = (0, 0, -1)
    expect(dir.x).toBeCloseTo(0, 5)
    expect(dir.z).toBeCloseTo(-1, 5)
  })

  it('backward (KeyS) with yaw=0 — direction roughly (0, 0, +1)', () => {
    const dir = getMovementVector({ KeyS: true }, 0)
    expect(dir.x).toBeCloseTo(0, 5)
    expect(dir.z).toBeCloseTo(1, 5)
  })

  it('strafe right (KeyD) with yaw=0 — direction roughly (+1, 0, 0)', () => {
    const dir = getMovementVector({ KeyD: true }, 0)
    // yaw=0: cameraRight = (cos(0), 0, -sin(0)) = (1, 0, 0)
    expect(dir.x).toBeCloseTo(1, 5)
    expect(dir.z).toBeCloseTo(0, 5)
  })

  it('strafe left (KeyA) with yaw=0 — direction roughly (-1, 0, 0)', () => {
    const dir = getMovementVector({ KeyA: true }, 0)
    expect(dir.x).toBeCloseTo(-1, 5)
    expect(dir.z).toBeCloseTo(0, 5)
  })

  it('keys W+D — diagonal vector with nonzero x and z components', () => {
    const dir = getMovementVector({ KeyW: true, KeyD: true }, 0)
    // Both components should be nonzero and positive/negative appropriately
    expect(dir.x).toBeGreaterThan(0) // right component
    expect(dir.z).toBeLessThan(0)    // forward component
    expect(dir.length()).toBeGreaterThan(0)
  })

  it('direction changes with yaw', () => {
    // With yaw=PI/2, forward direction rotates 90 degrees
    const yaw = Math.PI / 2
    const dir = getMovementVector({ KeyW: true }, yaw)
    // cameraForward = (-sin(PI/2), 0, -cos(PI/2)) = (-1, 0, ~0)
    expect(dir.x).toBeCloseTo(-1, 5)
    expect(dir.z).toBeCloseTo(0, 5)
  })

  it('ArrowUp with yaw=0 — same as KeyW', () => {
    const dir1 = getMovementVector({ KeyW: true }, 0)
    const dir2 = getMovementVector({ ArrowUp: true }, 0)
    expect(dir1.x).toBeCloseTo(dir2.x, 5)
    expect(dir1.z).toBeCloseTo(dir2.z, 5)
  })
})
