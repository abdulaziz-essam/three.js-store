import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeys } from '../../hooks/useKeys'
import { useStore } from '../../hooks/useStore'
import { GAMES } from '../../data/games'

const POSITIONS = [
  [-3.5, 0, -8], [-1.0, 0, -8], [1.5, 0, -8], [4.0, 0, -8],
  [-3.5, 0, -2], [-1.0, 0, -2], [1.5, 0, -2], [4.0, 0, -2],
]

const SPEED = 5.5
const CAM_DIST = 5
const CAM_HEIGHT = 2.8
const BOUNDS = { x: 7.5, zMin: -11.5, zMax: 11.5 }
const INTERACT_DIST = 2.6

function lerp(a, b, t) { return a + (b - a) * t }

export default function Player() {
  const groupRef = useRef()
  const keys = useKeys()
  const { camera } = useThree()
  const setNearbyGame = useStore(s => s.setNearbyGame)
  const selectGame    = useStore(s => s.selectGame)
  const closeShop     = useStore(s => s.closeShop)
  const shopOpen      = useStore(s => s.shopOpen)
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
      if (e.code === 'KeyE') {
        const ng = useStore.getState().nearbyGame
        if (ng) selectGame(ng)
      }
      if (e.code === 'Escape') {
        closeShop()
        document.exitPointerLock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectGame, closeShop])

  useFrame((_, delta) => {
    if (!groupRef.current || shopOpen) return
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

    // Proximity
    let closest = null, closestDist = INTERACT_DIST
    POSITIONS.forEach(([px, , pz], i) => {
      const d = Math.sqrt((pos.x - px) ** 2 + (pos.z - pz) ** 2)
      if (d < closestDist) { closestDist = d; closest = GAMES[i] }
    })
    setNearbyGame(closest)
  })

  return (
    <group ref={groupRef} position={[0, 0, 10]}>
      {/* Sneakers */}
      <mesh position={[-0.13, 0.08, 0.04]}><boxGeometry args={[0.18, 0.1, 0.28]} /><meshStandardMaterial color="#222" roughness={0.8} /></mesh>
      <mesh position={[0.13, 0.08, 0.04]}><boxGeometry args={[0.18, 0.1, 0.28]} /><meshStandardMaterial color="#222" roughness={0.8} /></mesh>
      {/* Sole neon */}
      <mesh position={[-0.13, 0.03, 0.04]}><boxGeometry args={[0.17, 0.02, 0.27]} /><meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={3} /></mesh>
      <mesh position={[0.13, 0.03, 0.04]}><boxGeometry args={[0.17, 0.02, 0.27]} /><meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={3} /></mesh>
      {/* Jeans */}
      <mesh position={[-0.13, 0.5, 0]}><boxGeometry args={[0.19, 0.75, 0.19]} /><meshStandardMaterial color="#1a2a4a" roughness={0.9} /></mesh>
      <mesh position={[0.13, 0.5, 0]}><boxGeometry args={[0.19, 0.75, 0.19]} /><meshStandardMaterial color="#1a2a4a" roughness={0.9} /></mesh>
      {/* Hoodie body */}
      <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.54, 0.72, 0.28]} /><meshStandardMaterial color="#1a1a2e" roughness={0.85} /></mesh>
      {/* Hoodie logo strip */}
      <mesh position={[0, 1.05, 0.145]}><boxGeometry args={[0.35, 0.08, 0.01]} /><meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2} /></mesh>
      {/* Arms */}
      <mesh position={[-0.36, 1.0, 0]}><boxGeometry args={[0.17, 0.62, 0.17]} /><meshStandardMaterial color="#1a1a2e" roughness={0.85} /></mesh>
      <mesh position={[0.36, 1.0, 0]}><boxGeometry args={[0.17, 0.62, 0.17]} /><meshStandardMaterial color="#1a1a2e" roughness={0.85} /></mesh>
      {/* Head */}
      <mesh position={[0, 1.55, 0]}><boxGeometry args={[0.3, 0.3, 0.28]} /><meshStandardMaterial color="#d4906a" roughness={0.8} /></mesh>
      {/* Cap */}
      <mesh position={[0, 1.73, 0]}><boxGeometry args={[0.34, 0.04, 0.3]} /><meshStandardMaterial color="#111" roughness={0.9} /></mesh>
      <mesh position={[0, 1.83, -0.02]}><boxGeometry args={[0.28, 0.2, 0.26]} /><meshStandardMaterial color="#111" roughness={0.9} /></mesh>
      {/* Cap brim */}
      <mesh position={[0, 1.73, 0.2]}><boxGeometry args={[0.28, 0.03, 0.12]} /><meshStandardMaterial color="#111" roughness={0.9} /></mesh>
    </group>
  )
}
