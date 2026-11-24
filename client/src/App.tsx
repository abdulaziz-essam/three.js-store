import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import Scene from './components/World/Scene'
import HUD from './components/UI/HUD'
import ShopModal from './components/UI/ShopModal'
import CheckoutModal from './components/UI/CheckoutModal'
import FilterPanel from './components/UI/FilterPanel'
import ShelfModal from './components/UI/ShelfModal'
import WatchPanel from './components/UI/WatchPanel'
import './App.css'

const CANVAS_DPR: [number, number] = [1, 1.5]
const CAMERA_START_POSITION: [number, number, number] = [0, 3, 13]
const CAMERA_FOV = 65

const BLOOM_LUMINANCE_THRESHOLD = 0.85
const BLOOM_LUMINANCE_SMOOTHING = 0.4
const BLOOM_INTENSITY           = 0.35
const VIGNETTE_OFFSET           = 0.35
const VIGNETTE_DARKNESS         = 0.3
const MSAA_SAMPLES              = 4

export default function App() {
  return (
    <>
      <Canvas
        dpr={CANVAS_DPR}
        camera={{ position: CAMERA_START_POSITION, fov: CAMERA_FOV }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Scene />
        <Preload all />
        <EffectComposer multisampling={MSAA_SAMPLES}>
          <Bloom
            luminanceThreshold={BLOOM_LUMINANCE_THRESHOLD}
            luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
            intensity={BLOOM_INTENSITY}
            mipmapBlur
          />
          <Vignette eskil={false} offset={VIGNETTE_OFFSET} darkness={VIGNETTE_DARKNESS} />
        </EffectComposer>
      </Canvas>
      <HUD />
      <FilterPanel />
      <ShelfModal />
      <WatchPanel />
      <ShopModal />
      <CheckoutModal />
    </>
  )
}
