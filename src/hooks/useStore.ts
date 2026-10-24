import { create } from 'zustand'
import type { Game } from '../data/games'

interface Shelf {
  id: string
  pos: [number, number, number]
  side: 'left' | 'right'
}

interface Toast {
  msg: string
  type: 'success' | 'error'
}

interface StoreState {
  balance: number
  cart: Game[]
  owned: Set<string>
  selected: Game | null
  nearbyGame: Game | null
  nearbyCounter: boolean
  nearbyShelf: Shelf | null
  shelfFocus: Shelf | null
  shopOpen: boolean
  checkoutOpen: boolean
  toast: Toast | null
  selectedPlatform: string
  selectedGenre: string | null
  introComplete: boolean
  introStep: number
  filterOpen: boolean
  profileComplete: boolean

  setNearbyGame: (game: Game | null) => void
  setNearbyCounter: (val: boolean) => void
  setNearbyShelf: (shelf: Shelf | null) => void
  focusShelf: (shelf: Shelf) => void
  unfocusShelf: () => void
  selectGame: (game: Game) => void
  closeShop: () => void
  openCheckout: () => void
  closeCheckout: () => void
  nextIntroStep: (total: number) => void
  completeIntro: () => void
  openFilter: () => void
  closeFilter: () => void
  setFilter: (device: string, genre: string) => void
  setPreference: (device: string, genre: string) => void
  completeProfile: () => void
  addToCart: (game: Game) => void
  removeFromCart: (gameId: string) => void
  checkout: () => void
}

export const useStore = create<StoreState>((set, get) => ({
  balance: 500,
  cart: [],
  owned: new Set(),
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

  setNearbyGame: (game) => set({ nearbyGame: game }),
  setNearbyCounter: (val) => set({ nearbyCounter: val }),
  setNearbyShelf: (shelf) => set({ nearbyShelf: shelf }),
  focusShelf: (shelf) => set({ shelfFocus: shelf }),
  unfocusShelf: () => set({ shelfFocus: null }),
  selectGame: (game) => set({ selected: game, shopOpen: true }),
  closeShop: () => set({ shopOpen: false }),
  openCheckout: () => set({ checkoutOpen: true }),
  closeCheckout: () => set({ checkoutOpen: false }),
  nextIntroStep: (total) => set(s =>
    s.introStep + 1 >= total
      ? { introComplete: true }
      : { introStep: s.introStep + 1 }
  ),
  completeIntro: () => set({ introComplete: true }),
  openFilter: () => set({ filterOpen: true }),
  closeFilter: () => set({ filterOpen: false }),
  setFilter: (device, genre) => set({ selectedPlatform: device, selectedGenre: genre, filterOpen: false }),
  setPreference: (device, genre) => set({ selectedPlatform: device, selectedGenre: genre, profileComplete: true, introComplete: true }),
  completeProfile: () => set({ profileComplete: true }),

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
