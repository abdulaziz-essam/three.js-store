import { GAMES, matchesActiveFilters } from '../../data/games'
import { DISPLAY_SLOTS, ROW_SECTIONS, ROW_HALF_WIDTH, ROW_DEPTH, type RowSection } from '../../data/storeLayout'
import { useStore } from '../../hooks/useStore'
import GameDisplay from './GameDisplay'

const STRIP_Y      = 0.006   // just above the reflective floor
const STRIP_COLOR  = '#121218'
const EDGE_WIDTH   = 0.06
const EDGE_GLOW    = 2.2

/** A floor strip marking a section's whole row, edged in the section colour. */
function RowStrip({ row }: { row: RowSection }) {
  const width = ROW_HALF_WIDTH * 2
  return (
    <group position={[0, STRIP_Y, row.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, ROW_DEPTH]} />
        <meshStandardMaterial color={STRIP_COLOR} roughness={0.6} metalness={0.2} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={side} position={[0, 0.002, side * (ROW_DEPTH / 2 - EDGE_WIDTH / 2)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, EDGE_WIDTH]} />
          <meshStandardMaterial color={row.accent} emissive={row.accent} emissiveIntensity={EDGE_GLOW} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// Each game has a fixed pedestal in its section's row (see storeLayout.ts).
// Filtering hides games instead of shuffling them into other slots.
export default function ShopFloor() {
  const selectedPlatform = useStore((s) => s.selectedPlatform)
  const selectedGenre = useStore((s) => s.selectedGenre)

  const filtered = GAMES.filter(matchesActiveFilters(selectedPlatform, selectedGenre))

  return (
    <group>
      {ROW_SECTIONS.map(row => <RowStrip key={row.id} row={row} />)}
      {filtered.map((game) => {
        const pos = DISPLAY_SLOTS[game.id]
        return pos ? <GameDisplay key={game.id} game={game} position={pos} /> : null
      })}
    </group>
  )
}
