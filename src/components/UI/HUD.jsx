import { useStore } from '../../hooks/useStore'

export default function HUD() {
  const { balance, owned, nearbyGame, nearbyCounter, nearbyShelf, shelfFocus, shopOpen, checkoutOpen, filterOpen, introComplete, cart, toast, selectedPlatform, selectedGenre } = useStore()
  const modalOpen = shopOpen || checkoutOpen || filterOpen || shelfFocus
  if (!introComplete) return (
    <div className="hud-skip">Press any key to skip</div>
  )

  return (
    <>
      <div className="hud-top">
        <div className="hud-logo">🎮 PIXEL VAULT</div>
        <div className="hud-balance">
          <span className="balance-icon">$</span>
          <span className="balance-val">{balance.toFixed(2)}</span>
        </div>
        <div className="hud-right">
          <div className="hud-library">LIBRARY: {owned.size}</div>
          {cart.length > 0 && (
            <div className="hud-cart">
              <span className="cart-icon">🛒</span>
              <span className="cart-count">{cart.length}</span>
            </div>
          )}
        </div>
      </div>

      {!modalOpen && (
        <div className="hud-controls">
          <span>WASD — Move</span>
          <span>Mouse — Look</span>
          <span className="hud-filter-hint">[ F ] Filter{selectedPlatform ? ` · ${selectedPlatform.toUpperCase()}` : ''}{selectedGenre ? ` · ${selectedGenre}` : ''}</span>
          {nearbyCounter && cart.length > 0 && (
            <span className="hud-interact pulse">[ E ] Checkout ({cart.length} items)</span>
          )}
          {nearbyCounter && cart.length === 0 && (
            <span className="hud-counter">Counter — Add games to basket first</span>
          )}
          {!nearbyCounter && nearbyShelf && !nearbyGame && (
            <span className="hud-interact pulse">[ E ] Browse Shelf</span>
          )}
          {!nearbyCounter && !nearbyShelf && nearbyGame && (
            <span className="hud-interact pulse">[ E ] View {nearbyGame.title}</span>
          )}
        </div>
      )}

      {toast && <div className={`hud-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}
