import { render, screen, fireEvent } from '@testing-library/react'
import { GAMES } from '../data/games'
import { SEATS, TVS } from '../data/storeLayout'
import { useStore } from '../hooks/useStore'
import WatchPanel from '../components/UI/WatchPanel'
import { trailerEmbedUrl } from '../components/World/TrailerTVs'

beforeEach(() => {
  useStore.setState({ watching: null, nearbySeat: null, shopOpen: false, selected: null })
})

describe('trailer data', () => {
  it('every game has a YouTube trailer id', () => {
    for (const g of GAMES) expect(g.trailer).toMatch(/^[\w-]{11}$/)
  })

  it('every seat faces an existing TV, and every TV default game exists', () => {
    for (const s of SEATS) expect(TVS.some(t => t.id === s.tv)).toBe(true)
    for (const t of TVS) expect(GAMES.some(g => g.id === t.defaultGame)).toBe(true)
  })

  it('embeds through youtube-nocookie with autoplay', () => {
    expect(trailerEmbedUrl('abcdefghijk')).toBe(
      'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0&modestbranding=1&playsinline=1',
    )
  })
})

describe('watching state', () => {
  it('sitAt starts watching, watchGame switches the trailer, standUp ends it', () => {
    const seat = SEATS[0]
    useStore.getState().setNearbySeat(seat)
    useStore.getState().sitAt(seat, 'cyberpunk')
    expect(useStore.getState().watching).toEqual({ seat, gameId: 'cyberpunk' })
    expect(useStore.getState().nearbySeat).toBeNull()

    useStore.getState().watchGame('eldenring')
    expect(useStore.getState().watching?.gameId).toBe('eldenring')

    useStore.getState().standUp()
    expect(useStore.getState().watching).toBeNull()
  })

  it('watchGame does nothing when not seated', () => {
    useStore.getState().watchGame('eldenring')
    expect(useStore.getState().watching).toBeNull()
  })
})

describe('WatchPanel', () => {
  it('renders nothing when not watching', () => {
    const { container } = render(<WatchPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('shows the current trailer and an Up next list of the other games', () => {
    useStore.getState().sitAt(SEATS[0], 'cyberpunk')
    render(<WatchPanel />)
    expect(screen.getByRole('heading', { name: /Cyberpunk 2077 — Official Trailer/ })).toBeInTheDocument()
    const upNext = screen.getByRole('complementary', { name: 'Up next' })
    expect(upNext.querySelectorAll('li')).toHaveLength(GAMES.length - 1)
  })

  it('clicking an Up next item switches the TV to that trailer', () => {
    useStore.getState().sitAt(SEATS[0], 'cyberpunk')
    render(<WatchPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Elden Ring/ }))
    expect(useStore.getState().watching?.gameId).toBe('eldenring')
  })

  it('Stand up button stops watching; Get it opens the shop for that game', () => {
    useStore.getState().sitAt(SEATS[0], 'cyberpunk')
    render(<WatchPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Get it/ }))
    expect(useStore.getState().selected?.id).toBe('cyberpunk')
    fireEvent.click(screen.getByRole('button', { name: /Stand up/ }))
    expect(useStore.getState().watching).toBeNull()
  })
})
