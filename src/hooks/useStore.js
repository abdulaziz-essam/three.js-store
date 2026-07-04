import { create } from 'zustand'

export const useStore = create((set, get) => ({
  balance: 500,
  cart: [],
  owned: new Set(),
  selected: null,
  nearbyGame: null,
  nearbyCounter: false,
  nearbyShelf: null,   // { id, position, rotation } of shelf player is near
  shelfFocus: null,    // same shape — set when camera is zoomed into a shelf
  shopOpen: false,
  checkoutOpen: false,
  toast: null,
  selectedPlatform: 'pc',
  selectedGenre: null,
  introComplete: false,
  filterOpen: false,

  setNearbyGame: (game) => set({ nearbyGame: game }),
  setNearbyCounter: (val) => set({ nearbyCounter: val }),
  setNearbyShelf: (shelf) => set({ nearbyShelf: shelf }),
  focusShelf: (shelf) => set({ shelfFocus: shelf }),
  unfocusShelf: () => set({ shelfFocus: null }),
  selectGame: (game) => set({ selected: game, shopOpen: true }),
  closeShop: () => set({ shopOpen: false }),
  openCheckout: () => set({ checkoutOpen: true }),
  closeCheckout: () => set({ checkoutOpen: false }),
  completeIntro: () => set({ introComplete: true }),
  openFilter: () => set({ filterOpen: true }),
  closeFilter: () => set({ filterOpen: false }),
  setFilter: (device, genre) => set({ selectedPlatform: device, selectedGenre: genre, filterOpen: false }),

  addToCart: (game) => {
    const { cart, owned } = get()
    if (owned.has(game.id)) return
    if (cart.find(g => g.id === game.id)) {
      set({ toast: { msg: `${game.title} already in basket!`, type: 'error' } })
      setTimeout(() => set({ toast: null }), 2500)
      return
    }
    set({
      cart: [...cart, game],
      toast: { msg: `${game.title} added to basket!`, type: 'success' },
    })
    setTimeout(() => set({ toast: null }), 2500)
  },

  removeFromCart: (gameId) => {
    const { cart } = get()
    set({ cart: cart.filter(g => g.id !== gameId) })
  },

  checkout: () => {
    const { balance, cart, owned } = get()
    const total = cart.reduce((sum, g) => sum + g.price, 0)
    if (cart.length === 0) return
    if (balance < total) {
      set({ toast: { msg: 'Not enough credits!', type: 'error' } })
      setTimeout(() => set({ toast: null }), 2500)
      return
    }
    const next = new Set(owned)
    cart.forEach(g => next.add(g.id))
    set({
      balance: parseFloat((balance - total).toFixed(2)),
      owned: next,
      cart: [],
      checkoutOpen: false,
      toast: { msg: `Purchased ${cart.length} game${cart.length > 1 ? 's' : ''}!`, type: 'success' },
    })
    setTimeout(() => set({ toast: null }), 2500)
  },
}))
