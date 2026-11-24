import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../hooks/useStore'
import { useUpNext } from '../../hooks/useUpNext'
import { trailerThumbUrl } from '../World/TrailerTVs'

/** YouTube-style controls shown while sitting in the Play Zone. */
export default function WatchPanel() {
  const { watching, watchGame, standUp, selectGame } = useStore(useShallow(s => ({
    watching:   s.watching,
    watchGame:  s.watchGame,
    standUp:    s.standUp,
    selectGame: s.selectGame,
  })))

  const { current, upNext } = useUpNext(watching?.gameId ?? '')

  if (!watching) return null

  return (
    <div className="watch-ui">
      <div className="watch-info">
        <div className="watch-now">▶ NOW PLAYING ON TV</div>
        <h2 className="watch-title">{current.title} — Official Trailer</h2>
        <div className="watch-meta">Pixel Vault · {current.genre} · ★ {current.rating}</div>
        <div className="watch-actions">
          <button className="watch-btn primary" onClick={() => selectGame(current)}>
            Get it · ${current.price}
          </button>
          <button className="watch-btn" onClick={standUp}>Stand up <kbd>E</kbd></button>
        </div>
      </div>

      <aside className="watch-next" aria-label="Up next">
        <div className="watch-next-title">Up next</div>
        <ul>
          {upNext.map(game => (
            <li key={game.id}>
              <button className="watch-item" onClick={() => watchGame(game.id)}>
                <img src={trailerThumbUrl(game.trailer)} alt="" loading="lazy" />
                <span className="watch-item-text">
                  <span className="watch-item-title">{game.title}</span>
                  <span className="watch-item-sub">Official trailer · {game.genre}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
