import { renderHook, act } from '@testing-library/react'
import { useSelectionScreen } from '../hooks/useSelectionScreen'
import { useStore } from '../hooks/useStore'
import { GAMES } from '../data/games'

beforeEach(() => {
  useStore.setState({
    selectedPlatform: 'pc',
    selectedGenre: null,
    profileComplete: false,
    introComplete: false,
  })
})

describe('useSelectionScreen — initial state', () => {
  it('device, genre and matchCount are all null; canEnter is false', () => {
    const { result } = renderHook(() => useSelectionScreen())
    expect(result.current.device).toBeNull()
    expect(result.current.genre).toBeNull()
    expect(result.current.matchCount).toBeNull()
    expect(result.current.canEnter).toBe(false)
  })
})

describe('useSelectionScreen — selectDevice', () => {
  it('selectDevice sets the device and leaves genre as null', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    expect(result.current.device).toBe('pc')
    expect(result.current.genre).toBeNull()
  })

  it('selecting a device then a genre sets both', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    act(() => result.current.setGenre('RPG'))
    expect(result.current.device).toBe('pc')
    expect(result.current.genre).toBe('RPG')
  })

  it('switching device resets genre to null', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    act(() => result.current.setGenre('RPG'))
    act(() => result.current.selectDevice('ps5'))
    expect(result.current.genre).toBeNull()
  })
})

describe('useSelectionScreen — canEnter', () => {
  it('canEnter is true once a device and a matching genre are both selected', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    act(() => result.current.setGenre('RPG'))
    expect(result.current.canEnter).toBe(true)
  })
})

describe('useSelectionScreen — availableGenres', () => {
  it('returns all genres when no device is selected', () => {
    const { result } = renderHook(() => useSelectionScreen())
    const allGenres = [...new Set(GAMES.map(g => g.genre))]
    expect(result.current.availableGenres).toHaveLength(allGenres.length)
  })

  it('returns only genres available on the selected device', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('nintendo'))
    const expected = [...new Set(
      GAMES.filter(g => g.platform.includes('nintendo')).map(g => g.genre)
    )]
    expect(result.current.availableGenres.sort()).toEqual(expected.sort())
  })
})

describe('useSelectionScreen — matchCount', () => {
  it('matchCount stays null when only a device is selected', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    expect(result.current.matchCount).toBeNull()
  })

  it('matchCount is positive when device and genre both have matching games', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    act(() => result.current.setGenre('RPG'))
    expect(result.current.matchCount).toBeGreaterThan(0)
  })

  it('matchCount is 0 when no games match the selected device and genre', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('nintendo'))
    act(() => result.current.setGenre('FPS'))
    expect(result.current.matchCount).toBe(0)
  })
})

describe('useSelectionScreen — handleEnter', () => {
  it('handleEnter persists the preference to the store and marks profile complete', () => {
    const { result } = renderHook(() => useSelectionScreen())
    act(() => result.current.selectDevice('pc'))
    act(() => result.current.setGenre('RPG'))
    act(() => result.current.handleEnter())
    expect(useStore.getState().profileComplete).toBe(true)
  })
})
