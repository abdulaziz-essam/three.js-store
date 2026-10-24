interface IntroDotsProps {
  total: number
  current: number
  accent: string
}

export default function IntroDots({ total, current, accent }: IntroDotsProps) {
  return (
    <div className="intro-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`intro-dot ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
          style={{ '--accent': accent } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
