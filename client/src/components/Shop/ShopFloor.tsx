import { GAMES, matchesActiveFilters } from '../../data/games'
import { DISPLAY_SLOTS } from '../../data/storeLayout'
import { useStore } from '../../hooks/useStore'
import GameDisplay from './GameDisplay'

// Each game has a fixed pedestal in one of the 3 themed rows (see storeLayout.ts).
// Filtering hides games instead of shuffling them into other slots.
export default function ShopFloor() {
  const selectedPlatform = useStore((s) => s.selectedPlatform)
  const selectedGenre = useStore((s) => s.selectedGenre)

  const filtered = GAMES.filter(matchesActiveFilters(selectedPlatform, selectedGenre))

  return (
    <group>
      {filtered.map((game) => {
        const pos = DISPLAY_SLOTS[game.id]
        return pos ? <GameDisplay key={game.id} game={game} position={pos} /> : null
      })}
    </group>
  )
}
