import { useCallback } from 'react'
import { useStore } from '../../../hooks/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useIntroKeyboard } from '../../../hooks/useIntroKeyboard'
import INTRO_STOPS from './introStops'
import IntroGameCard from './IntroGameCard'
import IntroDots from './IntroDots'
import './Intro.css'

export default function IntroOverlay() {
  const { introStep, nextIntroStep, completeIntro } = useStore(useShallow(s => ({
    introStep:     s.introStep,
    nextIntroStep: s.nextIntroStep,
    completeIntro: s.completeIntro,
  })))

  const stop   = INTRO_STOPS[introStep]
  const isLast = introStep === INTRO_STOPS.length - 1

  const advance = useCallback(() => nextIntroStep(INTRO_STOPS.length), [nextIntroStep])

  useIntroKeyboard({ onNext: advance, onSkip: completeIntro })

  return (
    <div className="intro-overlay" key={introStep}>
      <div className="intro-content">
        <div className="intro-eyebrow" style={{ color: stop.accent }}>AEK STORE</div>
        <div className="intro-title">{stop.label}</div>
        <div className="intro-sub">{stop.sub}</div>

        {stop.games.length > 0 && (
          <div className="intro-games">
            {stop.games.map((game, index) => (
              <IntroGameCard key={game.id} game={game} index={index} />
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
              onClick={advance}
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
