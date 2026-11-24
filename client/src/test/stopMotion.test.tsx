import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StopMotionIntro, { INTRO_VIDEO_URL } from '../components/UI/StopMotion/StopMotionIntro'
import { useStore } from '../hooks/useStore'

beforeEach(() => {
  useStore.setState({ storyComplete: false })
  // jsdom has no media playback
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
})

describe('StopMotionIntro', () => {
  it('plays the stop-motion video muted and inline', () => {
    const { container } = render(<StopMotionIntro />)
    const video = container.querySelector('video')!
    expect(video.getAttribute('src')).toBe(INTRO_VIDEO_URL)
    expect(video.muted).toBe(true)
    expect(video.hasAttribute('playsinline')).toBe(true)
  })

  it('finishes when the video ends', () => {
    const { container } = render(<StopMotionIntro />)
    fireEvent.ended(container.querySelector('video')!)
    expect(useStore.getState().storyComplete).toBe(true)
  })

  it('Skip button finishes the intro', () => {
    render(<StopMotionIntro />)
    fireEvent.click(screen.getByText(/skip/i))
    expect(useStore.getState().storyComplete).toBe(true)
  })

  it('Escape finishes the intro', () => {
    render(<StopMotionIntro />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useStore.getState().storyComplete).toBe(true)
  })

  it('skips straight to the menu if the video fails to load', () => {
    const { container } = render(<StopMotionIntro />)
    fireEvent.error(container.querySelector('video')!)
    expect(useStore.getState().storyComplete).toBe(true)
  })
})
