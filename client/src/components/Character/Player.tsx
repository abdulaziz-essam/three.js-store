import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeys } from '../../hooks/useKeys'
import { useStore } from '../../hooks/useStore'
import { useMouseLock } from '../../hooks/useMouseLock'
import { usePlayerKeyboard } from '../../hooks/usePlayerKeyboard'
import { checkProximity } from '../../hooks/useProximity'
import { TVS } from '../../data/storeLayout'
import CharacterMesh from './CharacterMesh'
import { resolveCollisions, lerp, getMovementVector } from './playerLogic'
import {
  SPEED, ACCELERATION, FRICTION,
  CAM_DIST, CAM_HEIGHT, CAM_LERP_SPEED, CAM_SHELF_LERP, CAM_LOOK_AHEAD,
  ROTATION_LERP, VELOCITY_THRESHOLD,
  BOUNDS, PLAYER_START,
  SEATED_FACE_ROTATION, SEAT_Y_OFFSET, HIP_HEIGHT,
  type Shelf,
} from './playerConstants'
import type { Group } from 'three'

function getShelfCameraTarget(shelf: Pick<Shelf, 'pos' | 'side'>) {
  const [shelfX, , shelfZ] = shelf.pos
  const sideSign = shelf.side === 'left' ? 1 : -1
  return {
    camPos: new THREE.Vector3(shelfX + sideSign * 3.2, 1.6, shelfZ),
    lookAt: new THREE.Vector3(shelfX + sideSign * 0.5, 1.4, shelfZ),
  }
}

function getSeatCameraTarget(seat: import('../../data/storeLayout').Seat) {
  const tv = TVS.find(t => t.id === seat.tv) ?? TVS[0]
  const [seatX, , seatZ] = seat.pos
  return {
    // Offset behind the seat so the screen is nicely framed
    camPos: new THREE.Vector3(seatX + (tv.screen[0] - seatX) * 0.3, 2.05, seatZ + 1.2),
    // Aim slightly right so the screen sits left of the "Up next" panel
    lookAt: new THREE.Vector3(tv.screen[0] + 0.9, tv.screen[1] - 0.15, tv.screen[2]),
  }
}

export default function Player() {
  const groupRef    = useRef<Group>(null)
  const keys        = useKeys()
  const { camera }  = useThree()

  const camYawRef  = useRef(0) // 0 = camera directly behind player
  const velocityRef = useRef(new THREE.Vector3())

  const shopOpen         = useStore(s => s.shopOpen)
  const checkoutOpen     = useStore(s => s.checkoutOpen)
  const filterOpen       = useStore(s => s.filterOpen)
  const introComplete    = useStore(s => s.introComplete)
  const shelfFocus       = useStore(s => s.shelfFocus)
  const watching         = useStore(s => s.watching)
  const selectedPlatform = useStore(s => s.selectedPlatform)
  const selectedGenre    = useStore(s => s.selectedGenre)

  const anyModalOpen = shopOpen || checkoutOpen || filterOpen || !!shelfFocus || !!watching

  useMouseLock({ camYawRef, locked: anyModalOpen })
  usePlayerKeyboard({ groupRef, camYawRef, velocityRef })

  useFrame((_, delta) => {
    if (!groupRef.current || !introComplete) return

    const playerPos = groupRef.current.position

    // ── Seated in the Play Zone ──
    if (watching) {
      const { seat } = watching
      playerPos.set(seat.pos[0], seat.seatHeight + SEAT_Y_OFFSET - HIP_HEIGHT, seat.pos[2])
      groupRef.current.rotation.y = SEATED_FACE_ROTATION
      const { camPos, lookAt } = getSeatCameraTarget(seat)
      camera.position.lerp(camPos, 1 - Math.exp(-4 * delta))
      camera.lookAt(lookAt)
      return
    }

    // ── Shelf focus — lock camera to shelf view ──
    if (shelfFocus) {
      const { camPos, lookAt } = getShelfCameraTarget(shelfFocus)
      camera.position.lerp(camPos, CAM_SHELF_LERP)
      camera.lookAt(lookAt)
      return
    }

    if (shopOpen || checkoutOpen || filterOpen) return

    // ── Movement with acceleration / friction ──
    const velocity = velocityRef.current
    const moveDir  = getMovementVector(keys.current, camYawRef.current)

    if (moveDir.length() > 0) {
      moveDir.normalize()
      velocity.x += (moveDir.x * SPEED - velocity.x) * Math.min(1, ACCELERATION * delta)
      velocity.z += (moveDir.z * SPEED - velocity.z) * Math.min(1, ACCELERATION * delta)
    } else {
      velocity.x += -velocity.x * Math.min(1, FRICTION * delta)
      velocity.z += -velocity.z * Math.min(1, FRICTION * delta)
    }

    if (Math.abs(velocity.x) > VELOCITY_THRESHOLD || Math.abs(velocity.z) > VELOCITY_THRESHOLD) {
      playerPos.x = Math.max(-BOUNDS.x,   Math.min(BOUNDS.x,   playerPos.x + velocity.x * delta))
      playerPos.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, playerPos.z + velocity.z * delta))
      resolveCollisions(playerPos, velocity)
      groupRef.current.rotation.y = lerp(
        groupRef.current.rotation.y,
        Math.atan2(velocity.x, velocity.z),
        ROTATION_LERP,
      )
    }

    // ── Camera follow ──
    camera.position.x = lerp(camera.position.x, playerPos.x + Math.sin(camYawRef.current) * CAM_DIST, CAM_LERP_SPEED)
    camera.position.y = lerp(camera.position.y, playerPos.y + CAM_HEIGHT,                              CAM_LERP_SPEED)
    camera.position.z = lerp(camera.position.z, playerPos.z + Math.cos(camYawRef.current) * CAM_DIST, CAM_LERP_SPEED)
    camera.lookAt(playerPos.x, playerPos.y + CAM_LOOK_AHEAD, playerPos.z)

    // ── Proximity checks ──
    checkProximity(playerPos, selectedPlatform, selectedGenre)
  })

  return (
    <group ref={groupRef} position={PLAYER_START}>
      <CharacterMesh
        soleColor="#00eeff"
        shirtColor="#1a1a2e"
        pantColor="#1a2a4a"
        skinColor="#d4906a"
        hairColor="#111"
        logoStrip
        sitting={!!watching}
      />
    </group>
  )
}
