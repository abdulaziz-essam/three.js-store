import { useState } from 'react'
import { useStore } from './useStore'
import { GAMES } from '../data/games'

const ALL_GENRES = [...new Set(GAMES.map((g) => g.genre))]

export function useSelectionScreen() {
  const setPreference = useStore((s) => s.setPreference)
  const [device, setDevice] = useState(null)
  const [genre, setGenre] = useState(null)

  const availableGenres = device
    ? ALL_GENRES.filter((g) =>
        GAMES.some((game) => game.genre === g && game.platform.includes(device))
      )
    : ALL_GENRES

  const matchCount =
    device && genre
      ? GAMES.filter((g) => g.platform.includes(device) && g.genre === genre).length
      : null

  function selectDevice(id) {
    setDevice(id)
    setGenre(null)
  }

  function handleEnter() {
    if (!device || !genre) return
    setPreference(device, genre)
  }

  const canEnter = Boolean(device && genre && matchCount > 0)

  return {
    device,
    genre,
    setGenre,
    selectDevice,
    availableGenres,
    ALL_GENRES,
    matchCount,
    handleEnter,
    canEnter,
  }
}
