import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrambleEngine, createEngineConfig } from '../engine'
import { scramble } from '../scramble'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ScrambleEngine', () => {
  function makeEngine(overrides = {}) {
    const config = createEngineConfig(
      {
        text: 'HELLO',
        chars: 'blocks',
        duration: 1000,
        from: 'left',
        ...overrides,
      },
      '',
    )
    return new ScrambleEngine(config)
  }

  it('computeFrame at progress=0 returns non-target text', () => {
    const engine = makeEngine()
    const frame = engine.computeFrame(0)
    expect(frame.progress).toBe(0)
    expect(frame.done).toBe(false)
  })

  it('computeFrame at progress=1 returns target text', () => {
    const engine = makeEngine()
    const frame = engine.computeFrame(1)
    expect(frame.text).toBe('HELLO')
    expect(frame.progress).toBe(1)
    expect(frame.done).toBe(true)
  })

  it('progress increases across frames', () => {
    const engine = makeEngine()
    const f1 = engine.computeFrame(0.2)
    const f2 = engine.computeFrame(0.8)
    expect(f2.progress).toBeGreaterThan(f1.progress)
  })

  it('uses seed for deterministic output', () => {
    const e1 = makeEngine({ seed: 42 })
    const e2 = makeEngine({ seed: 42 })
    const f1 = e1.computeFrame(0.5)
    const f2 = e2.computeFrame(0.5)
    expect(f1.text).toBe(f2.text)
  })

  it('different seeds produce different scrambled text', () => {
    const e1 = makeEngine({ seed: 1 })
    const e2 = makeEngine({ seed: 999 })
    const f1 = e1.computeFrame(0.3)
    const f2 = e2.computeFrame(0.3)
    // Could theoretically be the same, but extremely unlikely
    expect(f1.text).not.toBe(f2.text)
  })

  it('override starts from blank text', () => {
    const config = createEngineConfig(
      { text: 'AB', override: '', chars: 'blocks', duration: 100 },
      'XX',
    )
    expect(config.fromText).toBe('')
    expect(config.toText).toBe('AB')
  })

  it('tick drives progress forward', () => {
    const config = createEngineConfig({ text: 'HI', chars: 'blocks', duration: 100, delay: 0 }, '')
    const engine = new ScrambleEngine(config)
    const f1 = engine.tick(0)
    const f2 = engine.tick(50)
    const f3 = engine.tick(100)
    expect(f3.done).toBe(true)
    expect(f3.text).toBe('HI')
  })

  it('uses revealRate to pace character reveals', () => {
    const fast = makeEngine({
      text: 'ABCD',
      override: '----',
      chars: '0',
      duration: 1000,
      revealRate: 10,
      settleDuration: 0,
    })
    const slow = makeEngine({
      text: 'ABCD',
      override: '----',
      chars: '0',
      duration: 1000,
      revealRate: 300,
      settleDuration: 0,
    })

    expect(fast.computeFrame(0.5).text).toBe('ABCD')
    expect(slow.computeFrame(0.5).text).not.toBe('ABCD')
  })

  it('uses duration to pace the default reveal span', () => {
    const engine = makeEngine({
      text: 'ABCD',
      override: '----',
      chars: '0',
      duration: 1000,
      settleDuration: 0,
    })

    expect(engine.computeFrame(0.5).text).not.toBe('ABCD')
    expect(engine.computeFrame(1).text).toBe('ABCD')
  })

  it('uses settleDuration to keep revealed characters unsettled', () => {
    const immediate = makeEngine({
      text: 'AB',
      override: 'XY',
      chars: '0',
      duration: 1000,
      revealRate: 100,
      settleDuration: 0,
    })
    const delayed = makeEngine({
      text: 'AB',
      override: 'XY',
      chars: '0',
      duration: 1000,
      revealRate: 100,
      settleDuration: 800,
      settleRate: 1,
    })

    expect(immediate.computeFrame(0.5).text).toBe('AB')
    expect(delayed.computeFrame(0.5).text).not.toBe('AB')
  })

  it('uses settleRate to pace settle glyph changes', () => {
    const fast = makeEngine({
      text: 'AB',
      override: 'XY',
      chars: '0',
      duration: 1000,
      revealRate: 100,
      settleDuration: 800,
      settleRate: 50,
    })
    const slow = makeEngine({
      text: 'AB',
      override: 'XY',
      chars: '0',
      duration: 1000,
      revealRate: 100,
      settleDuration: 800,
      settleRate: 200,
    })

    expect(fast.computeFrame(0.15).text).not.toBe(slow.computeFrame(0.15).text)
  })
})

describe('scramble DOM rendering', () => {
  it('can render fixed-width cells and restore text on destroy', () => {
    class FakeElement {
      className = ''
      style: Record<string, string> = { whiteSpace: '' }
      children: FakeElement[] = []
      private attrs = new Map<string, string>()
      private text = ''

      get textContent() {
        return this.text
      }

      set textContent(value: string | null) {
        this.text = value ?? ''
        this.children = []
      }

      setAttribute(name: string, value: string) {
        this.attrs.set(name, value)
      }

      getAttribute(name: string) {
        return this.attrs.get(name) ?? null
      }

      removeAttribute(name: string) {
        this.attrs.delete(name)
      }

      appendChild(child: FakeElement) {
        this.children.push(child)
        return child
      }

      querySelector(selector: string) {
        return this.querySelectorAll(selector)[0] ?? null
      }

      querySelectorAll(selector: string) {
        const className = selector.startsWith('.') ? selector.slice(1) : selector
        return this.children.filter((child) => child.className === className)
      }
    }

    let frameCount = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const shouldRun = frameCount === 0
      frameCount++
      if (shouldRun) cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.stubGlobal('document', {
      createElement: () => new FakeElement(),
    })

    const el = new FakeElement()
    el.textContent = 'Hello'

    const instance = scramble(el as unknown as HTMLElement, {
      text: 'Hello',
      chars: 'braille',
      duration: 100,
    })

    const cells = el.querySelectorAll('.scrambl-cell')
    expect(cells.length).toBeGreaterThan(0)
    expect(cells[0].style.width).toBe('1ch')
    expect(cells[0].style.display).toBe('inline-flex')
    expect(cells[0].style.alignItems).toBe('center')
    expect(el.style.whiteSpace).toBe('pre-wrap')

    instance.destroy()

    expect(el.querySelector('.scrambl-cell')).toBeNull()
    expect(el.textContent).toBe(el.getAttribute('aria-label') ?? 'Hello')
    expect(el.style.whiteSpace).toBe('')
  })

  it('replaces an unfinished animation on the same element', () => {
    class FakeElement {
      style: Record<string, string> = { whiteSpace: '' }
      private text = ''

      get textContent() {
        return this.text
      }

      set textContent(value: string | null) {
        this.text = value ?? ''
      }

      querySelector() {
        return null
      }
    }

    const cancelAnimationFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', () => 7)
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame)

    const el = new FakeElement()
    el.textContent = 'Hello'

    scramble(el as unknown as HTMLElement, {
      text: 'Hello',
      chars: 'numbers',
      duration: 100,
    })
    const second = scramble(el as unknown as HTMLElement, {
      text: 'Hello',
      chars: 'numbers',
      duration: 100,
    })

    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)

    second.destroy()
  })

  it('preserves line breaks while rendering fixed-width cells', () => {
    class FakeElement {
      tagName = ''
      className = ''
      style: Record<string, string> = { whiteSpace: '' }
      children: FakeElement[] = []
      private attrs = new Map<string, string>()
      private text = ''

      constructor(tagName = '') {
        this.tagName = tagName
      }

      get textContent() {
        return this.text
      }

      set textContent(value: string | null) {
        this.text = value ?? ''
        this.children = []
      }

      setAttribute(name: string, value: string) {
        this.attrs.set(name, value)
      }

      getAttribute(name: string) {
        return this.attrs.get(name) ?? null
      }

      removeAttribute(name: string) {
        this.attrs.delete(name)
      }

      appendChild(child: FakeElement) {
        this.children.push(child)
        return child
      }

      querySelector(selector: string) {
        return this.querySelectorAll(selector)[0] ?? null
      }

      querySelectorAll(selector: string) {
        const className = selector.startsWith('.') ? selector.slice(1) : selector
        return this.children.filter((child) => child.className === className)
      }
    }

    let frameCount = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const shouldRun = frameCount === 0
      frameCount++
      if (shouldRun) cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.stubGlobal('document', {
      createElement: (tagName: string) => new FakeElement(tagName),
    })

    const el = new FakeElement()
    el.textContent = 'A\nB'

    const instance = scramble(el as unknown as HTMLElement, {
      text: 'A\nB',
      chars: 'braille',
      duration: 100,
    })

    expect(el.children.some((child) => child.tagName === 'br')).toBe(true)
    expect(el.style.whiteSpace).toBe('pre-wrap')

    instance.destroy()
  })

  it('uses stable cells for symbols in auto render mode', () => {
    class FakeElement {
      className = ''
      style: Record<string, string> = { whiteSpace: '' }
      children: FakeElement[] = []
      private attrs = new Map<string, string>()
      private text = ''

      get textContent() {
        return this.text
      }

      set textContent(value: string | null) {
        this.text = value ?? ''
        this.children = []
      }

      setAttribute(name: string, value: string) {
        this.attrs.set(name, value)
      }

      getAttribute(name: string) {
        return this.attrs.get(name) ?? null
      }

      removeAttribute(name: string) {
        this.attrs.delete(name)
      }

      appendChild(child: FakeElement) {
        this.children.push(child)
        return child
      }

      querySelector(selector: string) {
        return this.querySelectorAll(selector)[0] ?? null
      }

      querySelectorAll(selector: string) {
        const className = selector.startsWith('.') ? selector.slice(1) : selector
        return this.children.filter((child) => child.className === className)
      }
    }

    let frameCount = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const shouldRun = frameCount === 0
      frameCount++
      if (shouldRun) cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.stubGlobal('document', {
      createElement: () => new FakeElement(),
    })

    const el = new FakeElement()
    el.textContent = 'Hello'

    const instance = scramble(el as unknown as HTMLElement, {
      text: 'Hello',
      chars: 'symbols',
      duration: 100,
    })

    expect(el.querySelector('.scrambl-cell')).not.toBeNull()

    instance.destroy()
  })

  it('uses wider cells for CJK target glyphs in mixed text', () => {
    class FakeElement {
      className = ''
      style: Record<string, string> = { whiteSpace: '' }
      children: FakeElement[] = []
      private attrs = new Map<string, string>()
      private text = ''

      get textContent() {
        return this.text
      }

      set textContent(value: string | null) {
        this.text = value ?? ''
        this.children = []
      }

      setAttribute(name: string, value: string) {
        this.attrs.set(name, value)
      }

      getAttribute(name: string) {
        return this.attrs.get(name) ?? null
      }

      removeAttribute(name: string) {
        this.attrs.delete(name)
      }

      appendChild(child: FakeElement) {
        this.children.push(child)
        return child
      }

      querySelector(selector: string) {
        return this.querySelectorAll(selector)[0] ?? null
      }

      querySelectorAll(selector: string) {
        const className = selector.startsWith('.') ? selector.slice(1) : selector
        return this.children.filter((child) => child.className === className)
      }
    }

    let frameCount = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const shouldRun = frameCount === 0
      frameCount++
      if (shouldRun) cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.stubGlobal('document', {
      createElement: () => new FakeElement(),
    })

    const el = new FakeElement()
    el.textContent = '你好 AB'

    const instance = scramble(el as unknown as HTMLElement, {
      text: '你好 AB',
      chars: 'katakanaFull',
      duration: 100,
    })

    const cells = el.querySelectorAll('.scrambl-cell')
    expect(cells[0].style.width).toBe('1em')
    expect(cells[1].style.width).toBe('1em')
    expect(cells[3].style.width).toBe('1ch')
    expect(cells[4].style.width).toBe('1ch')

    instance.destroy()
  })

  it('keeps fixed-width cells on the final frame to avoid layout jumps', () => {
    class FakeElement {
      tagName = ''
      className = ''
      style: Record<string, string> = { whiteSpace: '' }
      children: FakeElement[] = []
      private attrs = new Map<string, string>()
      private text = ''

      constructor(tagName = '') {
        this.tagName = tagName
      }

      get textContent() {
        if (this.children.length > 0) {
          return this.children.map((child) => child.textContent).join('')
        }
        return this.text
      }

      set textContent(value: string | null) {
        this.text = value ?? ''
        this.children = []
      }

      setAttribute(name: string, value: string) {
        this.attrs.set(name, value)
      }

      getAttribute(name: string) {
        return this.attrs.get(name) ?? null
      }

      removeAttribute(name: string) {
        this.attrs.delete(name)
      }

      appendChild(child: FakeElement) {
        this.children.push(child)
        return child
      }

      querySelector(selector: string) {
        return this.querySelectorAll(selector)[0] ?? null
      }

      querySelectorAll(selector: string) {
        const className = selector.startsWith('.') ? selector.slice(1) : selector
        return this.children.filter((child) => child.className === className)
      }
    }

    const frameTimes = [0, 100]
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const now = frameTimes.shift()
      if (now !== undefined) cb(now)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.stubGlobal('document', {
      createElement: (tagName: string) => new FakeElement(tagName),
    })

    const el = new FakeElement()
    el.textContent = 'A\nB'

    const instance = scramble(el as unknown as HTMLElement, {
      text: 'A\nB',
      override: '',
      chars: 'braille',
      duration: 100,
    })

    expect(el.querySelector('.scrambl-cell')).not.toBeNull()
    expect(el.children.some((child) => child.tagName === 'br')).toBe(true)
    expect(el.style.whiteSpace).toBe('pre-wrap')

    instance.destroy()
  })
})

describe('createEngineConfig', () => {
  it('uses element text as fallback', () => {
    const config = createEngineConfig({}, 'fallback')
    expect(config.toText).toBe('fallback')
    expect(config.fromText).toBe('fallback')
  })

  it('override replaces from text', () => {
    const config = createEngineConfig({ override: 'start' }, 'fallback')
    expect(config.fromText).toBe('start')
  })

  it('loop true becomes Infinity', () => {
    const config = createEngineConfig({ loop: true }, '')
    expect(config.loop).toBe(Number.POSITIVE_INFINITY)
  })

  it('loop number stays as number', () => {
    const config = createEngineConfig({ loop: 3 }, '')
    expect(config.loop).toBe(3)
  })
})
