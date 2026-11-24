import { useMemo } from 'react'
import { GAMES } from '../data/games'
import type { Game } from '../data/games'

/**
 * Returns the currently-watching game and the ordered "up next" list
 * (all other games, excluding the one currently playing).
 */
export function useUpNext(currentGameId: string): { current: Game; upNext: Game[] } {
  return useMemo(() => {
    const current = GAMES.find(game => game.id === currentGameId) ?? GAMES[0]
    const upNext  = GAMES.filter(game => game.id !== currentGameId)
    return { current, upNext }
  }, [currentGameId])
}
