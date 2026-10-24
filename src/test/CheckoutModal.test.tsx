import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CheckoutModal from '../components/UI/CheckoutModal'
import { useStore } from '../hooks/useStore'
import { GAMES } from '../data/games'

vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

const game0 = GAMES[0] // Cyberpunk 2077 — $39.99
const game1 = GAMES[1] // Elden Ring     — $59.99

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    checkoutOpen: true,
    closeCheckout: vi.fn(),
    cart: [],
    removeFromCart: vi.fn(),
    checkout: vi.fn(),
    balance: 500,
    ...overrides,
  } as any
}

describe('CheckoutModal', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue(baseState())
  })

  it('renders nothing when checkoutOpen is false', () => {
    mockUseStore.mockReturnValue(baseState({ checkoutOpen: false }))
    const { container } = render(<CheckoutModal />)
    expect(container.firstChild).toBeNull()
  })

  it('shows empty basket message when cart is empty', () => {
    render(<CheckoutModal />)
    expect(screen.getByText(/Your basket is empty/i)).toBeTruthy()
  })

  it('shows each game title when cart has items', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [game0, game1] }))
    render(<CheckoutModal />)
    expect(screen.getByText(game0.title)).toBeTruthy()
    expect(screen.getByText(game1.title)).toBeTruthy()
  })

  it('shows the correct total price', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [game0, game1] }))
    render(<CheckoutModal />)
    expect(screen.getByText(`$${(game0.price + game1.price).toFixed(2)}`)).toBeTruthy()
  })

  it('pay button is disabled and shows "NOT ENOUGH CREDITS" when balance is too low', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [game0], balance: 10 }))
    render(<CheckoutModal />)
    expect(screen.getByRole('button', { name: /NOT ENOUGH CREDITS/i })).toBeDisabled()
  })

  it('pay button is enabled when balance covers the total', () => {
    mockUseStore.mockReturnValue(baseState({ cart: [game0], balance: 500 }))
    render(<CheckoutModal />)
    expect(screen.getByRole('button', { name: /PAY/i })).not.toBeDisabled()
  })

  it('clicking the pay button calls checkout', () => {
    const checkout = vi.fn()
    mockUseStore.mockReturnValue(baseState({ cart: [game0], balance: 500, checkout }))
    render(<CheckoutModal />)
    fireEvent.click(screen.getByRole('button', { name: /PAY/i }))
    expect(checkout).toHaveBeenCalled()
  })

  it('clicking a row remove button calls removeFromCart with the correct game id', () => {
    const removeFromCart = vi.fn()
    mockUseStore.mockReturnValue(baseState({ cart: [game0, game1], balance: 500, removeFromCart }))
    const { container } = render(<CheckoutModal />)
    fireEvent.click(container.querySelectorAll('.checkout-item-remove')[0])
    expect(removeFromCart).toHaveBeenCalledWith(game0.id)
  })

  it('clicking the ✕ button closes the modal', () => {
    const closeCheckout = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeCheckout }))
    const { container } = render(<CheckoutModal />)
    fireEvent.click(container.querySelector('.modal-close') as HTMLElement)
    expect(closeCheckout).toHaveBeenCalled()
  })

  it('clicking the overlay closes the modal', () => {
    const closeCheckout = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeCheckout }))
    const { container } = render(<CheckoutModal />)
    fireEvent.click(container.querySelector('.modal-overlay') as HTMLElement)
    expect(closeCheckout).toHaveBeenCalled()
  })
})
