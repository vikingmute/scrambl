import { describe, expect, it } from 'vitest'
import { easings, resolveEasing } from '../easing'

describe('easings', () => {
  it('linear returns input unchanged', () => {
    const fn = easings.linear()
    expect(fn(0)).toBe(0)
    expect(fn(0.5)).toBe(0.5)
    expect(fn(1)).toBe(1)
  })

  it('easeInQuad starts slow', () => {
    const fn = easings.easeInQuad()
    expect(fn(0.5)).toBe(0.25)
  })

  it('easeOutQuad ends slow', () => {
    const fn = easings.easeOutQuad()
    expect(fn(0.5)).toBe(0.75)
  })

  it('steps creates discrete steps', () => {
    const fn = easings.steps(4)
    expect(fn(0)).toBe(0)
    expect(fn(0.1)).toBe(0.25)
    expect(fn(0.3)).toBe(0.5)
    expect(fn(0.6)).toBe(0.75)
    expect(fn(1)).toBe(1)
  })

  it('all easings return 0 at t=0 and 1 at t=1', () => {
    for (const [name, factory] of Object.entries(easings)) {
      const fn = factory()
      expect(fn(0)).toBeCloseTo(0, 5)
      expect(fn(1)).toBeCloseTo(1, 5)
    }
  })
})

describe('resolveEasing', () => {
  it('returns linear by default', () => {
    const fn = resolveEasing(undefined)
    expect(fn(0.5)).toBe(0.5)
  })

  it('resolves named easings', () => {
    const fn = resolveEasing('easeInQuad')
    expect(fn(0.5)).toBe(0.25)
  })

  it('accepts custom functions', () => {
    const custom = (t: number) => t * t * t
    const fn = resolveEasing(custom)
    expect(fn(0.5)).toBeCloseTo(0.125)
  })
})
