import { create } from 'zustand'

export const useStore = create((set, get) => ({
  balance: 500,
  cart: [],
  owned: new Set(),
  selected: null,
  nearbyGame: null,
  shopOpen: false,
  toast: null,
  selectedPlatform: null,
  selectedGenre: null,
  setupComplete: false,

  setNearbyGame: (game) => set({ nearbyGame: game }),
  selectGame: (game) => set({ selected: game, shopOpen: true }),
  closeShop: () => set({ shopOpen: false }),
  setPreference:(device,genre)=> set({selectedPlatform: device , selectedGenre: genre , setupComplete: true}),

  purchase: (game) => {
    const { balance, owned } = get()
    if (owned.has(game.id)) return
    if (balance < game.price) {
      set({ toast: { msg: 'Not enough credits!', type: 'error' } })
      setTimeout(() => set({ toast: null }), 2500)
      return
    }
    const next = new Set(owned)
    next.add(game.id)
    set({
      balance: parseFloat((balance - game.price).toFixed(2)),
      owned: next,
      toast: { msg: `${game.title} added to library!`, type: 'success' },
    })
    setTimeout(() => set({ toast: null }), 2500)
  },
}))
