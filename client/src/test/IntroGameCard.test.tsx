import { render, screen } from '@testing-library/react'
import IntroGameCard from '../components/UI/Intro/IntroGameCard'
import { GAMES } from '../data/games'

const game = GAMES[0] // Cyberpunk 2077, price 39.99

describe('IntroGameCard', () => {
  it('renders game title', () => {
    render(<IntroGameCard game={game} index={0} />)
    expect(screen.getAllByText(game.title).length).toBeGreaterThan(0)
  })

  it('renders game price with $ prefix', () => {
    render(<IntroGameCard game={game} index={0} />)
    expect(screen.getByText(`$${game.price}`)).toBeTruthy()
  })

  it('has animation delay of 0s for index=0', () => {
    const { container } = render(<IntroGameCard game={game} index={0} />)
    const card = container.querySelector('.intro-game-card') as HTMLElement
    expect(card.style.animationDelay).toBe('0s')
  })

  it('has animation delay of 0.24s for index=2', () => {
    const { container } = render(<IntroGameCard game={game} index={2} />)
    const card = container.querySelector('.intro-game-card') as HTMLElement
    expect(card.style.animationDelay).toBe('0.24s')
  })
})
