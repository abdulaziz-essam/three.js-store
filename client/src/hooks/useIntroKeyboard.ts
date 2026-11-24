import { useEffect } from 'react'

interface UseIntroKeyboardOptions {
  onNext: () => void
  onSkip: () => void
}

/**
 * Keyboard handler for the intro overlay:
 * any key advances to the next step; Escape skips the whole intro.
 */
export function useIntroKeyboard({ onNext, onSkip }: UseIntroKeyboardOptions) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
      else onNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onNext, onSkip])
}
