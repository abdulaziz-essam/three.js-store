import { useEffect } from 'react'
import { DEVICES } from '../data/devices'

type FilterRow = 'device' | 'genre'

interface UseFilterKeyboardOptions {
  active: boolean
  focusedRow: FilterRow
  genreCount: number
  deviceCount?: number
  onDeviceIndex: (updater: (i: number) => number) => void
  onGenreIndex:  (updater: (i: number) => number) => void
  onRowToggle:   () => void
  onConfirm:     () => void
  onClose:       () => void
}

export function useFilterKeyboard({
  active,
  focusedRow,
  genreCount,
  deviceCount = DEVICES.length,
  onDeviceIndex,
  onGenreIndex,
  onRowToggle,
  onConfirm,
  onClose,
}: UseFilterKeyboardOptions) {
  useEffect(() => {
    if (!active) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        const direction = e.code === 'ArrowRight' ? 1 : -1
        if (focusedRow === 'device') {
          onDeviceIndex(i => (i + direction + deviceCount) % deviceCount)
        } else {
          onGenreIndex(i => (i + direction + genreCount) % genreCount)
        }
      }
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        onRowToggle()
        e.preventDefault()
      }
      if (e.code === 'Enter')                            onConfirm()
      if (e.code === 'Escape' || e.code === 'KeyF')      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, focusedRow, deviceCount, genreCount, onDeviceIndex, onGenreIndex, onRowToggle, onConfirm, onClose])
}
