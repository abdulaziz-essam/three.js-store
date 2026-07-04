import { Sparkles, Environment } from '@react-three/drei'
import Building from './Building'
import ShopFloor from '../Shop/ShopFloor'
import Player from '../Character/Player'

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#06060f', 0.04]} />
      <Environment preset="night" background={false} />
      <ambientLight intensity={0.1} color="#0a0a1a" />
      <hemisphereLight skyColor="#0a0a2a" groundColor="#000000" intensity={0.2} />

      {/* Global floating particles */}
      <Sparkles count={180} scale={[16, 4, 24]} size={1.2} speed={0.06} opacity={0.25} color="#00eeff" position={[0, 2, 0]} />
      <Sparkles count={80}  scale={[16, 4, 24]} size={1.0} speed={0.04} opacity={0.2}  color="#ff00aa" position={[0, 2, 0]} />

      <Building />
      <ShopFloor />
      <Player />
    </>
  )
}
