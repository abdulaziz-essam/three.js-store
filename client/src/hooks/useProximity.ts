import * as THREE from 'three'
import { useStore } from './useStore'
import { GAMES, matchesActiveFilters } from '../data/games'
import { SEATS, SEAT_DIST } from '../data/storeLayout'
import {
  DISPLAY_SLOTS, SHELVES, COUNTER_POS,
  INTERACT_DIST, COUNTER_DIST, SHELF_DIST,
} from '../components/Character/playerConstants'
import type { Shelf } from '../data/storeLayout'

function dist2D(ax: number, az: number, bx: number, bz: number) {
  return Math.sqrt((ax - bx) ** 2 + (az - bz) ** 2)
}

/**
 * Runs all proximity checks each frame and updates the store.
 * Call once per frame from useFrame, passing the current player position.
 */
export function checkProximity(
  pos: THREE.Vector3,
  selectedPlatform: string | null,
  selectedGenre: string | null,
) {
  const { setNearbyGame, setNearbyCounter, setNearbyShelf, setNearbySeat } = useStore.getState()

  // Game displays
  const filteredGames = GAMES.filter(matchesActiveFilters(selectedPlatform, selectedGenre))
  let nearestGame = null
  let nearestGameDist = INTERACT_DIST
  for (const game of filteredGames) {
    const slot = DISPLAY_SLOTS[game.id]
    if (!slot) continue
    const distance = dist2D(pos.x, pos.z, slot[0], slot[2])
    if (distance < nearestGameDist) { nearestGameDist = distance; nearestGame = game }
  }
  setNearbyGame(nearestGame)

  // Checkout counter
  setNearbyCounter(dist2D(pos.x, pos.z, COUNTER_POS.x, COUNTER_POS.z) < COUNTER_DIST)

  // Wall shelves
  let nearestShelf: Shelf | null = null
  let nearestShelfDist = SHELF_DIST
  for (const shelf of SHELVES) {
    const [shelfX, , shelfZ] = shelf.pos
    const distance = dist2D(pos.x, pos.z, shelfX, shelfZ)
    if (distance < nearestShelfDist) { nearestShelfDist = distance; nearestShelf = shelf }
  }
  setNearbyShelf(nearestShelf)

  // Play-zone seats
  let nearestSeat = null
  let nearestSeatDist = SEAT_DIST
  for (const seat of SEATS) {
    const distance = dist2D(pos.x, pos.z, seat.pos[0], seat.pos[2])
    if (distance < nearestSeatDist) { nearestSeatDist = distance; nearestSeat = seat }
  }
  setNearbySeat(nearestSeat)
}
