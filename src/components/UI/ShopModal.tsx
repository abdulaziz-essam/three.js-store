import { useStore } from '../../hooks/useStore'

export default function ShopModal() {
  const { shopOpen, selected, closeShop, addToCart, owned, balance, cart } = useStore()
  if (!shopOpen || !selected) return null

  const game = selected
  const isOwned = owned.has(game.id)
  const inCart = cart.some(g => g.id === game.id)

  return (
    <div className="modal-overlay" onClick={closeShop}>
      <div className="modal" style={{ '--game-color': game.color, '--game-accent': game.accent } as React.CSSProperties} onClick={e => e.stopPropagation()}>
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
                (img.nextSibling as HTMLElement | null)?.style && ((img.nextSibling as HTMLElement).style.display = 'flex')
              }}
            />
            <div className="modal-cover-fallback" style={{ background: `linear-gradient(135deg, ${game.accent}, ${game.color})` }}>
              <span>{game.title}</span>
            </div>
          </div>

          {/* Info */}
          <div className="modal-info">
            {game.tag && <div className="modal-tag" style={{ background: game.color, color: '#000' }}>{game.tag}</div>}
            <h2 className="modal-title" style={{ color: game.color, textShadow: `0 0 20px ${game.color}` }}>{game.title}</h2>
            <div className="modal-genre">{game.genre}</div>

            <div className="modal-rating">
              {'★'.repeat(Math.floor(game.rating))}{'☆'.repeat(5 - Math.floor(game.rating))}
              <span> {game.rating}/5</span>
            </div>

            <div className="modal-divider" style={{ background: `linear-gradient(to right, ${game.color}, transparent)` }} />

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
