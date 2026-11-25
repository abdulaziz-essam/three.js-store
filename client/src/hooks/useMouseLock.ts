import { useEffect } from 'react'
import { CAM_SENSITIVITY } from '../components/Character/playerConstants'

interface UseMouseLockOptions {
  /** Yaw ref to mutate on mouse move */
  camYawRef: React.MutableRefObject<number>
  /** Pointer lock is suppressed while any of these are true */
  locked: boolean
}

/**
 * Manages pointer lock and camera yaw updates from mouse movement.
 * Clicking the canvas requests pointer lock unless a UI overlay is open.
 */
export function useMouseLock({ camYawRef, locked }: UseMouseLockOptions) {
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // Without pointer lock the mouse is being used for the UI (buttons, panels):
      // turning the camera then would silently change which way W/A/S/D go.
      if (!locked && document.pointerLockElement) camYawRef.current -= e.movementX * CAM_SENSITIVITY
    }
    const onBodyClick = () => {
      // While watching a trailer the YouTube player needs normal mouse events
      if (!locked) document.body.requestPointerLock()
    }
    document.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('click', onBodyClick)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.body.removeEventListener('click', onBodyClick)
    }
  }, [camYawRef, locked])
}
