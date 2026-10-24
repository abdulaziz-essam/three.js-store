import { GAMES, matchesActiveFilters } from '../data/games'

describe('matchesActiveFilters', () => {
  it('no filters (null/null) — all games pass', () => {
    const result = GAMES.filter(matchesActiveFilters(null, null))
    expect(result).toHaveLength(GAMES.length)
  })

  it('platform filter only — only games with that platform pass', () => {
    const result = GAMES.filter(matchesActiveFilters('nintendo', null))
    expect(result.length).toBeGreaterThan(0)
    result.forEach(g => expect(g.platform).toContain('nintendo'))
  })

  it('genre filter only — only games with that genre pass', () => {
    const result = GAMES.filter(matchesActiveFilters(null, 'RPG'))
    expect(result.length).toBeGreaterThan(0)
    result.forEach(g => expect(g.genre).toBe('RPG'))
  })

  it('both filters — intersection of platform and genre', () => {
    const result = GAMES.filter(matchesActiveFilters('pc', 'RPG'))
    expect(result.length).toBeGreaterThan(0)
    result.forEach(g => {
      expect(g.platform).toContain('pc')
      expect(g.genre).toBe('RPG')
    })
  })

  it('platform that matches no game — empty result', () => {
    const result = GAMES.filter(matchesActiveFilters('stadia', null))
    expect(result).toHaveLength(0)
  })

  it('genre that matches no game — empty result', () => {
    const result = GAMES.filter(matchesActiveFilters(null, 'Simulation'))
    expect(result).toHaveLength(0)
  })

  it('null platform with genre filter works correctly', () => {
    const result = GAMES.filter(matchesActiveFilters(null, 'Action'))
    expect(result.length).toBeGreaterThan(0)
    result.forEach(g => expect(g.genre).toBe('Action'))
    // Should not include games with genre !== 'Action'
    const nonAction = result.filter(g => g.genre !== 'Action')
    expect(nonAction).toHaveLength(0)
  })

  it('platform filter — ps5-only games excluded when filtering by xbox', () => {
    const ps5Only = GAMES.filter(g => g.platform.length === 1 && g.platform[0] === 'ps5')
    const xboxResult = GAMES.filter(matchesActiveFilters('xbox', null))
    ps5Only.forEach(g => {
      expect(xboxResult.find(r => r.id === g.id)).toBeUndefined()
    })
  })

  it('platform filter — multi-platform games included when platform matches', () => {
    // Cyberpunk is on pc, ps5, xbox — should appear for all three
    const cyberpunk = GAMES.find(g => g.id === 'cyberpunk')!
    expect(matchesActiveFilters('pc', null)(cyberpunk)).toBe(true)
    expect(matchesActiveFilters('ps5', null)(cyberpunk)).toBe(true)
    expect(matchesActiveFilters('xbox', null)(cyberpunk)).toBe(true)
    expect(matchesActiveFilters('nintendo', null)(cyberpunk)).toBe(false)
  })
})
