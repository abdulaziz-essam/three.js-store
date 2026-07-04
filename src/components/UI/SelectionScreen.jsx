import { DEVICES } from '../../data/devices'
import { useSelectionScreen } from '../../hooks/useSelectionScreen'
import { GAMES } from '../../data/games'
import '../../styles/SelectionScreen.css'

export default function SelectionScreen() {
  const {
    device,
    genre,
    setGenre,
    selectDevice,
    availableGenres,
    ALL_GENRES,
    matchCount,
    handleEnter,
    canEnter,
  } = useSelectionScreen()

  return (
    <div className="sel-overlay">
      <div className="sel-scanlines" />

      <div className="sel-card">
        <div className="sel-corner tl" />
        <div className="sel-corner tr" />
        <div className="sel-corner bl" />
        <div className="sel-corner br" />

        <p className="sel-eyebrow">PIXEL VAULT — SETUP</p>
        <h1 className="sel-title">CHOOSE YOUR SETUP</h1>
        <p className="sel-subtitle">We'll stock the shelves just for you.</p>

        <p className="sel-section-label">SELECT DEVICE</p>
        <div className="sel-device-row">
          {DEVICES.map((d) => {
            const hasGames = GAMES.some((g) => g.platform.includes(d.id))
            return (
              <button
                key={d.id}
                className={`sel-device-btn ${device === d.id ? 'active' : ''} ${!hasGames ? 'disabled' : ''}`}
                onClick={() => hasGames && selectDevice(d.id)}
              >
                <span className="sel-device-icon">{d.icon}</span>
                <span>{d.label}</span>
              </button>
            )
          })}
        </div>

        <p className="sel-section-label">SELECT GENRE</p>
        <div className="sel-genre-row">
          {ALL_GENRES.map((g) => {
            const available = availableGenres.includes(g)
            return (
              <button
                key={g}
                className={`sel-genre-btn ${genre === g ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                onClick={() => available && setGenre(g)}
              >
                {g}
              </button>
            )
          })}
        </div>

        {matchCount !== null && (
          <p className="sel-match-text">
            {matchCount === 0
              ? 'No games match this selection.'
              : `${matchCount} game${matchCount > 1 ? 's' : ''} available in store`}
          </p>
        )}

        <button
          className={`sel-enter-btn ${canEnter ? 'active' : 'inactive'}`}
          onClick={handleEnter}
          disabled={!canEnter}
        >
          ENTER STORE
        </button>
      </div>
    </div>
  )
}
