import { Environment } from '@react-three/drei'
import Building from './Building'
import ShopFloor from '../Shop/ShopFloor'
import Player from '../Character/Player'

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#0e0e18', 0.025]} />
      <Environment preset="warehouse" background={false} />
      <ambientLight intensity={0.55} color="#d0d8ff" />
      <hemisphereLight skyColor="#c0c8ff" groundColor="#1a1008" intensity={0.4} />

      <Building />
      <ShopFloor />
      <Player />
    </>
  )
}
