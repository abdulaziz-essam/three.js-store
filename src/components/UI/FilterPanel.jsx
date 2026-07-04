import { useEffect, useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { GAMES } from '../../data/games'
import { DEVICES } from '../../data/devices'

const ALL_GENRES = [...new Set(GAMES.map(g => g.genre))]

export default function FilterPanel() {
  const { filterOpen, closeFilter, setFilter, selectedPlatform, selectedGenre } = useStore()

  const [devIdx, setDevIdx]   = useState(() => Math.max(0, DEVICES.findIndex(d => d.id === selectedPlatform)))
  const [genIdx, setGenIdx]   = useState(() => Math.max(0, ALL_GENRES.indexOf(selectedGenre)))
  const [focus, setFocus]     = useState('device') // 'device' | 'genre'

  // sync indices when panel opens
  useEffect(() => {
    if (filterOpen) {
      setDevIdx(Math.max(0, DEVICES.findIndex(d => d.id === selectedPlatform)))
      setGenIdx(selectedGenre ? Math.max(0, ALL_GENRES.indexOf(selectedGenre)) : 0)
      setFocus('device')
    }
  }, [filterOpen])

  useEffect(() => {
    if (!filterOpen) return
    const onKey = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        const dir = e.code === 'ArrowRight' ? 1 : -1
        if (focus === 'device') {
          setDevIdx(i => (i + dir + DEVICES.length) % DEVICES.length)
        } else {
          setGenIdx(i => (i + dir + ALL_GENRES.length) % ALL_GENRES.length)
        }
      }
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        setFocus(f => f === 'device' ? 'genre' : 'device')
        e.preventDefault()
      }
      if (e.code === 'Enter') {
        const device = DEVICES[devIdx].id
        const genre  = ALL_GENRES[genIdx]
        setFilter(device, genre)
      }
      if (e.code === 'Escape' || e.code === 'KeyF') {
        closeFilter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filterOpen, focus, devIdx, genIdx, setFilter, closeFilter])

  if (!filterOpen) return null

  const matchCount = GAMES.filter(
    g => g.platform.includes(DEVICES[devIdx].id) && g.genre === ALL_GENRES[genIdx]
  ).length

  return (
    <div className="filter-overlay">
      <div className="filter-panel">
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="filter-eyebrow">[ F ] FILTER GAMES</div>
        <h2 className="filter-title">CHOOSE YOUR SETUP</h2>

        {/* Device row */}
        <div className={`filter-section ${focus === 'device' ? 'focused' : ''}`}>
          <div className="filter-label">
            {focus === 'device' ? '▶ ' : '  '}PLATFORM
          </div>
          <div className="filter-row">
            {DEVICES.map((d, i) => (
              <div
                key={d.id}
                className={`filter-chip ${i === devIdx && focus === 'device' ? 'selected' : ''} ${i === devIdx ? 'active' : ''}`}
              >
                <span className="filter-chip-icon">{d.icon}</span>
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Genre row */}
        <div className={`filter-section ${focus === 'genre' ? 'focused' : ''}`}>
          <div className="filter-label">
            {focus === 'genre' ? '▶ ' : '  '}GENRE
          </div>
          <div className="filter-row genre-row">
            {ALL_GENRES.map((g, i) => (
              <div
                key={g}
                className={`filter-chip ${i === genIdx && focus === 'genre' ? 'selected' : ''} ${i === genIdx ? 'active' : ''}`}
              >
                {g}
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
