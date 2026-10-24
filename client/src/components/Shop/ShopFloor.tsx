import { GAMES, matchesActiveFilters } from '../../data/games'
import { useStore } from '../../hooks/useStore'
import GameDisplay from './GameDisplay'

// 3 rows of 4 displays in the center aisle
const POSITIONS: [number, number, number][] = [
  [-3.5, 0, -12], [-1.0, 0, -12], [1.5, 0, -12], [4.0, 0, -12],
  [-3.5, 0,  -7], [-1.0, 0,  -7], [1.5, 0,  -7], [4.0, 0,  -7],
  [-3.5, 0,  -2], [-1.0, 0,  -2], [1.5, 0,  -2], [4.0, 0,  -2],
]

export default function ShopFloor() {
  const selectedPlatform = useStore((s) => s.selectedPlatform)
  const selectedGenre = useStore((s) => s.selectedGenre)

  const filtered = GAMES.filter(matchesActiveFilters(selectedPlatform, selectedGenre))

  return (
    <group>
      {filtered.map((game, i) => (
        <GameDisplay key={game.id} game={game} position={POSITIONS[i]} />
      ))}
    </group>
  )
}
