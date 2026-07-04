import { useStore } from '../../hooks/useStore'

export default function ShopModal() {
  const { shopOpen, selected, closeShop, purchase, owned, balance } = useStore()
  if (!shopOpen || !selected) return null

  const game = selected
  const isOwned = owned.has(game.id)
  const canAfford = balance >= game.price

  return (
    <div className="modal-overlay" onClick={closeShop}>
      <div className="modal" style={{ '--game-color': game.color, '--game-accent': game.accent }} onClick={e => e.stopPropagation()}>
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
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
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
              className={`modal-btn ${isOwned ? 'owned' : !canAfford ? 'broke' : ''}`}
              disabled={isOwned || !canAfford}
              onClick={() => purchase(game)}
            >
              {isOwned ? '✓ IN YOUR LIBRARY' : !canAfford ? '✗ NOT ENOUGH CREDITS' : `BUY NOW — $${game.price}`}
            </button>
          </div>
        </div>

        <button className="modal-close" onClick={closeShop}>✕</button>
      </div>
    </div>
  )
}
