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
  it('position far from all colliders — not modified', () => {
    const pos = new THREE.Vector3(0, 0, 0)
    const vel = new THREE.Vector3(1, 0, 1)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeCloseTo(0)
    expect(pos.z).toBeCloseTo(0)
    expect(vel.x).toBe(1)
    expect(vel.z).toBe(1)
  })

  it('position overlapping left wall (cx:-9) — pushed right, vel.x zeroed', () => {
    // Left wall: cx=-9, hw=0.1, hd=13. Player radius=0.35.
    // Collision X zone: |pos.x - (-9)| < 0.45 → pos.x in (-9.45, -8.55)
    // Place player on the floor-side of the wall (x > cx) so sign is positive → pushed right
    const pos = new THREE.Vector3(-8.7, 0, 0)
    const vel = new THREE.Vector3(-2, 0, 0)
    resolveCollisions(pos, vel)
    // Should be pushed to the right (x increases, away from wall center)
    expect(pos.x).toBeGreaterThan(-8.7)
    expect(vel.x).toBe(0)
  })

  it('position overlapping right wall (cx:9) — pushed left, vel.x zeroed', () => {
    // Right wall: cx=9, hw=0.1. Place player on floor-side (x < cx) → pushed left
    const pos = new THREE.Vector3(8.7, 0, 0)
    const vel = new THREE.Vector3(2, 0, 0)
    resolveCollisions(pos, vel)
    expect(pos.x).toBeLessThan(8.7)
    expect(vel.x).toBe(0)
  })

  it('position overlapping checkout counter — pushed out correctly', () => {
    // Counter: cx=0, cz=-10, hw=2.5, hd=0.8. Player radius=0.35.
    // Collision zone: x in (-2.85, 2.85) and z in (-11.15, -8.85)
    // Place player directly in front of counter along z axis
    const pos = new THREE.Vector3(0, 0, -9.0)
    const vel = new THREE.Vector3(0, 0, -1)
    resolveCollisions(pos, vel)
    // Counter blocks from z=-11.15 to -8.85, player at z=-9 is inside
    // Should push player out on z axis since overlapZ < overlapX here
    // overlapX = (2.5+0.35) - |0 - 0| = 2.85
    // overlapZ = (0.8+0.35) - |-9.0 - (-10)| = 1.15 - 1.0 = 0.15
    // overlapZ < overlapX so push along Z
    expect(vel.z).toBe(0)
    // Velocity on X should be unaffected
    expect(vel.x).toBe(0)
  })

  it('velocity not zeroed on the non-collision axis', () => {
    // Use left wall collision — player on floor-side of left wall with z-velocity too
    const pos = new THREE.Vector3(-8.7, 0, 0)
    const vel = new THREE.Vector3(-1, 0, 3)
    resolveCollisions(pos, vel)
    // X should be zeroed (collision axis), Z should be untouched
    expect(vel.x).toBe(0)
    expect(vel.z).toBe(3)
  })

  it('position clearly inside back wall collider — pushed out and z vel zeroed', () => {
    // Back wall: cx=0, cz=-13, hw=9, hd=0.1. Player radius=0.35.
    // Collision Z zone: |pos.z - (-13)| < 0.45 → pos.z in (-13.45, -12.55)
    // Place player on floor-side (z > cz = -13) so pushed toward positive z
    const pos = new THREE.Vector3(0, 0, -12.7)
    const vel = new THREE.Vector3(0, 0, -2)
    resolveCollisions(pos, vel)
    expect(pos.z).toBeGreaterThan(-12.7)
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
