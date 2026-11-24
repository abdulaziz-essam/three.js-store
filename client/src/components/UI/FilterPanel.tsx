import { useEffect, useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { useShallow } from 'zustand/react/shallow'
import { GAMES } from '../../data/games'
import { DEVICES } from '../../data/devices'

const ALL_GENRES = [...new Set(GAMES.map(g => g.genre))]

type FilterRow = 'device' | 'genre'

export default function FilterPanel() {
  const {
    filterOpen, closeFilter, setFilter,
    selectedPlatform, selectedGenre,
  } = useStore(useShallow(s => ({
    filterOpen:       s.filterOpen,
    closeFilter:      s.closeFilter,
    setFilter:        s.setFilter,
    selectedPlatform: s.selectedPlatform,
    selectedGenre:    s.selectedGenre,
  })))

  const [deviceIndex, setDeviceIndex] = useState(
    () => Math.max(0, DEVICES.findIndex(d => d.id === selectedPlatform))
  )
  const [genreIndex, setGenreIndex] = useState(
    () => Math.max(0, ALL_GENRES.indexOf(selectedGenre ?? ''))
  )
  const [focusedRow, setFocusedRow] = useState<FilterRow>('device')

  useEffect(() => {
    if (filterOpen) {
      setDeviceIndex(Math.max(0, DEVICES.findIndex(d => d.id === selectedPlatform)))
      setGenreIndex(selectedGenre ? Math.max(0, ALL_GENRES.indexOf(selectedGenre)) : 0)
      setFocusedRow('device')
    }
  }, [filterOpen, selectedPlatform, selectedGenre])

  useEffect(() => {
    if (!filterOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        const direction = e.code === 'ArrowRight' ? 1 : -1
        if (focusedRow === 'device') {
          setDeviceIndex(current => (current + direction + DEVICES.length) % DEVICES.length)
        } else {
          setGenreIndex(current => (current + direction + ALL_GENRES.length) % ALL_GENRES.length)
        }
      }
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        setFocusedRow(current => current === 'device' ? 'genre' : 'device')
        e.preventDefault()
      }
      if (e.code === 'Enter') {
        setFilter(DEVICES[deviceIndex].id, ALL_GENRES[genreIndex])
      }
      if (e.code === 'Escape' || e.code === 'KeyF') {
        closeFilter()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filterOpen, focusedRow, deviceIndex, genreIndex, setFilter, closeFilter])

  if (!filterOpen) return null

  const matchCount = GAMES.filter(
    game => game.platform.includes(DEVICES[deviceIndex].id) && game.genre === ALL_GENRES[genreIndex]
  ).length

  return (
    <div className="filter-overlay">
      <div className="filter-panel">
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="filter-eyebrow">[ F ] FILTER GAMES</div>
        <h2 className="filter-title">CHOOSE YOUR SETUP</h2>

        {/* Device row */}
        <div className={`filter-section ${focusedRow === 'device' ? 'focused' : ''}`}>
          <div className="filter-label">
            {focusedRow === 'device' ? '▶ ' : '  '}PLATFORM
          </div>
          <div className="filter-row">
            {DEVICES.map((device, index) => (
              <div
                key={device.id}
                className={`filter-chip ${index === deviceIndex && focusedRow === 'device' ? 'selected' : ''} ${index === deviceIndex ? 'active' : ''}`}
              >
                <span className="filter-chip-icon">{device.icon}</span>
                <span>{device.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Genre row */}
        <div className={`filter-section ${focusedRow === 'genre' ? 'focused' : ''}`}>
          <div className="filter-label">
            {focusedRow === 'genre' ? '▶ ' : '  '}GENRE
          </div>
          <div className="filter-row genre-row">
            {ALL_GENRES.map((genre, index) => (
              <div
                key={genre}
                className={`filter-chip ${index === genreIndex && focusedRow === 'genre' ? 'selected' : ''} ${index === genreIndex ? 'active' : ''}`}
              >
                {genre}
              </div>
            ))}
          </div>
        </div>

        <div className="filter-divider" />

        <div className="filter-match">
          {matchCount === 0
            ? 'No games match — try another combo'
            : `${matchCount} game${matchCount > 1 ? 's' : ''} available`}
        </div>

        <div className="filter-hints">
          <span>◀ ▶ — Navigate</span>
          <span>▲ ▼ — Switch row</span>
          <span>ENTER — Apply</span>
          <span>F / ESC — Close</span>
        </div>
      </div>
    </div>
  )
}
