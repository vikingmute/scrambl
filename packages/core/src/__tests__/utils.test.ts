import { describe, expect, it } from 'vitest'
import { buildRevealOrder, createRng, randomChar } from '../utils'

describe('createRng', () => {
  it('produces deterministic values for the same seed', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(42)
    const seq1 = Array.from({ length: 10 }, () => rng1())
    const seq2 = Array.from({ length: 10 }, () => rng2())
    expect(seq1).toEqual(seq2)
  })

  it('produces different values for different seeds', () => {
    const rng1 = createRng(1)
    const rng2 = createRng(2)
    const v1 = rng1()
    const v2 = rng2()
    expect(v1).not.toBe(v2)
  })

  it('produces values in [0, 1)', () => {
    const rng = createRng(123)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('buildRevealOrder', () => {
  it('left reveals 0,1,2,...', () => {
    const rng = createRng(1)
    const order = buildRevealOrder(5, 'left', rng, 0)
    expect(order).toEqual([0, 1, 2, 3, 4])
  })

  it('right reveals n-1,...,1,0', () => {
    const rng = createRng(1)
    const order = buildRevealOrder(5, 'right', rng, 0)
    expect(order).toEqual([4, 3, 2, 1, 0])
  })

  it('center reveals from middle outward', () => {
    const rng = createRng(1)
    const order = buildRevealOrder(5, 'center', rng, 0)
    expect(order[0]).toBe(2) // middle index
  })

  it('random produces a permutation', () => {
    const rng = createRng(1)
    const order = buildRevealOrder(5, 'random', rng, 0)
    expect(order.sort()).toEqual([0, 1, 2, 3, 4])
  })

  it('perturbation shuffles deterministically', () => {
    const order1 = buildRevealOrder(10, 'left', createRng(99), 0.5)
    const order2 = buildRevealOrder(10, 'left', createRng(99), 0.5)
    expect(order1).toEqual(order2)
  })
})

describe('randomChar', () => {
  it('returns a character from the charset', () => {
    const rng = createRng(1)
    const charset = 'ABC'
    for (let i = 0; i < 50; i++) {
      expect(charset).toContain(randomChar(charset, rng))
    }
  })
})
