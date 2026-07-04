import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import Scene from './components/World/Scene'
import HUD from './components/UI/HUD'
import ShopModal from './components/UI/ShopModal'
import SelectionScreen from './components/UI/SelectionScreen'
import { useStore } from './hooks/useStore'
import './App.css'

export default function App() {
  const setupComplete = useStore((s) => s.setupComplete)

  if (!setupComplete) return <SelectionScreen />

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
          <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.85} intensity={2.5} mipmapBlur />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <ShopModal />
    </>
  )
}
