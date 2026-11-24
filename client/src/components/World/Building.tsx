import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { BUILDING, STORE_MODEL_URL, COUNTER_POS, CONSOLE_KIOSKS } from '../../data/storeLayout'
import { useScreenFlicker } from '../../hooks/useScreenFlicker'
import { useFloorTexture } from '../../hooks/useFloorTexture'

// The store (walls, ceiling, shelves, signs, checkout, consoles, play zone) is modelled
// in blender/pixel_vault_store.blend and exported to STORE_MODEL_URL.
// Interactive game pedestals live in ShopFloor; lights and the reflective floor live here.

const LIGHT_COLOR = '#fff5e0'

const CEILING_LIGHT_INTENSITY = 10
const CEILING_LIGHT_DISTANCE  = 16
const CEILING_FLICKER_SPEED   = 0.3
const CEILING_FLICKER_AMPLITUDE = 0.2

type LightDef = { pos: [number, number, number]; color: string; intensity: number; distance: number }

// Performance: a few wide lights rather than one per fixture.
// Emissive tubes/screens still look lit and feed the bloom.
const CEILING_LIGHTS: LightDef[] = [12, 4, -4, -12].flatMap(z =>
  [-6, 6].map(x => ({
    pos: [x, BUILDING.height - 0.5, z] as [number, number, number],
    color: LIGHT_COLOR,
    intensity: CEILING_LIGHT_INTENSITY,
    distance: CEILING_LIGHT_DISTANCE,
  })),
)

const ACCENT_LIGHTS: LightDef[] = [
  { pos: [0, 3.8, -14.6],                                      color: LIGHT_COLOR, intensity: 5, distance: 10 }, // play zone
  { pos: [COUNTER_POS[0] - 1, 3.0, COUNTER_POS[2]],           color: LIGHT_COLOR, intensity: 3, distance: 7  }, // checkout
  { pos: [CONSOLE_KIOSKS[0].pos[0] + 1.2, 2.8, 11.1],         color: LIGHT_COLOR, intensity: 4, distance: 8  }, // consoles
]

function StoreModel() {
  const { scene } = useGLTF(STORE_MODEL_URL)
  useScreenFlicker(scene)
  return <primitive object={scene} />
}

function ReflectiveFloor() {
  const floorTextures = useFloorTexture()
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[BUILDING.width, BUILDING.depth]} />
      <MeshReflectorMaterial
        blur={[200, 60]}
        resolution={512}
        mixBlur={0.6}
        mixStrength={6}
        roughness={0.35}
        depthScale={1.0}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#3a3632"
        metalness={0.2}
        map={floorTextures.map}
        normalMap={floorTextures.normalMap}
        roughnessMap={floorTextures.roughnessMap}
      />
    </mesh>
  )
}

function CeilingLights() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    groupRef.current?.children.forEach((light, index) => {
      const elapsed = clock.getElapsedTime()
      ;(light as THREE.PointLight).intensity =
        CEILING_LIGHT_INTENSITY + Math.sin(elapsed * CEILING_FLICKER_SPEED + index) * CEILING_FLICKER_AMPLITUDE
    })
  })
  return (
    <group ref={groupRef}>
      {CEILING_LIGHTS.map((light, index) => (
        <pointLight
          key={index}
          position={light.pos}
          color={light.color}
          intensity={light.intensity}
          distance={light.distance}
        />
      ))}
    </group>
  )
}

export default function Building() {
  return (
    <group>
      <ReflectiveFloor />
      <StoreModel />
      <CeilingLights />
      {ACCENT_LIGHTS.map((light, index) => (
        <pointLight
          key={index}
          position={light.pos}
          color={light.color}
          intensity={light.intensity}
          distance={light.distance}
        />
      ))}
    </group>
  )
}

useGLTF.preload(STORE_MODEL_URL)
