import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import Building from './Building'
import ShopFloor from '../Shop/ShopFloor'
import Player from '../Character/Player'
import { useStore } from '../../hooks/useStore'

// Intro: camera starts at entrance, sweeps forward toward shelves, then hands off to player
const INTRO_DURATION = 3.5 // seconds

// camera keyframes: [position, lookAt]
const INTRO_START_POS  = new THREE.Vector3(0, 2.2, 12)
const INTRO_END_POS    = new THREE.Vector3(-6, 2.0, -4)   // zoomed toward left shelf
const INTRO_START_LOOK = new THREE.Vector3(0, 1.5, 8)
const INTRO_END_LOOK   = new THREE.Vector3(-7.5, 1.2, -7) // looking at shelf games

function IntroCamera() {
  const { camera } = useThree()
  const elapsed = useRef(0)
  const introComplete = useStore(s => s.introComplete)
  const completeIntro = useStore(s => s.completeIntro)

  useFrame((_, delta) => {
    if (introComplete) return

    elapsed.current += delta
    const t = Math.min(elapsed.current / INTRO_DURATION, 1)
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    camera.position.lerpVectors(INTRO_START_POS, INTRO_END_POS, e)
    const lookAt = new THREE.Vector3().lerpVectors(INTRO_START_LOOK, INTRO_END_LOOK, e)
    camera.lookAt(lookAt)

    if (t >= 1) completeIntro()
  })

  // Skip on any key or click
  useEffect(() => {
    const skip = () => { if (!useStore.getState().introComplete) completeIntro() }
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('click',   skip, { once: true })
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('click',   skip)
    }
  }, [])

  return null
}

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#0e0e18', 0.025]} />
      <Environment preset="warehouse" background={false} />
      <ambientLight intensity={0.55} color="#d0d8ff" />
      <hemisphereLight skyColor="#c0c8ff" groundColor="#1a1008" intensity={0.4} />

<IntroCamera />
      <Building />
      <ShopFloor />
      <Player />
    </>
  )
}
