import { useStore } from '../hooks/useStore'
import { GAMES } from '../data/games'

const initialState = {
  balance: 500,
  cart: [] as typeof GAMES,
  owned: new Set<string>(),
  selected: null,
  nearbyGame: null,
  nearbyCounter: false,
  nearbyShelf: null,
  shelfFocus: null,
  shopOpen: false,
  checkoutOpen: false,
  toast: null,
  selectedPlatform: 'pc',
  selectedGenre: null,
  introComplete: false,
  introStep: 0,
  filterOpen: false,
  profileComplete: false,
}

beforeEach(() => {
  useStore.setState(initialState)
})

describe('addToCart', () => {
  it('adds a game to an empty cart', () => {
    useStore.getState().addToCart(GAMES[0])
    const { cart } = useStore.getState()
    expect(cart).toHaveLength(1)
    expect(cart[0].id).toBe(GAMES[0].id)
  })

  it('sets a success toast message', () => {
    useStore.getState().addToCart(GAMES[0])
    const { toast } = useStore.getState()
    expect(toast).not.toBeNull()
    expect(toast?.type).toBe('success')
    expect(toast?.msg).toContain(GAMES[0].title)
  })

  it('does not add duplicate — sets error toast', () => {
    useStore.getState().addToCart(GAMES[0])
    useStore.getState().addToCart(GAMES[0])
    const { cart, toast } = useStore.getState()
    expect(cart).toHaveLength(1)
    expect(toast?.type).toBe('error')
  })

  it('does not add already owned game', () => {
    useStore.setState({ owned: new Set([GAMES[0].id]) })
    useStore.getState().addToCart(GAMES[0])
    const { cart } = useStore.getState()
    expect(cart).toHaveLength(0)
  })

  it('adding two different games works', () => {
    useStore.getState().addToCart(GAMES[0])
    useStore.getState().addToCart(GAMES[1])
    const { cart } = useStore.getState()
    expect(cart).toHaveLength(2)
    expect(cart.map(g => g.id)).toContain(GAMES[0].id)
    expect(cart.map(g => g.id)).toContain(GAMES[1].id)
  })
})

describe('removeFromCart', () => {
  it('removes a game that is in the cart', () => {
    useStore.setState({ cart: [GAMES[0], GAMES[1]] })
    useStore.getState().removeFromCart(GAMES[0].id)
    const { cart } = useStore.getState()
    expect(cart).toHaveLength(1)
    expect(cart[0].id).toBe(GAMES[1].id)
  })

  it('no-op when game not in cart', () => {
    useStore.setState({ cart: [GAMES[1]] })
    useStore.getState().removeFromCart(GAMES[0].id)
    const { cart } = useStore.getState()
    expect(cart).toHaveLength(1)
  })
})

describe('checkout', () => {
  it('successful checkout deducts balance, clears cart, adds to owned', () => {
    useStore.setState({ cart: [GAMES[0]], balance: 500 })
    useStore.getState().checkout()
    const { balance, cart, owned } = useStore.getState()
    expect(cart).toHaveLength(0)
    expect(owned.has(GAMES[0].id)).toBe(true)
    expect(balance).toBeCloseTo(500 - GAMES[0].price, 2)
  })

  it('checkout with empty cart does nothing', () => {
    useStore.setState({ cart: [], balance: 500 })
    useStore.getState().checkout()
    const { balance } = useStore.getState()
    expect(balance).toBe(500)
  })

  it('checkout with insufficient balance sets error toast and does not deduct', () => {
    useStore.setState({ cart: [GAMES[1]], balance: 10 }) // GAMES[1] costs 59.99
    useStore.getState().checkout()
    const { balance, cart, toast } = useStore.getState()
    expect(balance).toBe(10)
    expect(cart).toHaveLength(1)
    expect(toast?.type).toBe('error')
    expect(toast?.msg).toContain('Not enough')
  })

  it('successful checkout with multiple games deducts sum of all prices', () => {
    useStore.setState({ cart: [GAMES[0], GAMES[1]], balance: 500 })
    const expectedTotal = GAMES[0].price + GAMES[1].price
    useStore.getState().checkout()
    const { balance, owned } = useStore.getState()
    expect(balance).toBeCloseTo(500 - expectedTotal, 2)
    expect(owned.has(GAMES[0].id)).toBe(true)
    expect(owned.has(GAMES[1].id)).toBe(true)
  })
})

describe('other actions', () => {
  it('selectGame sets selected and shopOpen: true', () => {
    useStore.getState().selectGame(GAMES[0])
    const { selected, shopOpen } = useStore.getState()
    expect(selected?.id).toBe(GAMES[0].id)
    expect(shopOpen).toBe(true)
  })

  it('closeShop sets shopOpen: false', () => {
    useStore.setState({ shopOpen: true })
    useStore.getState().closeShop()
    expect(useStore.getState().shopOpen).toBe(false)
  })

  it('nextIntroStep increments introStep', () => {
    useStore.setState({ introStep: 0, introComplete: false })
    useStore.getState().nextIntroStep(5)
    expect(useStore.getState().introStep).toBe(1)
    expect(useStore.getState().introComplete).toBe(false)
  })

  it('nextIntroStep sets introComplete: true at last step', () => {
    useStore.setState({ introStep: 4, introComplete: false })
    useStore.getState().nextIntroStep(5)
    expect(useStore.getState().introComplete).toBe(true)
  })

  it('setFilter sets selectedPlatform and selectedGenre, closes filter', () => {
    useStore.setState({ filterOpen: true })
    useStore.getState().setFilter('ps5', 'RPG')
    const { selectedPlatform, selectedGenre, filterOpen } = useStore.getState()
    expect(selectedPlatform).toBe('ps5')
    expect(selectedGenre).toBe('RPG')
    expect(filterOpen).toBe(false)
  })
})
