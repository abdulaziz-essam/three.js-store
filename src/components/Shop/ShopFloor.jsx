import { GAMES } from '../../data/games'
import GamePedestal from './GamePedestal'

// Two rows of pedestals along the sides
const PEDESTAL_POSITIONS = [
  [-4.0, 0, -9],
  [-4.0, 0, -4],
  [-4.0, 0,  1],
  [ 4.0, 0, -9],
  [ 4.0, 0, -4],
  [ 4.0, 0,  1],
]

export default function ShopFloor() {
  return (
    <group>
      {GAMES.map((game, i) => (
        <GamePedestal
          key={game.id}
          game={game}
          position={PEDESTAL_POSITIONS[i]}
        />
      ))}
    </group>
  )
}
