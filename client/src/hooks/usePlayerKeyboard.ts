import { useEffect } from 'react'
import * as THREE from 'three'
import { useStore } from './useStore'
import { TVS } from '../data/storeLayout'
import type { Seat } from '../data/storeLayout'
import { SEATED_FACE_ROTATION } from '../components/Character/playerConstants'

interface UsePlayerKeyboardOptions {
  /** Ref to the player group so getUp() can reposition it */
  groupRef: React.RefObject<THREE.Group | null>
  /** Ref to camera yaw so getUp() resets it */
  camYawRef: React.MutableRefObject<number>
  /** Ref to current velocity so sitDown() can zero it */
  velocityRef: React.MutableRefObject<THREE.Vector3>
}

/**
 * Handles all keyboard interactions for the player:
 * Escape, E (interact), F (filter toggle).
 * Depends on stable store action refs — none of them change identity.
 */
export function usePlayerKeyboard({
  groupRef,
  camYawRef,
  velocityRef,
}: UsePlayerKeyboardOptions) {
  const selectGame    = useStore(s => s.selectGame)
  const closeShop     = useStore(s => s.closeShop)
  const openCheckout  = useStore(s => s.openCheckout)
  const closeCheckout = useStore(s => s.closeCheckout)
  const openFilter    = useStore(s => s.openFilter)
  const closeFilter   = useStore(s => s.closeFilter)
  const focusShelf    = useStore(s => s.focusShelf)
  const unfocusShelf  = useStore(s => s.unfocusShelf)
  const sitAt         = useStore(s => s.sitAt)
  const standUp       = useStore(s => s.standUp)

  useEffect(() => {
    const sitDown = (seat: Seat) => {
      const tv = TVS.find(t => t.id === seat.tv) ?? TVS[0]
      velocityRef.current.set(0, 0, 0)
      sitAt(seat, tv.defaultGame)
      document.exitPointerLock()
    }

    const getUp = () => {
      const seat = useStore.getState().watching?.seat
      standUp()
      if (seat && groupRef.current) {
        groupRef.current.position.set(...seat.standPos)
        groupRef.current.rotation.y = SEATED_FACE_ROTATION
        camYawRef.current = 0
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (useStore.getState().watching)    { getUp(); return }
        if (useStore.getState().shelfFocus)  { unfocusShelf(); return }
        closeShop(); closeCheckout(); closeFilter()
        document.exitPointerLock()
        return
      }

      if (e.code === 'KeyF') {
        useStore.getState().filterOpen ? closeFilter() : openFilter()
        return
      }

      if (e.code === 'KeyE') {
        const { nearbyGame, nearbyCounter, nearbyShelf, nearbySeat,
                shelfFocus: isShelfFocused, watching: isWatching, cart } = useStore.getState()
        if (isWatching)                           { getUp(); return }
        if (isShelfFocused)                       { unfocusShelf(); return }
        if (nearbySeat)                           { sitDown(nearbySeat); return }
        if (nearbyShelf)                          { focusShelf(nearbyShelf); document.exitPointerLock(); return }
        if (nearbyCounter && cart.length > 0)     { openCheckout(); return }
        if (nearbyGame)                           { selectGame(nearbyGame) }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    selectGame, closeShop, openCheckout, closeCheckout,
    openFilter, closeFilter, focusShelf, unfocusShelf, sitAt, standUp,
    groupRef, camYawRef, velocityRef,
  ])
}
