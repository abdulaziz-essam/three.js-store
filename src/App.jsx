import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import Scene from './components/World/Scene'
import HUD from './components/UI/HUD'
import ShopModal from './components/UI/ShopModal'
import CheckoutModal from './components/UI/CheckoutModal'
import FilterPanel from './components/UI/FilterPanel'
import './App.css'

export default function App() {
  return (
    <>
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 3, 13], fov: 65 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Scene />
        <EffectComposer>
          <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.6} intensity={0.8} mipmapBlur />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0004, 0.0004]} />
          <Vignette eskil={false} offset={0.3} darkness={0.55} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <FilterPanel />
      <ShopModal />
      <CheckoutModal />
    </>
  )
}
