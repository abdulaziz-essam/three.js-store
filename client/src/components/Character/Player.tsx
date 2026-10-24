import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeys, getDirectionInput } from '../../hooks/useKeys'
import { useStore } from '../../hooks/useStore'
import { GAMES, matchesActiveFilters } from '../../data/games'
import CharacterMesh from './CharacterMesh'
import { resolveCollisions } from './collision'
import {
  SPEED, ACCELERATION, FRICTION,
  CAM_DIST, CAM_HEIGHT, CAM_SENSITIVITY,
  BOUNDS, INTERACT_DIST, COUNTER_DIST, SHELF_DIST,
  COUNTER_POS, DISPLAY_POSITIONS, SHELVES,
  type Shelf,
} from './playerConstants'
import type { Group } from 'three'

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getMovementVector(keys: Record<string, boolean>, yaw: number): THREE.Vector3 {
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
  const right   = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw))
  const dir     = new THREE.Vector3()
  const input   = getDirectionInput(keys)

  if (input.up)    dir.add(forward)
  if (input.down)  dir.sub(forward)
  if (input.left)  dir.sub(right)
  if (input.right) dir.add(right)

  return dir
}

function getShelfCamTarget(shelf: Shelf) {
  const [sx, , sz] = shelf.pos
  const sign = shelf.side === 'left' ? 1 : -1
  return {
    camPos: new THREE.Vector3(sx + sign * 3.2, 1.6, sz),
    lookAt: new THREE.Vector3(sx + sign * 0.5, 1.4, sz),
  }
}

function dist2D(ax: number, az: number, bx: number, bz: number) {
  return Math.sqrt((ax - bx) ** 2 + (az - bz) ** 2)
}

export default function Player() {
  const groupRef = useRef<Group>(null)
  const keys     = useKeys()
  const { camera } = useThree()

  const camYaw  = useRef(Math.PI)
  const velocity = useRef(new THREE.Vector3())

  const setNearbyGame    = useStore(s => s.setNearbyGame)
  const setNearbyCounter = useStore(s => s.setNearbyCounter)
  const setNearbyShelf   = useStore(s => s.setNearbyShelf)
  const focusShelf       = useStore(s => s.focusShelf)
  const unfocusShelf     = useStore(s => s.unfocusShelf)
  const selectGame       = useStore(s => s.selectGame)
  const closeShop        = useStore(s => s.closeShop)
  const openCheckout     = useStore(s => s.openCheckout)
  const closeCheckout    = useStore(s => s.closeCheckout)
  const openFilter       = useStore(s => s.openFilter)
  const closeFilter      = useStore(s => s.closeFilter)

  const shopOpen         = useStore(s => s.shopOpen)
  const checkoutOpen     = useStore(s => s.checkoutOpen)
  const filterOpen       = useStore(s => s.filterOpen)
  const introComplete    = useStore(s => s.introComplete)
  const shelfFocus       = useStore(s => s.shelfFocus)
  const selectedPlatform = useStore(s => s.selectedPlatform)
  const selectedGenre    = useStore(s => s.selectedGenre)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!shopOpen && !shelfFocus) camYaw.current -= e.movementX * CAM_SENSITIVITY
    }
    const onClick = () => {
      if (!shopOpen && !shelfFocus) document.body.requestPointerLock()
    }
    document.addEventListener('mousemove', onMove)
    document.body.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.body.removeEventListener('click', onClick)
    }
  }, [shopOpen, shelfFocus])

  // Keyboard interactions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (useStore.getState().shelfFocus) { unfocusShelf(); return }
        closeShop(); closeCheckout(); closeFilter()
        document.exitPointerLock()
        return
      }

      if (e.code === 'KeyF') {
        useStore.getState().filterOpen ? closeFilter() : openFilter()
        return
      }

      if (e.code === 'KeyE') {
        const { nearbyGame, nearbyCounter, nearbyShelf, shelfFocus, cart } = useStore.getState()
        if (shelfFocus)                        { unfocusShelf(); return }
        if (nearbyShelf)                       { focusShelf(nearbyShelf); document.exitPointerLock(); return }
        if (nearbyCounter && cart.length > 0)  { openCheckout(); return }
        if (nearbyGame)                        { selectGame(nearbyGame) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectGame, closeShop, openCheckout, closeCheckout, openFilter, closeFilter, focusShelf, unfocusShelf])

  useFrame((_, delta) => {
    if (!groupRef.current || !introComplete) return

    const pos = groupRef.current.position

    // Shelf focus — lock camera to shelf view
    if (shelfFocus) {
      const { camPos, lookAt } = getShelfCamTarget(shelfFocus)
      camera.position.lerp(camPos, 0.06)
      camera.lookAt(lookAt)
      return
    }

    if (shopOpen || checkoutOpen || filterOpen) return

    // ── Movement with acceleration / friction ──
    const vel = velocity.current
    const dir = getMovementVector(keys.current, camYaw.current)

    if (dir.length() > 0) {
      dir.normalize()
      vel.x += (dir.x * SPEED - vel.x) * Math.min(1, ACCELERATION * delta)
      vel.z += (dir.z * SPEED - vel.z) * Math.min(1, ACCELERATION * delta)
    } else {
      vel.x += -vel.x * Math.min(1, FRICTION * delta)
      vel.z += -vel.z * Math.min(1, FRICTION * delta)
    }

    if (Math.abs(vel.x) > 0.01 || Math.abs(vel.z) > 0.01) {
      pos.x = Math.max(-BOUNDS.x,   Math.min(BOUNDS.x,   pos.x + vel.x * delta))
      pos.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, pos.z + vel.z * delta))
      resolveCollisions(pos, vel)
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, Math.atan2(vel.x, vel.z), 0.18)
    }

    // ── Camera follow ──
    camera.position.x = lerp(camera.position.x, pos.x + Math.sin(camYaw.current) * CAM_DIST, 0.1)
    camera.position.y = lerp(camera.position.y, pos.y + CAM_HEIGHT, 0.1)
    camera.position.z = lerp(camera.position.z, pos.z + Math.cos(camYaw.current) * CAM_DIST, 0.1)
    camera.lookAt(pos.x, pos.y + 1.2, pos.z)

    // ── Proximity checks ──
    const filtered = GAMES.filter(matchesActiveFilters(selectedPlatform, selectedGenre))

    let nearestGame = null
    let nearestGameDist = INTERACT_DIST
    DISPLAY_POSITIONS.forEach(([px, , pz], i) => {
      if (!filtered[i]) return
      const d = dist2D(pos.x, pos.z, px, pz)
      if (d < nearestGameDist) { nearestGameDist = d; nearestGame = filtered[i] }
    })
    setNearbyGame(nearestGame)

    setNearbyCounter(dist2D(pos.x, pos.z, COUNTER_POS.x, COUNTER_POS.z) < COUNTER_DIST)

    let nearestShelf: Shelf | null = null
    let nearestShelfDist = SHELF_DIST
    SHELVES.forEach(shelf => {
      const [sx, , sz] = shelf.pos
      const d = dist2D(pos.x, pos.z, sx, sz)
      if (d < nearestShelfDist) { nearestShelfDist = d; nearestShelf = shelf }
    })
    setNearbyShelf(nearestShelf)
  })

  return (
    <group ref={groupRef} position={[0, 0, 10]}>
      <CharacterMesh
        soleColor="#00eeff"
        shirtColor="#1a1a2e"
        pantColor="#1a2a4a"
        skinColor="#d4906a"
        hairColor="#111"
        logoStrip
      />
    </group>
  )
}
