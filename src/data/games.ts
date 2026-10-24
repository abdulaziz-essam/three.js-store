export interface Game {
  id: string
  title: string
  genre: string
  price: number
  rating: number
  cover: string
  color: string
  accent: string
  tag?: string
  platform: string[]
}

export const GAMES: Game[] = [
  {
    id: 'cyberpunk',
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    price: 39.99,
    rating: 4.2,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg',
    color: '#00eeff',
    accent: '#ff0066',
    tag: 'HOT',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'eldenring',
    title: 'Elden Ring',
    genre: 'Action RPG',
    price: 59.99,
    rating: 4.9,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    color: '#ffcc00',
    accent: '#cc8800',
    tag: 'GOTY',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'spiderman',
    title: 'Spider-Man 2',
    genre: 'Action',
    price: 69.99,
    rating: 4.7,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2670630/library_600x900.jpg',
    color: '#ff3333',
    accent: '#0044ff',
    tag: 'NEW',
    platform: ['ps5'],
  },
  {
    id: 'tlou2',
    title: 'The Last of Us II',
    genre: 'Adventure',
    price: 49.99,
    rating: 4.6,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888160/library_600x900.jpg',
    color: '#44ff88',
    accent: '#006633',
    tag: 'SALE',
    platform: ['pc', 'ps5'],
  },
  {
    id: 'witcher3',
    title: 'The Witcher 3',
    genre: 'RPG',
    price: 19.99,
    rating: 4.8,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg',
    color: '#ffaa00',
    accent: '#cc5500',
    tag: 'CLASSIC',
    platform: ['pc', 'ps5', 'xbox', 'nintendo'],
  },
  {
    id: 'gow',
    title: 'God of War',
    genre: 'Action',
    price: 49.99,
    rating: 4.8,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg',
    color: '#4488ff',
    accent: '#cc2200',
    tag: 'EPIC',
    platform: ['pc', 'ps5'],
  },
  {
    id: 'rdr2',
    title: 'Red Dead Redemption 2',
    genre: 'Open World',
    price: 29.99,
    rating: 4.9,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg',
    color: '#cc6633',
    accent: '#882200',
    tag: 'CLASSIC',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'baldursgate',
    title: "Baldur's Gate 3",
    genre: 'RPG',
    price: 59.99,
    rating: 5.0,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg',
    color: '#9944ff',
    accent: '#440088',
    tag: 'GOTY',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'kingdomhearts',
    title: 'Kingdom Hearts III',
    genre: 'Action RPG',
    price: 29.99,
    rating: 4.5,
    cover: '/covers/kingdomhearts.jpg',
    color: '#ff66cc',
    accent: '#3399ff',
    tag: 'CLASSIC',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'batman',
    title: 'Batman: Arkham Knight',
    genre: 'Action',
    price: 19.99,
    rating: 4.6,
    cover: '/covers/batman.jpg',
    color: '#aaaaff',
    accent: '#222244',
    tag: 'EPIC',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'bioshock',
    title: 'BioShock Infinite',
    genre: 'FPS',
    price: 14.99,
    rating: 4.7,
    cover: '/covers/bioshock.jpg',
    color: '#00ccff',
    accent: '#cc4400',
    tag: 'CLASSIC',
    platform: ['pc', 'ps5', 'xbox'],
  },
  {
    id: 'sekiro',
    title: 'Sekiro: Shadows Die Twice',
    genre: 'Action RPG',
    price: 39.99,
    rating: 4.8,
    cover: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/library_600x900.jpg',
    color: '#ff4422',
    accent: '#881100',
    tag: 'GOTY',
    platform: ['pc', 'ps5', 'xbox'],
  },
]

export function matchesActiveFilters(platform: string | null, genre: string | null) {
  return (g: Game) =>
    (!platform || g.platform.includes(platform)) &&
    (!genre    || g.genre === genre)
}
