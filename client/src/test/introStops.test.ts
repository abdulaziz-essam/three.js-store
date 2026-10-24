import INTRO_STOPS from '../components/UI/Intro/introStops'

describe('INTRO_STOPS', () => {
  it('has 5 stops', () => {
    expect(INTRO_STOPS).toHaveLength(5)
  })

  it('first stop has label "Welcome to Pixel Vault"', () => {
    expect(INTRO_STOPS[0].label).toBe('Welcome to Pixel Vault')
  })

  it('first stop has an empty games array', () => {
    expect(INTRO_STOPS[0].games).toEqual([])
  })

  it('all stops have a non-empty label', () => {
    INTRO_STOPS.forEach(stop => {
      expect(stop.label.length).toBeGreaterThan(0)
    })
  })

  it('all stops have a non-empty sub', () => {
    INTRO_STOPS.forEach(stop => {
      expect(stop.sub.length).toBeGreaterThan(0)
    })
  })

  it('all stops have an accent that starts with #', () => {
    INTRO_STOPS.forEach(stop => {
      expect(stop.accent).toMatch(/^#/)
    })
  })

  it('stops 2–5 have at least one game each', () => {
    INTRO_STOPS.slice(1).forEach(stop => {
      expect(stop.games.length).toBeGreaterThan(0)
    })
  })

  it('all game references in every stop are defined (not undefined)', () => {
    INTRO_STOPS.forEach(stop => {
      stop.games.forEach(game => {
        expect(game).toBeDefined()
      })
    })
  })
})
