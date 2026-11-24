import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useFilterKeyboard } from '../../hooks/useFilterKeyboard'
import { GAMES } from '../../data/games'
import { DEVICES } from '../../data/devices'

const ALL_GENRES = [...new Set(GAMES.map(g => g.genre))]

type FilterRow = 'device' | 'genre'

function FilterChip({ label, icon, active, selected }: {
  label: string
  icon?: string
  active: boolean
  selected: boolean
}) {
  return (
    <div className={`filter-chip ${selected ? 'selected' : ''} ${active ? 'active' : ''}`}>
      {icon && <span className="filter-chip-icon">{icon}</span>}
      <span>{label}</span>
    </div>
  )
}

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
    if (!filterOpen) return
    setDeviceIndex(Math.max(0, DEVICES.findIndex(d => d.id === selectedPlatform)))
    setGenreIndex(selectedGenre ? Math.max(0, ALL_GENRES.indexOf(selectedGenre)) : 0)
    setFocusedRow('device')
  }, [filterOpen, selectedPlatform, selectedGenre])

  const toggleRow = useCallback(
    () => setFocusedRow(r => r === 'device' ? 'genre' : 'device'),
    []
  )
  const confirm = useCallback(
    () => setFilter(DEVICES[deviceIndex].id, ALL_GENRES[genreIndex]),
    [deviceIndex, genreIndex, setFilter]
  )

  useFilterKeyboard({
    active:        filterOpen,
    focusedRow,
    genreCount:    ALL_GENRES.length,
    onDeviceIndex: setDeviceIndex,
    onGenreIndex:  setGenreIndex,
    onRowToggle:   toggleRow,
    onConfirm:     confirm,
    onClose:       closeFilter,
  })

  if (!filterOpen) return null

  const matchCount = GAMES.filter(
    g => g.platform.includes(DEVICES[deviceIndex].id) && g.genre === ALL_GENRES[genreIndex]
  ).length

  return (
    <div className="filter-overlay">
      <div className="filter-panel">
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="filter-eyebrow">[ F ] FILTER GAMES</div>
        <h2 className="filter-title">CHOOSE YOUR SETUP</h2>

        <div className={`filter-section ${focusedRow === 'device' ? 'focused' : ''}`}>
          <div className="filter-label">{focusedRow === 'device' ? '▶ ' : '  '}PLATFORM</div>
          <div className="filter-row">
            {DEVICES.map((device, index) => (
              <FilterChip
                key={device.id}
                label={device.label}
                icon={device.icon}
                active={index === deviceIndex}
                selected={index === deviceIndex && focusedRow === 'device'}
              />
            ))}
          </div>
        </div>

        <div className={`filter-section ${focusedRow === 'genre' ? 'focused' : ''}`}>
          <div className="filter-label">{focusedRow === 'genre' ? '▶ ' : '  '}GENRE</div>
          <div className="filter-row genre-row">
            {ALL_GENRES.map((genre, index) => (
              <FilterChip
                key={genre}
                label={genre}
                active={index === genreIndex}
                selected={index === genreIndex && focusedRow === 'genre'}
              />
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
