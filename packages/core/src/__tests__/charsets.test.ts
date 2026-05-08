import { describe, expect, it } from 'vitest'
import { CHARSETS, resolveCharset } from '../charsets'

describe('CHARSETS', () => {
  it('contains all preset keys', () => {
    const presets = [
      'lowercase',
      'uppercase',
      'numbers',
      'symbols',
      'braille',
      'blocks',
      'shades',
      'katakana',
      'binary',
      'hex',
    ]
    for (const key of presets) {
      expect(CHARSETS).toHaveProperty(key)
      expect(CHARSETS[key as keyof typeof CHARSETS].length).toBeGreaterThan(0)
    }
  })

  it('blocks has 4 characters', () => {
    expect(CHARSETS.blocks).toBe('█▓▒░')
  })

  it('binary has only 0 and 1', () => {
    expect(CHARSETS.binary).toBe('01')
  })
})

describe('resolveCharset', () => {
  it('returns blocks charset by default', () => {
    expect(resolveCharset(undefined)).toBe(CHARSETS.blocks)
  })

  it('resolves preset names', () => {
    expect(resolveCharset('hex')).toBe(CHARSETS.hex)
    expect(resolveCharset('katakana')).toBe(CHARSETS.katakana)
  })

  it('returns custom string as-is', () => {
    expect(resolveCharset('ABC')).toBe('ABC')
  })
})
