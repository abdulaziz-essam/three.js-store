import { render } from '@testing-library/react'
import IntroDots from '../components/UI/Intro/IntroDots'

describe('IntroDots', () => {
  it('renders correct number of dots (total=5)', () => {
    const { container } = render(<IntroDots total={5} current={2} accent="#ff0000" />)
    const dots = container.querySelectorAll('.intro-dot')
    expect(dots).toHaveLength(5)
  })

  it('current dot has class "active"', () => {
    const { container } = render(<IntroDots total={5} current={2} accent="#ff0000" />)
    const dots = container.querySelectorAll('.intro-dot')
    expect(dots[2].classList.contains('active')).toBe(true)
  })

  it('dots before current have class "done"', () => {
    const { container } = render(<IntroDots total={5} current={3} accent="#ff0000" />)
    const dots = container.querySelectorAll('.intro-dot')
    expect(dots[0].classList.contains('done')).toBe(true)
    expect(dots[1].classList.contains('done')).toBe(true)
    expect(dots[2].classList.contains('done')).toBe(true)
  })

  it('dots after current have neither "active" nor "done"', () => {
    const { container } = render(<IntroDots total={5} current={1} accent="#ff0000" />)
    const dots = container.querySelectorAll('.intro-dot')
    ;[2, 3, 4].forEach(i => {
      expect(dots[i].classList.contains('active')).toBe(false)
      expect(dots[i].classList.contains('done')).toBe(false)
    })
  })

  it('works with total=1, current=0', () => {
    const { container } = render(<IntroDots total={1} current={0} accent="#00ff00" />)
    const dots = container.querySelectorAll('.intro-dot')
    expect(dots).toHaveLength(1)
    expect(dots[0].classList.contains('active')).toBe(true)
    expect(dots[0].classList.contains('done')).toBe(false)
  })
})
