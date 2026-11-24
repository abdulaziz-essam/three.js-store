import { useStore } from '../../hooks/useStore'
import { useShallow } from 'zustand/react/shallow'

const COLOR_CREDIT_OK   = '#00ff88'
const COLOR_CREDIT_FAIL = '#ff00aa'

export default function CheckoutModal() {
  const {
    checkoutOpen, closeCheckout,
    cart, removeFromCart, checkout, balance,
  } = useStore(useShallow(s => ({
    checkoutOpen:   s.checkoutOpen,
    closeCheckout:  s.closeCheckout,
    cart:           s.cart,
    removeFromCart: s.removeFromCart,
    checkout:       s.checkout,
    balance:        s.balance,
  })))

  if (!checkoutOpen) return null

  const total     = cart.reduce((sum, game) => sum + game.price, 0)
  const canAfford = balance >= total

  return (
    <div className="modal-overlay" onClick={closeCheckout}>
      <div className="modal checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <h2 className="checkout-title">CHECKOUT</h2>
        <div className="checkout-cashier-label">Cashier: Alex</div>

        {cart.length === 0 ? (
          <div className="checkout-empty">Your basket is empty</div>
        ) : (
          <>
            <div className="checkout-items">
              {cart.map(game => (
                <div key={game.id} className="checkout-item">
                  <div
                    className="checkout-item-dot"
                    style={{ background: game.color, boxShadow: `0 0 8px ${game.color}` }}
                  />
                  <span className="checkout-item-title">{game.title}</span>
                  <span className="checkout-item-price" style={{ color: game.color }}>
                    ${game.price}
                  </span>
                  <button className="checkout-item-remove" onClick={() => removeFromCart(game.id)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="checkout-divider" />

            <div className="checkout-summary">
              <div className="checkout-row">
                <span>Total</span>
                <span className="checkout-total">${total.toFixed(2)}</span>
              </div>
              <div className="checkout-row">
                <span>Balance</span>
                <span style={{ color: canAfford ? COLOR_CREDIT_OK : COLOR_CREDIT_FAIL }}>
                  ${balance.toFixed(2)}
                </span>
              </div>
              {!canAfford && (
                <div className="checkout-row checkout-warn">Not enough credits!</div>
              )}
            </div>

            <button
              className={`modal-btn checkout-pay-btn ${!canAfford ? 'broke' : ''}`}
              disabled={!canAfford}
              onClick={checkout}
            >
              {canAfford ? `PAY — $${total.toFixed(2)}` : '✗ NOT ENOUGH CREDITS'}
            </button>
          </>
        )}

        <button className="modal-close" onClick={closeCheckout}>✕</button>
      </div>
    </div>
  )
}
