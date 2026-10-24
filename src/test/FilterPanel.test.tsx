import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FilterPanel from '../components/UI/FilterPanel'
import { useStore } from '../hooks/useStore'

vi.mock('../hooks/useStore')
const mockUseStore = vi.mocked(useStore)

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    filterOpen: true,
    closeFilter: vi.fn(),
    setFilter: vi.fn(),
    selectedPlatform: 'pc',
    selectedGenre: null,
    ...overrides,
  } as any
}

describe('FilterPanel', () => {
  beforeEach(() => {
    mockUseStore.mockReturnValue(baseState())
  })

  it('renders nothing when filterOpen is false', () => {
    mockUseStore.mockReturnValue(baseState({ filterOpen: false }))
    const { container } = render(<FilterPanel />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all four platform chips', () => {
    render(<FilterPanel />)
    expect(screen.getByText('PC')).toBeTruthy()
    expect(screen.getByText('PlayStation')).toBeTruthy()
    expect(screen.getByText('Xbox')).toBeTruthy()
    expect(screen.getByText('Nintendo')).toBeTruthy()
  })

  it('renders genre chips derived from the game catalogue', () => {
    render(<FilterPanel />)
    expect(screen.getByText('RPG')).toBeTruthy()
  })

  it('shows the "[ F ] FILTER GAMES" eyebrow label', () => {
    render(<FilterPanel />)
    expect(screen.getByText(/\[ F \] FILTER GAMES/i)).toBeTruthy()
  })

  it('shows a match count or no-match message', () => {
    render(<FilterPanel />)
    const feedback =
      screen.queryByText(/games available/i) ||
      screen.queryByText(/No games match/i)
    expect(feedback).not.toBeNull()
  })

  it('pressing Escape calls closeFilter', () => {
    const closeFilter = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeFilter }))
    render(<FilterPanel />)
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }))
    expect(closeFilter).toHaveBeenCalled()
  })

  it('pressing F calls closeFilter (toggles the panel closed)', () => {
    const closeFilter = vi.fn()
    mockUseStore.mockReturnValue(baseState({ closeFilter }))
    render(<FilterPanel />)
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' }))
    expect(closeFilter).toHaveBeenCalled()
  })
})
