import { useStore } from '../../hooks/useStore'
import { GAMES } from '../../data/games'

const SHELF_GAMES = GAMES.slice(0, 9)

export default function ShelfModal() {
  const { shelfFocus, unfocusShelf, addToCart, owned, cart } = useStore()
  if (!shelfFocus) return null

  return (
    <div className="shelf-overlay">
      <button className="shelf-back" onClick={unfocusShelf}>
        ← BACK
      </button>

      <div className="shelf-panel">
        <div className="shelf-panel-header">
          <span className="shelf-panel-eyebrow">SHELF BROWSE</span>
          <h2 className="shelf-panel-title">PICK A GAME</h2>
          <span className="shelf-panel-hint">Click a game to add to basket</span>
        </div>

        <div className="shelf-games-grid">
          {SHELF_GAMES.map(game => {
            const isOwned = owned.has(game.id)
            const inCart  = cart.some(g => g.id === game.id)
            const disabled = isOwned || inCart

            return (
              <button
                key={game.id}
                className={`shelf-game-card ${disabled ? 'shelf-game-disabled' : ''}`}
                onClick={() => !disabled && addToCart(game)}
                style={{ '--g': game.color } as React.CSSProperties}
              >
                <div className="shelf-game-img-wrap">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="shelf-game-img"
                    onError={e => {
                      const img = e.currentTarget
                      img.style.display = 'none';
                      (img.nextSibling as HTMLElement | null)?.style && ((img.nextSibling as HTMLElement).style.display = 'flex')
                    }}
                  />
                  <div
                    className="shelf-game-fallback"
                    style={{ background: `linear-gradient(135deg, ${game.accent}, ${game.color})` }}
                  >
                    {game.title}
                  </div>
                </div>

                {game.tag && (
                  <div className="shelf-game-tag" style={{ background: game.color }}>
                    {game.tag}
                  </div>
                )}

                <div className="shelf-game-info">
                  <div className="shelf-game-title">{game.title}</div>
                  <div className="shelf-game-genre">{game.genre}</div>
                  <div className="shelf-game-price" style={{ color: game.color }}>${game.price}</div>
                </div>

                <div className="shelf-game-action">
                  {isOwned ? '✓ OWNED' : inCart ? '✓ IN BASKET' : '+ ADD TO BASKET'}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
