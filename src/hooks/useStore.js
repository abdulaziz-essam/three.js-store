import { create } from 'zustand'

export const useStore = create((set, get) => ({
  gold: 2000,
  owned: new Set(),
  nearbyGame: null,
  shopOpen: false,
  toast: null,

  setNearbyGame: (game) => set({ nearbyGame: game }),

  openShop: (game) => set({ nearbyGame: game, shopOpen: true }),

  closeShop: () => set({ shopOpen: false }),

  purchase: (game) => {
    const { gold, owned } = get()
    if (owned.has(game.id)) return
    if (gold < game.price) {
      set({ toast: { msg: 'Not enough gold!', type: 'error' } })
      setTimeout(() => set({ toast: null }), 2500)
      return
    }
    const next = new Set(owned)
    next.add(game.id)
    set({ gold: gold - game.price, owned: next, toast: { msg: `${game.title} purchased!`, type: 'success' } })
    setTimeout(() => set({ toast: null }), 2500)
  },
}))
