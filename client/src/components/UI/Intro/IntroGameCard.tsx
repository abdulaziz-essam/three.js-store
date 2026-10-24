import type { Game } from '../../../data/games'

interface IntroGameCardProps {
  game: Game
  index: number
}

export default function IntroGameCard({ game, index }: IntroGameCardProps) {
  return (
    <div
      className="intro-game-card"
      style={{ '--accent': game.color, animationDelay: `${index * 0.12}s` } as React.CSSProperties}
    >
      <div className="intro-game-img-wrap">
        <img
          src={game.cover}
          alt={game.title}
          className="intro-game-img"
          onError={e => {
            const img = e.currentTarget
            img.style.display = 'none';
            (img.nextSibling as HTMLElement | null)?.style && ((img.nextSibling as HTMLElement).style.display = 'flex')
          }}
        />
        <div className="intro-game-fallback" style={{ background: game.color + '33' }}>
          {game.title}
        </div>
      </div>
      <div className="intro-game-name">{game.title}</div>
      <div className="intro-game-price" style={{ color: game.color }}>${game.price}</div>
    </div>
  )
}
