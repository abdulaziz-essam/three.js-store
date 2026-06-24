import { Sparkles, Stars } from '@react-three/drei'
import Building from './Building'
import ShopFloor from '../Shop/ShopFloor'
import Player from '../Character/Player'
import ShopCounter from '../Shop/ShopCounter'
import EntranceLightBeam from './EntranceLightBeam'
import CeilingFan from './CeilingFan'

export default function Scene() {
  return (
    <>
      {/* Atmospheric fog */}
      <fog attach="fog" args={['#05030f', 0.035]} />

      {/* Ambient - very dark, warm */}
      <ambientLight intensity={0.12} color="#1a1008" />
      <hemisphereLight skyColor="#1a1008" groundColor="#000000" intensity={0.25} />

      {/* Warm back fill for counter area */}
      <pointLight position={[0, 4, -11]} color="#ffcc44" intensity={2.5} distance={10} />
      {/* Entrance fill */}
      <pointLight position={[0, 3, 9]} color="#ffaa22" intensity={1.5} distance={8} />
      {/* Center fill */}
      <pointLight position={[0, 4.5, -2]} color="#ffcc44" intensity={1.0} distance={14} />

      {/* Stars visible through windows */}
      <Stars radius={40} depth={30} count={4000} factor={2} saturation={0.2} fade />

      {/* Global golden dust motes */}
      <Sparkles
        count={220}
        scale={[13, 5, 22]}
        size={1.4}
        speed={0.08}
        opacity={0.35}
        color="#ffcc44"
        position={[0, 2, -2]}
      />

      <Building />
      <ShopFloor />
      <ShopCounter />
      <EntranceLightBeam />
      <CeilingFan position={[0, 5.3, -5]} speed={0.12} />
      <CeilingFan position={[0, 5.3, 3]} speed={-0.09} />
      <Player />
    </>
  )
}
