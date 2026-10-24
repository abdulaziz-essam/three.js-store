import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SelectionScreen from '../components/UI/SelectionScreen'
import { useSelectionScreen } from '../hooks/useSelectionScreen'
import { GAMES } from '../data/games'

vi.mock('../hooks/useSelectionScreen')
const mockHook = vi.mocked(useSelectionScreen)

const ALL_GENRES = [...new Set(GAMES.map(g => g.genre))]

function defaultHookValue(overrides: Record<string, unknown> = {}) {
  return {
    device: null,
    genre: null,
    setGenre: vi.fn(),
    selectDevice: vi.fn(),
    availableGenres: ALL_GENRES,
    ALL_GENRES,
    matchCount: null,
    handleEnter: vi.fn(),
    canEnter: false,
    ...overrides,
  } as any
}

describe('SelectionScreen', () => {
  beforeEach(() => {
    mockHook.mockReturnValue(defaultHookValue())
  })

  it('shows the PIXEL VAULT title on the enter tab', () => {
    const { container } = render(<SelectionScreen />)
    const title = container.querySelector('.sel-panel-enter-title')
    expect(title?.textContent).toContain('PIXEL')
    expect(title?.textContent).toContain('VAULT')
  })

  it('enter button is disabled and prompts profile setup when canEnter is false', () => {
    render(<SelectionScreen />)
    expect(screen.getByRole('button', { name: /SET UP PROFILE FIRST/i })).toBeDisabled()
  })

  it('enter button is enabled and calls handleEnter when canEnter is true', () => {
    const handleEnter = vi.fn()
    mockHook.mockReturnValue(defaultHookValue({ canEnter: true, handleEnter }))
    const { container } = render(<SelectionScreen />)
    const btn = container.querySelector('.sel-enter-btn') as HTMLButtonElement
    expect(btn).not.toBeDisabled()
    fireEvent.click(btn)
    expect(handleEnter).toHaveBeenCalled()
  })

  it('switching to Store Profile tab shows the profile card', () => {
    const { container } = render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Store Profile/i }))
    expect(container.querySelector('.sel-profile-card')).not.toBeNull()
  })

  it('profile tab shows the Platform section label', () => {
    const { container } = render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Store Profile/i }))
    const labels = Array.from(container.querySelectorAll('.sel-section-label'))
    expect(labels.some(el => el.textContent === 'Platform')).toBe(true)
  })

  it('profile tab shows the Favourite Genre section', () => {
    render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Store Profile/i }))
    expect(screen.getByText(/Favourite Genre/i)).toBeTruthy()
  })

  it('profile tab shows the player name input with default value "PLAYER_01"', () => {
    render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Store Profile/i }))
    expect(screen.getByDisplayValue('PLAYER_01')).toBeTruthy()
  })

  it('switching to Options tab shows the Graphics option', () => {
    render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Options/i }))
    expect(screen.getByText('Graphics')).toBeTruthy()
  })

  it('switching to Terms & Conditions tab shows the legal heading', () => {
    render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Terms/i }))
    expect(screen.getByRole('heading', { name: /Terms & Conditions/i })).toBeTruthy()
  })

  it('switching to About Us tab shows the about heading', () => {
    render(<SelectionScreen />)
    fireEvent.click(screen.getByRole('button', { name: /About Us/i }))
    expect(screen.getByRole('heading', { name: /About Us/i })).toBeTruthy()
  })
})
