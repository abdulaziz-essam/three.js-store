import { Environment, Lightformer } from '@react-three/drei'
import Building from './Building'
import ShopFloor from '../Shop/ShopFloor'
import Player from '../Character/Player'
import TrailerTVs from './TrailerTVs'

const FOG_COLOR   = '#1c1a18'
const FOG_DENSITY = 0.018

const AMBIENT_COLOR     = '#fff4e6'
const AMBIENT_INTENSITY = 0.9

// Hemisphere light: sky color, ground color, intensity
const HEMI_SKY_COLOR    = '#fff1de'
const HEMI_GROUND_COLOR = '#2a2218'
const HEMI_INTENSITY    = 0.6

// Environment lightformers (ceiling, back wall, front wall)
const ENV_CEILING_COLOR     = '#fff1de'
const ENV_CEILING_INTENSITY = 2
const ENV_WALL_COLOR        = '#d9a066'
const ENV_WALL_INTENSITY    = 0.6

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
      {/* Reflections/ambient from a tiny environment built once in code:
          no HDR download at startup, rendered only a single frame. */}
      <Environment resolution={64} frames={1} background={false}>
        <Lightformer
          form="rect"
          intensity={ENV_CEILING_INTENSITY}
          color={ENV_CEILING_COLOR}
          position={[0, 5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[18, 26, 1]}
        />
        <Lightformer form="rect" intensity={ENV_WALL_INTENSITY} color={ENV_WALL_COLOR}    position={[0, 2, -13]} scale={[18, 4, 1]} />
        <Lightformer form="rect" intensity={ENV_WALL_INTENSITY} color={ENV_CEILING_COLOR} position={[0, 2,  13]} rotation={[0, Math.PI, 0]} scale={[18, 4, 1]} />
      </Environment>
      <ambientLight intensity={AMBIENT_INTENSITY} color={AMBIENT_COLOR} />
      <hemisphereLight args={[HEMI_SKY_COLOR, HEMI_GROUND_COLOR, HEMI_INTENSITY]} />

      <Building />
      <ShopFloor />
      <TrailerTVs />
      <Player />
    </>
  )
}
