import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeys } from '../../hooks/useKeys'
import { useStore } from '../../hooks/useStore'
import { GAMES } from '../../data/games'
import CharacterMesh from './CharacterMesh'

const POSITIONS = [
  [-3.5, 0, -8], [-1.0, 0, -8], [1.5, 0, -8], [4.0, 0, -8],
  [-3.5, 0, -2], [-1.0, 0, -2], [1.5, 0, -2], [4.0, 0, -2],
]

const SPEED = 9
const CAM_DIST = 5
const CAM_HEIGHT = 2.8
const BOUNDS = { x: 7.5, zMin: -11.5, zMax: 11.5 }
const INTERACT_DIST = 2.6
const COUNTER_POS = [0, 0, -10]
const COUNTER_DIST = 3.5

function lerp(a, b, t) { return a + (b - a) * t }

export default function Player() {
  const groupRef = useRef()
  const keys = useKeys()
  const { camera } = useThree()
  const setNearbyGame    = useStore(s => s.setNearbyGame)
  const setNearbyCounter = useStore(s => s.setNearbyCounter)
  const selectGame       = useStore(s => s.selectGame)
  const closeShop        = useStore(s => s.closeShop)
  const openCheckout     = useStore(s => s.openCheckout)
  const closeCheckout    = useStore(s => s.closeCheckout)
  const openFilter       = useStore(s => s.openFilter)
  const closeFilter      = useStore(s => s.closeFilter)
  const shopOpen         = useStore(s => s.shopOpen)
  const checkoutOpen     = useStore(s => s.checkoutOpen)
  const introComplete    = useStore(s => s.introComplete)
  const filterOpen       = useStore(s => s.filterOpen)
  const camYaw = useRef(Math.PI)

  useEffect(() => {
    const onMove = (e) => {
      if (shopOpen) return
      camYaw.current -= e.movementX * 0.003
    }
    const onClick = () => { if (!shopOpen) document.body.requestPointerLock() }
    document.addEventListener('mousemove', onMove)
    document.body.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.body.removeEventListener('click', onClick)
    }
  }, [shopOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyF') {
        const { filterOpen } = useStore.getState()
        if (filterOpen) closeFilter()
        else openFilter()
        return
      }
      if (e.code === 'KeyE') {
        const { nearbyGame, nearbyCounter, cart } = useStore.getState()
        if (nearbyCounter && cart.length > 0) {
          openCheckout()
        } else if (nearbyGame) {
          selectGame(nearbyGame)
        }
      }
      if (e.code === 'Escape') {
        closeShop()
        closeCheckout()
        closeFilter()
        document.exitPointerLock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectGame, closeShop, openCheckout, closeCheckout, openFilter, closeFilter])

  useFrame((_, delta) => {
    if (!groupRef.current || shopOpen || checkoutOpen || filterOpen || !introComplete) return
    const pos = groupRef.current.position
    const fwd = new THREE.Vector3(-Math.sin(camYaw.current), 0, -Math.cos(camYaw.current))
    const rgt = new THREE.Vector3(Math.cos(camYaw.current), 0, -Math.sin(camYaw.current))
    const move = new THREE.Vector3()
    if (keys.current['KeyW'] || keys.current['ArrowUp'])    move.add(fwd)
    if (keys.current['KeyS'] || keys.current['ArrowDown'])  move.sub(fwd)
    if (keys.current['KeyA'] || keys.current['ArrowLeft'])  move.sub(rgt)
    if (keys.current['KeyD'] || keys.current['ArrowRight']) move.add(rgt)

    if (move.length() > 0) {
      move.normalize().multiplyScalar(SPEED * delta)
      pos.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, pos.x + move.x))
      pos.z = Math.max(BOUNDS.zMin, Math.min(BOUNDS.zMax, pos.z + move.z))
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, Math.atan2(move.x, move.z), 0.18)
    }

    // Camera
    camera.position.x = lerp(camera.position.x, pos.x + Math.sin(camYaw.current) * CAM_DIST, 0.1)
    camera.position.y = lerp(camera.position.y, pos.y + CAM_HEIGHT, 0.1)
    camera.position.z = lerp(camera.position.z, pos.z + Math.cos(camYaw.current) * CAM_DIST, 0.1)
    camera.lookAt(pos.x, pos.y + 1.2, pos.z)

    // Proximity — game displays
    let closest = null, closestDist = INTERACT_DIST
    POSITIONS.forEach(([px, , pz], i) => {
      const d = Math.sqrt((pos.x - px) ** 2 + (pos.z - pz) ** 2)
      if (d < closestDist) { closestDist = d; closest = GAMES[i] }
    })
    setNearbyGame(closest)

    // Proximity — checkout counter
    const counterDist = Math.sqrt((pos.x - COUNTER_POS[0]) ** 2 + (pos.z - COUNTER_POS[2]) ** 2)
    setNearbyCounter(counterDist < COUNTER_DIST)
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
