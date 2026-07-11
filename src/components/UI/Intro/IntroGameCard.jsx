export default function IntroGameCard({ game, index }) {
  return (
    <div
      className="intro-game-card"
      style={{ '--accent': game.color, animationDelay: `${index * 0.12}s` }}
    >
      <div className="intro-game-img-wrap">
        <img
          src={game.cover}
          alt={game.title}
          className="intro-game-img"
          onError={e => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
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
