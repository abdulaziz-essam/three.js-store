import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../../hooks/useStore'
import './StopMotion.css'

/** Stop-motion store tour rendered in Blender (blender/stopmotion/). */
export const INTRO_VIDEO_URL = '/intro/aek_store_intro.mp4'

/**
 * Plays the stop-motion tour full-screen when the site opens, while the 3D store
 * loads behind it. Ends (or is skipped) into the main menu.
 */
export default function StopMotionIntro() {
  const completeStory = useStore(s => s.completeStory)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') completeStory()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [completeStory])

  // Muted autoplay is allowed almost everywhere; if a browser still blocks it, ask for a tap
  useEffect(() => {
    videoRef.current?.play()?.catch(() => setNeedsTap(true))
  }, [])

  const startManually = () => {
    setNeedsTap(false)
    videoRef.current?.play()?.catch(completeStory)
  }

  return (
    <div className="sm-root">
      <video
        ref={videoRef}
        className="sm-video"
        src={INTRO_VIDEO_URL}
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={completeStory}
        onError={completeStory}
      />
      {needsTap && (
        <button className="sm-play" onClick={startManually}>▶ PLAY INTRO</button>
      )}
      <button className="sm-skip" onClick={completeStory}>SKIP ›</button>
    </div>
  )
}
