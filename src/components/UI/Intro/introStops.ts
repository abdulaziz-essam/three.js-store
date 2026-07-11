import { GAMES } from '../../../data/games'
import type { Game } from '../../../data/games'

interface IntroStop {
  label: string
  sub: string
  games: Game[]
  accent: string
}

const INTRO_STOPS: IntroStop[] = [
  {
    label: 'Welcome to Pixel Vault',
    sub: 'Your ultimate video game destination',
    games: [],
    accent: '#cc0000',
  },
  {
    label: 'Best Selling',
    sub: 'The titles everyone is playing right now',
    games: [GAMES[1], GAMES[4], GAMES[6]],
    accent: '#ffcc00',
  },
  {
    label: 'Featured Titles',
    sub: 'Hand-picked by our team',
    games: [GAMES[0], GAMES[5], GAMES[7]],
    accent: '#0055cc',
  },
  {
    label: 'New Arrivals',
    sub: 'Just dropped — be the first to play',
    games: [GAMES[2], GAMES[3]],
    accent: '#cc0000',
  },
  {
    label: 'Top Rated',
    sub: 'Highest rated games in the store',
    games: [GAMES[7], GAMES[1], GAMES[6]],
    accent: '#ffcc00',
  },
]

export default INTRO_STOPS
