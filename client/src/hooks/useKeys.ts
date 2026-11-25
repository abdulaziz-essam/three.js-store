import { useEffect, useRef } from 'react'

export function useKeys() {
  const keys = useRef<Record<string, boolean>>({})
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true }
    const up   = (e: KeyboardEvent) => { keys.current[e.code] = false }
    const releaseAll = () => { keys.current = {} }
    const onVisibility = () => { if (document.hidden) releaseAll() }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', releaseAll)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', releaseAll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  return keys
}

export function getDirectionInput(keys: Record<string, boolean>) {
  return {
    up:    keys['KeyW'] || keys['ArrowUp'],
    down:  keys['KeyS'] || keys['ArrowDown'],
    left:  keys['KeyA'] || keys['ArrowLeft'],
    right: keys['KeyD'] || keys['ArrowRight'],
  }
}
