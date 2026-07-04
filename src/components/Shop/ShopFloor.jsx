import { GAMES } from '../../data/games'
import { useStore } from '../../hooks/useStore'
import GameDisplay from './GameDisplay'

// 2 rows of 4 displays in the center aisle
const POSITIONS = [
  [-3.5, 0, -8], [-1.0, 0, -8], [1.5, 0, -8], [4.0, 0, -8],
  [-3.5, 0, -2], [-1.0, 0, -2], [1.5, 0, -2], [4.0, 0, -2],
]

export default function ShopFloor() {
  const selectedPlatform = useStore((s) => s.selectedPlatform)
  const selectedGenre = useStore((s) => s.selectedGenre)

  const filtered = GAMES.filter(
    (g) => g.platform.includes(selectedPlatform) && g.genre === selectedGenre
  )

  return (
    <group>
      {filtered.map((game, i) => (
        <GameDisplay key={game.id} game={game} position={POSITIONS[i]} />
      ))}
    </group>
  )
}
