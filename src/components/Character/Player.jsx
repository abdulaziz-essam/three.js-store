import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeys } from '../../hooks/useKeys'
import { useStore } from '../../hooks/useStore'
import { GAMES } from '../../data/games'

const PEDESTAL_POSITIONS = [
  [-4.0, 0, -9],
  [-4.0, 0, -4],
  [-4.0, 0,  1],
  [ 4.0, 0, -9],
  [ 4.0, 0, -4],
  [ 4.0, 0,  1],
]

const SPEED = 5
const CAM_DISTANCE = 5
const CAM_HEIGHT = 3
const BOUNDS = { x: 5.5, z: 10.5 }
const INTERACT_DIST = 2.8

const _vec = new THREE.Vector3()
const _target = new THREE.Vector3()

function lerp(a, b, t) { return a + (b - a) * t }

export default function Player() {
  const groupRef = useRef()
  const bodyRef = useRef()
  const keys = useKeys()
  const { camera } = useThree()
  const { setNearbyGame, openShop, shopOpen } = useStore()

  const yaw = useRef(0)
  const camYaw = useRef(Math.PI)

  // Mouse look
  useEffect(() => {
    const onMove = (e) => {
      if (shopOpen) return
      camYaw.current -= e.movementX * 0.003
      yaw.current = camYaw.current + Math.PI
    }
    const onClick = () => { document.body.requestPointerLock() }
    document.addEventListener('mousemove', onMove)
    document.body.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.body.removeEventListener('click', onClick)
    }
  }, [shopOpen])

  // E key to interact
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyE') {
        const store = useStore.getState()
        if (store.nearbyGame) openShop(store.nearbyGame)
      }
      if (e.code === 'Escape') {
        useStore.getState().closeShop()
        document.exitPointerLock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openShop])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    if (shopOpen) return

    const pos = groupRef.current.position

    // Movement direction relative to camera yaw
    const forward = new THREE.Vector3(-Math.sin(camYaw.current), 0, -Math.cos(camYaw.current))
    const right = new THREE.Vector3(Math.cos(camYaw.current), 0, -Math.sin(camYaw.current))

    const move = new THREE.Vector3()
    if (keys.current['KeyW'] || keys.current['ArrowUp'])    move.add(forward)
    if (keys.current['KeyS'] || keys.current['ArrowDown'])  move.sub(forward)
    if (keys.current['KeyA'] || keys.current['ArrowLeft'])  move.sub(right)
    if (keys.current['KeyD'] || keys.current['ArrowRight']) move.add(right)

    if (move.length() > 0) {
      move.normalize().multiplyScalar(SPEED * delta)
      pos.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, pos.x + move.x))
      pos.z = Math.max(-BOUNDS.z, Math.min(BOUNDS.z, pos.z + move.z))

      // Face movement direction
      const angle = Math.atan2(move.x, move.z)
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, angle, 0.2)

      // Bob body
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.04
      }
    }

    // Third-person camera
    const camX = pos.x + Math.sin(camYaw.current) * CAM_DISTANCE
    const camZ = pos.z + Math.cos(camYaw.current) * CAM_DISTANCE
    camera.position.x = lerp(camera.position.x, camX, 0.1)
    camera.position.y = lerp(camera.position.y, pos.y + CAM_HEIGHT, 0.1)
    camera.position.z = lerp(camera.position.z, camZ, 0.1)
    _target.set(pos.x, pos.y + 1.2, pos.z)
    camera.lookAt(_target)

    // Proximity check
    let closest = null
    let closestDist = INTERACT_DIST
    PEDESTAL_POSITIONS.forEach((ppos, i) => {
      const dx = pos.x - ppos[0]
      const dz = pos.z - ppos[2]
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < closestDist) {
        closestDist = dist
        closest = GAMES[i]
      }
    })
    setNearbyGame(closest)
  })

  return (
    <group ref={groupRef} position={[0, 0, 8]}>
      {/* Legs */}
      <mesh position={[-0.13, 0.42, 0]} castShadow>
        <boxGeometry args={[0.18, 0.72, 0.18]} />
        <meshStandardMaterial color="#1a1208" roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.42, 0]} castShadow>
        <boxGeometry args={[0.18, 0.72, 0.18]} />
        <meshStandardMaterial color="#1a1208" roughness={0.8} />
      </mesh>
      {/* Coat / body */}
      <mesh ref={bodyRef} position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.52, 0.7, 0.28]} />
        <meshStandardMaterial color="#2c1f0a" roughness={0.85} />
      </mesh>
      {/* Vest lapels */}
      <mesh position={[0, 0.92, 0.15]} castShadow>
        <boxGeometry args={[0.28, 0.5, 0.04]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.34, 0.86, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.16]} />
        <meshStandardMaterial color="#2c1f0a" roughness={0.85} />
      </mesh>
      <mesh position={[0.34, 0.86, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.16]} />
        <meshStandardMaterial color="#2c1f0a" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[0.32, 0.34, 0.3]} />
        <meshStandardMaterial color="#d4a57a" roughness={0.8} />
      </mesh>
      {/* Hat brim */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.48, 0.04, 0.42]} />
        <meshStandardMaterial color="#1a0f04" roughness={0.9} />
      </mesh>
      {/* Hat crown */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[0.3, 0.46, 0.28]} />
        <meshStandardMaterial color="#1a0f04" roughness={0.9} />
      </mesh>
      {/* Hat band */}
      <mesh position={[0, 1.64, 0]}>
        <boxGeometry args={[0.31, 0.08, 0.29]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
