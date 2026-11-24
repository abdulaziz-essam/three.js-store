import { useStore } from '../../hooks/useStore'
import { useShallow } from 'zustand/react/shallow'

const MAX_STAR_RATING = 5
const FILLED_STAR = '★'
const EMPTY_STAR  = '☆'

export default function ShopModal() {
  const {
    shopOpen, selected, closeShop,
    addToCart, owned, balance, cart,
  } = useStore(useShallow(s => ({
    shopOpen:    s.shopOpen,
    selected:    s.selected,
    closeShop:   s.closeShop,
    addToCart:   s.addToCart,
    owned:       s.owned,
    balance:     s.balance,
    cart:        s.cart,
  })))

  if (!shopOpen || !selected) return null

  const game    = selected
  const isOwned = owned.has(game.id)
  const inCart  = cart.some(g => g.id === game.id)

  const filledStars = FILLED_STAR.repeat(Math.floor(game.rating))
  const emptyStars  = EMPTY_STAR.repeat(MAX_STAR_RATING - Math.floor(game.rating))

  return (
    <div className="modal-overlay" onClick={closeShop}>
      <div
        className="modal"
        style={{ '--game-color': game.color, '--game-accent': game.accent } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        {/* Neon corners */}
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="modal-body">
          {/* Cover */}
          <div className="modal-cover-wrap" style={{ borderColor: game.color, boxShadow: `0 0 30px ${game.color}66` }}>
            <img
              src={game.cover}
              alt={game.title}
              className="modal-cover-img"
              onError={e => {
                const img = e.currentTarget
                img.style.display = 'none';
                (img.nextSibling as HTMLElement | null)?.style &&
                  ((img.nextSibling as HTMLElement).style.display = 'flex')
              }}
            />
            <div
              className="modal-cover-fallback"
              style={{ background: `linear-gradient(135deg, ${game.accent}, ${game.color})` }}
            >
              <span>{game.title}</span>
            </div>
          </div>

          {/* Info */}
          <div className="modal-info">
            {game.tag && (
              <div className="modal-tag" style={{ background: game.color, color: '#000' }}>
                {game.tag}
              </div>
            )}
            <h2
              className="modal-title"
              style={{ color: game.color, textShadow: `0 0 20px ${game.color}` }}
            >
              {game.title}
            </h2>
            <div className="modal-genre">{game.genre}</div>

            <div className="modal-rating">
              {filledStars}{emptyStars}
              <span> {game.rating}/{MAX_STAR_RATING}</span>
            </div>

            <div
              className="modal-divider"
              style={{ background: `linear-gradient(to right, ${game.color}, transparent)` }}
            />

            <div className="modal-price-row">
              <span className="modal-price" style={{ color: game.color }}>${game.price}</span>
              <span className="modal-balance">Balance: ${balance.toFixed(2)}</span>
            </div>

            <button
              className={`modal-btn ${isOwned ? 'owned' : inCart ? 'in-cart' : ''}`}
              disabled={isOwned || inCart}
              onClick={() => { addToCart(game); closeShop() }}
            >
              {isOwned ? '✓ IN YOUR LIBRARY' : inCart ? '✓ IN BASKET' : `ADD TO BASKET — $${game.price}`}
            </button>

            {!isOwned && !inCart && (
              <div className="modal-hint">Walk to the counter to pay</div>
            )}
          </div>
        </div>

        <button className="modal-close" onClick={closeShop}>✕</button>
      </div>
    </div>
  )
}
