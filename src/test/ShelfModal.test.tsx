import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ShelfModal from '../components/UI/ShelfModal'
import { useStore } from '../hooks/useStore'
import { GAMES } from '../data/games'

vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

const SHELF_GAMES = GAMES.slice(0, 9)
const SHELF_FOCUS = { id: 'L0', pos: [-7.5, 0, -8] as [number, number, number], side: 'left' as const }

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    shelfFocus: SHELF_FOCUS,
    unfocusShelf: vi.fn(),
    addToCart: vi.fn(),
    owned: new Set<string>(),
    cart: [],
    ...overrides,
  } as any
}

describe('ShelfModal', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue(baseState())
  })

  it('renders nothing when no shelf is focused', () => {
    mockUseStore.mockReturnValue(baseState({ shelfFocus: null }))
    const { container } = render(<ShelfModal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the shelf panel when a shelf is focused', () => {
    const { container } = render(<ShelfModal />)
    expect(container.firstChild).not.toBeNull()
  })

  it('shows the "SHELF BROWSE" heading', () => {
    render(<ShelfModal />)
    expect(screen.getByText(/SHELF BROWSE/i)).toBeTruthy()
  })

  it('lists the first 9 games from the catalogue', () => {
    render(<ShelfModal />)
    SHELF_GAMES.forEach(game => {
      expect(screen.getAllByText(game.title).length).toBeGreaterThan(0)
    })
  })

  it('marks owned games with "✓ OWNED"', () => {
    mockUseStore.mockReturnValue(baseState({ owned: new Set([SHELF_GAMES[0].id]) }))
    render(<ShelfModal />)
    expect(screen.getByText(/✓ OWNED/i)).toBeTruthy()
  })

  it('marks cart games with "✓ IN BASKET"', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [SHELF_GAMES[0]] }))
    render(<ShelfModal />)
    expect(screen.getByText(/✓ IN BASKET/i)).toBeTruthy()
  })

  it('clicking an available game card calls addToCart', () => {
    const addToCart = vi.fn()
    mockUseStore.mockReturnValue(baseState({ addToCart }))
    render(<ShelfModal />)
    fireEvent.click(screen.getAllByRole('button', { name: /ADD TO BASKET/i })[0])
    expect(addToCart).toHaveBeenCalled()
  })

  it('clicking a disabled (owned) game card does not call addToCart', () => {
    const addToCart = vi.fn()
    mockUseStore.mockReturnValue(baseState({ addToCart, owned: new Set([SHELF_GAMES[0].id]) }))
    const { container } = render(<ShelfModal />)
    fireEvent.click(container.querySelectorAll('.shelf-game-disabled')[0])
    expect(addToCart).not.toHaveBeenCalled()
  })

  it('clicking the back button unfocuses the shelf', () => {
    const unfocusShelf = vi.fn()
    mockUseStore.mockReturnValue(baseState({ unfocusShelf }))
    render(<ShelfModal />)
    fireEvent.click(screen.getByRole('button', { name: /← BACK/i }))
    expect(unfocusShelf).toHaveBeenCalled()
  })
})
