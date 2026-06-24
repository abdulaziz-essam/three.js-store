import { useStore } from '../../hooks/useStore'

export default function ShopModal() {
  const { shopOpen, nearbyGame, closeShop, purchase, owned, gold } = useStore()

  if (!shopOpen || !nearbyGame) return null

  const game = nearbyGame
  const isOwned = owned.has(game.id)
  const canAfford = gold >= game.price

  return (
    <div className="modal-overlay" onClick={closeShop}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        {/* Corner decorations */}
        <div className="corner tl" />
        <div className="corner tr" />
        <div className="corner bl" />
        <div className="corner br" />

        {/* Header */}
        <div className="modal-header">
          <div className="modal-genre">{game.genre}</div>
          <h2 className="modal-title" style={{ color: game.color, textShadow: `0 0 20px ${game.color}` }}>
            {game.title}
          </h2>
          <div className="modal-year">{game.year}</div>
        </div>

        {/* Cover art (geometric) */}
        <div className="modal-cover" style={{ borderColor: game.color, boxShadow: `0 0 30px ${game.color}44` }}>
          <div className="cover-inner" style={{ background: `linear-gradient(135deg, ${game.emissive} 0%, ${game.color} 100%)` }}>
            <div className="cover-title">{game.title}</div>
            <div className="cover-year">{game.year}</div>
          </div>
        </div>

        {/* Description */}
        <p className="modal-desc">{game.description}</p>

        {/* Divider */}
        <div className="modal-divider" style={{ background: `linear-gradient(to right, transparent, ${game.color}, transparent)` }} />

        {/* Price & Buy */}
        <div className="modal-footer">
          <div className="modal-price">
            <span className="price-icon">◈</span>
            <span className="price-val" style={{ color: game.color }}>{game.price.toFixed(2)}</span>
          </div>
          <button
            className={`modal-buy ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'broke' : ''}`}
            style={{ '--game-color': game.color }}
            disabled={isOwned || !canAfford}
            onClick={() => { purchase(game); if (!owned.has(game.id) && canAfford) setTimeout(closeShop, 800) }}
          >
            {isOwned ? '✓  OWNED' : !canAfford ? '✗  NOT ENOUGH GOLD' : 'BUY NOW'}
          </button>
        </div>

        {/* Close */}
        <button className="modal-close" onClick={closeShop}>✕</button>
      </div>
    </div>
  )
}
