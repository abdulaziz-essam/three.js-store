import { useEffect } from 'react'
import { useStore } from '../../../hooks/useStore'
import INTRO_STOPS from './introStops'
import IntroGameCard from './IntroGameCard'
import IntroDots from './IntroDots'
import './Intro.css'

export default function IntroOverlay() {
  const introStep     = useStore(s => s.introStep)
  const nextIntroStep = useStore(s => s.nextIntroStep)
  const completeIntro = useStore(s => s.completeIntro)
  const stop          = INTRO_STOPS[introStep]
  const isLast        = introStep === INTRO_STOPS.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') completeIntro()
      else nextIntroStep(INTRO_STOPS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [introStep, completeIntro, nextIntroStep])

  return (
    <div className="intro-overlay" key={introStep}>
      <div className="intro-content">
        <div className="intro-eyebrow" style={{ color: stop.accent }}>PIXEL VAULT</div>
        <div className="intro-title">{stop.label}</div>
        <div className="intro-sub">{stop.sub}</div>

        {stop.games.length > 0 && (
          <div className="intro-games">
            {stop.games.map((game, i) => (
              <IntroGameCard key={game.id} game={game} index={i} />
            ))}
          </div>
        )}

        <div className="intro-actions">
          {isLast ? (
            <button
              className="intro-btn intro-btn-enter"
              style={{ '--accent': stop.accent } as React.CSSProperties}
              onClick={completeIntro}
            >
              Enter Store
            </button>
          ) : (
            <button
              className="intro-btn intro-btn-next"
              style={{ '--accent': stop.accent } as React.CSSProperties}
              onClick={() => nextIntroStep(INTRO_STOPS.length)}
            >
              Next
            </button>
          )}
          <button className="intro-btn intro-btn-skip" onClick={completeIntro}>
            Skip
          </button>
        </div>

        <IntroDots total={INTRO_STOPS.length} current={introStep} accent={stop.accent} />
      </div>
    </div>
  )
}
