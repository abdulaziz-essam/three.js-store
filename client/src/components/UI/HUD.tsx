import { useStore } from '../../hooks/useStore'
import { useShallow } from 'zustand/react/shallow'
import IntroOverlay from './Intro/IntroOverlay'
import SelectionScreen from './SelectionScreen'
import StopMotionIntro from './StopMotion/StopMotionIntro'
import type { Game } from '../../data/games'
import type { Seat } from '../../data/storeLayout'

interface HudControlsProps {
  cart:             Game[]
  nearbyGame:       Game | null
  nearbyCounter:    boolean
  nearbyShelf:      { id: string } | null
  nearbySeat:       Seat | null
  selectedPlatform: string | null
  selectedGenre:    string | null
}

function HudControls({
  cart, nearbyGame, nearbyCounter, nearbyShelf, nearbySeat,
  selectedPlatform, selectedGenre,
}: HudControlsProps) {
  const filterLabel = [
    '[ F ] Filter',
    selectedPlatform && selectedPlatform.toUpperCase(),
    selectedGenre,
  ].filter(Boolean).join(' · ')

  return (
    <div className="hud-controls">
      <span>WASD — Move</span>
      <span>Mouse — Look</span>
      <span className="hud-filter-hint">{filterLabel}</span>

      {nearbyCounter && cart.length > 0 && (
        <span className="hud-interact pulse">[ E ] Checkout ({cart.length} items)</span>
      )}
      {nearbyCounter && cart.length === 0 && (
        <span className="hud-counter">Counter — Add games to basket first</span>
      )}
      {nearbySeat && (
        <span className="hud-interact pulse">[ E ] Sit &amp; watch trailers</span>
      )}
      {!nearbySeat && !nearbyCounter && nearbyShelf && !nearbyGame && (
        <span className="hud-interact pulse">[ E ] Browse Shelf</span>
      )}
      {!nearbyCounter && !nearbyShelf && nearbyGame && (
        <span className="hud-interact pulse">[ E ] View {nearbyGame.title}</span>
      )}
    </div>
  )
}

export default function HUD() {
  const {
    balance, owned, cart, toast,
    nearbyGame, nearbyCounter, nearbyShelf, nearbySeat,
    shelfFocus, watching,
    shopOpen, checkoutOpen, filterOpen,
    storyComplete, introComplete, profileComplete,
    selectedPlatform, selectedGenre,
  } = useStore(useShallow(s => ({
    balance:          s.balance,
    owned:            s.owned,
    cart:             s.cart,
    toast:            s.toast,
    nearbyGame:       s.nearbyGame,
    nearbyCounter:    s.nearbyCounter,
    nearbyShelf:      s.nearbyShelf,
    nearbySeat:       s.nearbySeat,
    shelfFocus:       s.shelfFocus,
    watching:         s.watching,
    shopOpen:         s.shopOpen,
    checkoutOpen:     s.checkoutOpen,
    filterOpen:       s.filterOpen,
    storyComplete:    s.storyComplete,
    introComplete:    s.introComplete,
    profileComplete:  s.profileComplete,
    selectedPlatform: s.selectedPlatform,
    selectedGenre:    s.selectedGenre,
  })))

  if (!storyComplete)   return <StopMotionIntro />
  if (!profileComplete) return <SelectionScreen />
  if (!introComplete)   return <IntroOverlay />

  const anyOverlayOpen = shopOpen || checkoutOpen || filterOpen || !!shelfFocus || !!watching

  return (
    <>
      <div className="hud-top">
        <div className="hud-logo">🎮 AEK STORE</div>
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

      {!anyOverlayOpen && (
        <HudControls
          cart={cart}
          nearbyGame={nearbyGame}
          nearbyCounter={nearbyCounter}
          nearbyShelf={nearbyShelf}
          nearbySeat={nearbySeat}
          selectedPlatform={selectedPlatform}
          selectedGenre={selectedGenre}
        />
      )}

      {toast && <div className={`hud-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}
