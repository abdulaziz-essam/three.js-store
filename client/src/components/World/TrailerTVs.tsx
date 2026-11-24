import { Component, Suspense, type ReactNode } from 'react'
import { Html, Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { GAMES } from '../../data/games'
import { TVS, type TV } from '../../data/storeLayout'
import { useStore } from '../../hooks/useStore'

// Drei's <Html transform> renders 400 CSS px per world unit at distanceFactor = 1.
const PX_PER_UNIT = 400

export const trailerEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
export const trailerThumbUrl = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`

class IgnoreErrors extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

/** Idle TV: the trailer's YouTube thumbnail, dimmed, with a hint to sit down. */
function Thumbnail({ tv, videoId }: { tv: TV; videoId: string }) {
  const tex = useTexture(trailerThumbUrl(videoId))
  tex.colorSpace = THREE.SRGBColorSpace
  return (
    <mesh position={tv.screen}>
      <planeGeometry args={[tv.width, tv.height]} />
      <meshBasicMaterial map={tex} color="#9a9a9a" toneMapped={false} />
    </mesh>
  )
}

function IdleTV({ tv }: { tv: TV }) {
  const game = GAMES.find(g => g.id === tv.defaultGame) ?? GAMES[0]
  const [x, y, z] = tv.screen
  return (
    <group>
      <IgnoreErrors>
        <Suspense fallback={null}>
          <Thumbnail tv={tv} videoId={game.trailer} />
        </Suspense>
      </IgnoreErrors>
      {/* play badge + hint */}
      <mesh position={[x, y, z + 0.01]}>
        <circleGeometry args={[tv.height * 0.13, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} />
      </mesh>
      <Text position={[x + tv.height * 0.015, y, z + 0.02]} fontSize={tv.height * 0.12} color="#f2ece2" anchorX="center" anchorY="middle">
        ▶
      </Text>
      <Text position={[x, y - tv.height / 2 - 0.16, z]} fontSize={0.1} letterSpacing={0.08} color="#d9a066" anchorX="center" anchorY="middle">
        SIT DOWN TO WATCH TRAILERS
      </Text>
    </group>
  )
}

/** Live TV: the real YouTube player, fitted exactly onto the screen. */
function LiveTV({ tv, videoId }: { tv: TV; videoId: string }) {
  const w = Math.round(tv.width * PX_PER_UNIT)
  const h = Math.round(tv.height * PX_PER_UNIT)
  return (
    <Html transform position={tv.screen} distanceFactor={1} zIndexRange={[10, 0]}>
      <iframe
        key={videoId}
        title="Game trailer"
        src={trailerEmbedUrl(videoId)}
        width={w}
        height={h}
        style={{ border: 0, display: 'block', background: '#000' }}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </Html>
  )
}

export default function TrailerTVs() {
  const watching = useStore(s => s.watching)
  return (
    <group>
      {TVS.map(tv => {
        if (watching?.seat.tv === tv.id) {
          const game = GAMES.find(g => g.id === watching.gameId)
          if (game) return <LiveTV key={tv.id} tv={tv} videoId={game.trailer} />
        }
        return <IdleTV key={tv.id} tv={tv} />
      })}
    </group>
  )
}
