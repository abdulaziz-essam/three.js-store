import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HUD from '../components/UI/HUD'
import { useStore } from '../hooks/useStore'
import { GAMES } from '../data/games'

vi.mock('../hooks/useStore')
vi.mock('../components/UI/Intro/IntroOverlay', () => ({ default: () => <div data-testid="intro-overlay" /> }))
vi.mock('../components/UI/SelectionScreen', () => ({ default: () => <div data-testid="selection-screen" /> }))

const mockUseStore = vi.mocked(useStore)

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    balance: 500,
    owned: new Set<string>(),
    nearbyGame: null,
    nearbyCounter: false,
    nearbyShelf: null,
    shelfFocus: null,
    shopOpen: false,
    checkoutOpen: false,
    filterOpen: false,
    introComplete: true,
    profileComplete: true,
    cart: [],
    toast: null,
    selectedPlatform: 'pc',
    selectedGenre: null,
    ...overrides,
  } as any
}

describe('HUD', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue(baseState())
  })

  it('shows SelectionScreen when the player has not completed their profile', () => {
    mockUseStore.mockReturnValue(baseState({ profileComplete: false }))
    render(<HUD />)
    expect(screen.getByTestId('selection-screen')).toBeTruthy()
  })

  it('shows IntroOverlay after profile is done but before intro is complete', () => {
    mockUseStore.mockReturnValue(baseState({ profileComplete: true, introComplete: false }))
    render(<HUD />)
    expect(screen.getByTestId('intro-overlay')).toBeTruthy()
  })

  it('shows the current balance', () => {
    render(<HUD />)
    expect(screen.getByText('500.00')).toBeTruthy()
  })

  it('shows the PIXEL VAULT logo', () => {
    render(<HUD />)
    expect(screen.getByText(/PIXEL VAULT/i)).toBeTruthy()
  })

  it('shows cart count badge when cart has items', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [GAMES[0], GAMES[1]] }))
    render(<HUD />)
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('does not render the cart badge when cart is empty', () => {
    const { container } = render(<HUD />)
    expect(container.querySelector('.hud-cart')).toBeNull()
  })

  it('shows WASD movement hint when no modal is open', () => {
    render(<HUD />)
    expect(screen.getByText(/WASD/i)).toBeTruthy()
  })

  it('hides the WASD hint when a modal is open', () => {
    mockUseStore.mockReturnValue(baseState({ shopOpen: true }))
    render(<HUD />)
    expect(screen.queryByText(/WASD/i)).toBeNull()
  })

  it('shows checkout prompt when player is near the counter and has items in cart', () => {
    mockUseStore.mockReturnValue(baseState({ nearbyCounter: true, cart: [GAMES[0]] }))
    render(<HUD />)
    expect(screen.getByText(/\[ E \] Checkout/i)).toBeTruthy()
  })

  it('tells player to add items first when near the counter with an empty cart', () => {
    mockUseStore.mockReturnValue(baseState({ nearbyCounter: true, cart: [] }))
    render(<HUD />)
    expect(screen.getByText(/Add games to basket first/i)).toBeTruthy()
  })

  it('shows browse shelf prompt when near a shelf (no game or counter nearby)', () => {
    mockUseStore.mockReturnValue(baseState({
      nearbyShelf: { id: 'L0', pos: [-7.5, 0, -8], side: 'left' },
      nearbyGame: null,
      nearbyCounter: false,
    }))
    render(<HUD />)
    expect(screen.getByText(/\[ E \] Browse Shelf/i)).toBeTruthy()
  })

  it('shows view game prompt with the game title when near a display pedestal', () => {
    mockUseStore.mockReturnValue(baseState({ nearbyGame: GAMES[0], nearbyCounter: false, nearbyShelf: null }))
    render(<HUD />)
    expect(screen.getByText(new RegExp(`\\[ E \\] View ${GAMES[0].title}`))).toBeTruthy()
  })

  it('shows the toast message when one is active', () => {
    mockUseStore.mockReturnValue(baseState({ toast: { msg: 'Test toast!', type: 'success' } }))
    render(<HUD />)
    expect(screen.getByText('Test toast!')).toBeTruthy()
  })

  it('applies the correct CSS class to the toast based on its type', () => {
    mockUseStore.mockReturnValue(baseState({ toast: { msg: 'Added!', type: 'success' } }))
    const { container } = render(<HUD />)
    expect(container.querySelector('.hud-toast')?.classList.contains('success')).toBe(true)
  })
})
