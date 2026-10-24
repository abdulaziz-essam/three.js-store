import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ShopModal from '../components/UI/ShopModal'
import { useStore } from '../hooks/useStore'
import { GAMES } from '../data/games'

vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

const game = GAMES[0] // Cyberpunk 2077 — $39.99

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    shopOpen: true,
    selected: game,
    closeShop: vi.fn(),
    addToCart: vi.fn(),
    owned: new Set<string>(),
    balance: 500,
    cart: [],
    ...overrides,
  } as any
}

describe('ShopModal', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue(baseState())
  })

  it('renders nothing when shopOpen is false', () => {
    mockUseStore.mockReturnValue(baseState({ shopOpen: false }))
    const { container } = render(<ShopModal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when no game is selected', () => {
    mockUseStore.mockReturnValue(baseState({ selected: null }))
    const { container } = render(<ShopModal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the game title', () => {
    render(<ShopModal />)
    expect(screen.getAllByText(game.title).length).toBeGreaterThan(0)
  })

  it('renders the game price', () => {
    render(<ShopModal />)
    expect(screen.getByText(`$${game.price}`)).toBeTruthy()
  })

  it('renders the current balance', () => {
    render(<ShopModal />)
    expect(screen.getByText(/Balance: \$500\.00/)).toBeTruthy()
  })

  it('shows "ADD TO BASKET" when game is neither owned nor in cart', () => {
    render(<ShopModal />)
    expect(screen.getByRole('button', { name: /ADD TO BASKET/i })).toBeTruthy()
  })

  it('clicking "ADD TO BASKET" calls addToCart and closes the modal', () => {
    const closeShop = vi.fn()
    const addToCart = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeShop, addToCart }))
    render(<ShopModal />)
    fireEvent.click(screen.getByRole('button', { name: /ADD TO BASKET/i }))
    expect(addToCart).toHaveBeenCalledWith(game)
    expect(closeShop).toHaveBeenCalled()
  })

  it('shows disabled "IN YOUR LIBRARY" button when game is owned', () => {
    mockUseStore.mockReturnValue(baseState({ owned: new Set([game.id]) }))
    render(<ShopModal />)
    expect(screen.getByRole('button', { name: /IN YOUR LIBRARY/i })).toBeDisabled()
  })

  it('shows disabled "IN BASKET" button when game is already in cart', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [game] }))
    render(<ShopModal />)
    expect(screen.getByRole('button', { name: /IN BASKET/i })).toBeDisabled()
  })

  it('clicking the overlay closes the modal', () => {
    const closeShop = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeShop }))
    const { container } = render(<ShopModal />)
    fireEvent.click(container.querySelector('.modal-overlay') as HTMLElement)
    expect(closeShop).toHaveBeenCalled()
  })

  it('clicking the ✕ button closes the modal', () => {
    const closeShop = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeShop }))
    render(<ShopModal />)
    fireEvent.click(screen.getByRole('button', { name: '✕' }))
    expect(closeShop).toHaveBeenCalled()
  })
})
