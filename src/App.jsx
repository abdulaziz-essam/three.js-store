import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Scene from './components/World/Scene'
import HUD from './components/UI/HUD'
import ShopModal from './components/UI/ShopModal'
import './App.css'

export default function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 3, 13], fov: 65 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Scene />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
            intensity={1.8}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.12} darkness={0.95} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <ShopModal />
    </>
  )
}
