import { getDirectionInput } from '../hooks/useKeys'

describe('getDirectionInput', () => {
  it('empty keys — all false', () => {
    const result = getDirectionInput({})
    expect(result.up).toBeFalsy()
    expect(result.down).toBeFalsy()
    expect(result.left).toBeFalsy()
    expect(result.right).toBeFalsy()
  })

  it('KeyW pressed — up true, others false', () => {
    const result = getDirectionInput({ KeyW: true })
    expect(result.up).toBe(true)
    expect(result.down).toBeFalsy()
    expect(result.left).toBeFalsy()
    expect(result.right).toBeFalsy()
  })

  it('ArrowUp pressed — up true', () => {
    const result = getDirectionInput({ ArrowUp: true })
    expect(result.up).toBe(true)
    expect(result.down).toBeFalsy()
  })

  it('KeyS pressed — down true', () => {
    const result = getDirectionInput({ KeyS: true })
    expect(result.down).toBe(true)
    expect(result.up).toBeFalsy()
    expect(result.left).toBeFalsy()
    expect(result.right).toBeFalsy()
  })

  it('ArrowDown pressed — down true', () => {
    const result = getDirectionInput({ ArrowDown: true })
    expect(result.down).toBe(true)
    expect(result.up).toBeFalsy()
  })

  it('KeyA pressed — left true', () => {
    const result = getDirectionInput({ KeyA: true })
    expect(result.left).toBe(true)
    expect(result.up).toBeFalsy()
    expect(result.down).toBeFalsy()
    expect(result.right).toBeFalsy()
  })

  it('ArrowLeft pressed — left true', () => {
    const result = getDirectionInput({ ArrowLeft: true })
    expect(result.left).toBe(true)
    expect(result.right).toBeFalsy()
  })

  it('KeyD pressed — right true', () => {
    const result = getDirectionInput({ KeyD: true })
    expect(result.right).toBe(true)
    expect(result.up).toBeFalsy()
    expect(result.down).toBeFalsy()
    expect(result.left).toBeFalsy()
  })

  it('ArrowRight pressed — right true', () => {
    const result = getDirectionInput({ ArrowRight: true })
    expect(result.right).toBe(true)
    expect(result.left).toBeFalsy()
  })

  it('multiple keys pressed simultaneously', () => {
    const result = getDirectionInput({ KeyW: true, KeyD: true })
    expect(result.up).toBe(true)
    expect(result.right).toBe(true)
    expect(result.down).toBeFalsy()
    expect(result.left).toBeFalsy()
  })

  it('multiple keys — W and ArrowLeft simultaneously', () => {
    const result = getDirectionInput({ KeyW: true, ArrowLeft: true })
    expect(result.up).toBe(true)
    expect(result.left).toBe(true)
    expect(result.down).toBeFalsy()
    expect(result.right).toBeFalsy()
  })

  it('unrelated key pressed — all false', () => {
    const result = getDirectionInput({ Space: true, ShiftLeft: true })
    expect(result.up).toBeFalsy()
    expect(result.down).toBeFalsy()
    expect(result.left).toBeFalsy()
    expect(result.right).toBeFalsy()
  })

  it('key set to false — treated as not pressed', () => {
    const result = getDirectionInput({ KeyW: false, KeyS: false })
    expect(result.up).toBeFalsy()
    expect(result.down).toBeFalsy()
  })
})
