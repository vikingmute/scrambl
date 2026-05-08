import { ScrambleEngine, createEngineConfig } from './engine'
import type { CreateScramblerOptions, ScrambleInstance, ScrambleOptions } from './types'

const CELL_CLASS = 'scrambl-cell'
const cellRenderState = new WeakMap<HTMLElement, { whiteSpace: string }>()
const activeElementInstances = new WeakMap<HTMLElement, ScrambleInstance>()
const ASCII_SYMBOLS = new Set('!@#$%^&*()_+-=[]{}|;:,.<>?')

function renderText(element: HTMLElement, text: string) {
  element.textContent = text
}

function isWideGlyph(char: string | undefined) {
  const code = char?.codePointAt(0) ?? 0
  return (
    (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
    (code >= 0x2e80 && code <= 0x9fff) || // CJK radicals, kana, Hangul, ideographs
    (code >= 0xac00 && code <= 0xd7af) || // Hangul syllables
    (code >= 0xf900 && code <= 0xfaff) || // CJK compatibility ideographs
    (code >= 0xff01 && code <= 0xff60) || // fullwidth ASCII variants
    (code >= 0xffe0 && code <= 0xffe6) // fullwidth symbols
  )
}

function cellWidthFor(currentChar: string, targetChar: string | undefined) {
  return isWideGlyph(targetChar) || isWideGlyph(currentChar) ? '1em' : '1ch'
}

function renderCells(element: HTMLElement, text: string, targetText: string) {
  if (!cellRenderState.has(element)) {
    cellRenderState.set(element, { whiteSpace: element.style.whiteSpace })
    element.style.whiteSpace = 'pre-wrap'
  }

  element.setAttribute('aria-label', text)
  element.textContent = ''

  const targetChars = Array.from(targetText)
  let index = 0
  for (const char of text) {
    if (char === '\n') {
      element.appendChild(document.createElement('br'))
      index++
      continue
    }

    const cellWidth = cellWidthFor(char, targetChars[index])
    const cell = document.createElement('span')
    cell.className = CELL_CLASS
    cell.setAttribute('aria-hidden', 'true')
    cell.style.alignItems = 'center'
    cell.style.display = 'inline-flex'
    cell.style.height = '1em'
    cell.style.justifyContent = 'center'
    cell.style.lineHeight = '1'
    cell.style.width = cellWidth
    cell.style.maxWidth = cellWidth
    cell.style.overflow = 'hidden'
    cell.style.textAlign = 'center'
    cell.style.verticalAlign = 'middle'
    cell.textContent = char === ' ' ? '\u00A0' : char
    element.appendChild(cell)
    index++
  }
}

function cleanupCells(element: HTMLElement) {
  if (!element.querySelector(`.${CELL_CLASS}`)) return
  const text = element.getAttribute('aria-label') ?? element.textContent ?? ''
  const state = cellRenderState.get(element)
  if (state) {
    element.style.whiteSpace = state.whiteSpace
    cellRenderState.delete(element)
  }
  element.removeAttribute('aria-label')
  element.textContent = text
}

function shouldUseCells(options: ScrambleOptions, charset: string) {
  if (options.renderMode === 'cells') return true
  if (options.renderMode === 'text') return false

  for (const char of charset) {
    const code = char.codePointAt(0) ?? 0
    if (
      (code >= 0x2580 && code <= 0x259f) || // block elements
      (code >= 0x2800 && code <= 0x28ff) || // braille patterns
      (code >= 0x3000 && code <= 0x30ff) || // CJK punctuation + kana
      (code >= 0xff00 && code <= 0xffef) || // fullwidth + halfwidth forms
      ASCII_SYMBOLS.has(char)
    ) {
      return true
    }
  }

  return false
}

/**
 * Animate scramble text on a DOM element.
 *
 * ```ts
 * const instance = scramble(document.querySelector('h1'), {
 *   text: 'Hello World',
 *   chars: 'blocks',
 *   duration: 800,
 * })
 * ```
 */
export function scramble(element: HTMLElement, options: ScrambleOptions = {}): ScrambleInstance {
  activeElementInstances.get(element)?.destroy()

  const currentText = element.textContent ?? ''
  const config = createEngineConfig(options, currentText)
  const engine = new ScrambleEngine(config)
  const useCells = shouldUseCells(options, config.charset)

  const origOnChange = config.onChange
  config.onChange = (text, progress) => {
    if (useCells) renderCells(element, text, config.toText)
    else {
      cleanupCells(element)
      renderText(element, text)
    }
    origOnChange?.(text, progress)
  }

  const instance: ScrambleInstance = {
    play: () => engine.play(),
    pause: () => engine.pause(),
    restart: () => engine.restart(),
    destroy: () => {
      engine.destroy()
      cleanupCells(element)
      if (activeElementInstances.get(element) === instance) {
        activeElementInstances.delete(element)
      }
    },
    get isPlaying() {
      return engine.isPlaying
    },
    get progress() {
      return engine.progress
    },
  }

  activeElementInstances.set(element, instance)
  engine.play()

  return instance
}

/**
 * Create a headless scrambler — no DOM, just text frames via callbacks.
 * Useful for custom rendering (Canvas, WebGL, React state, etc.).
 *
 * ```ts
 * const scrambler = createScrambler({
 *   text: 'Hello',
 *   chars: 'blocks',
 *   onFrame: (text) => console.log(text),
 * })
 * ```
 */
export function createScrambler(options: CreateScramblerOptions): ScrambleInstance {
  const { onFrame, fromText, ...rest } = options
  const config = createEngineConfig(
    {
      ...rest,
      override: fromText ?? '',
      onChange: (text, progress) => {
        onFrame?.(text, progress)
        rest.onChange?.(text, progress)
      },
    },
    fromText ?? '',
  )

  const engine = new ScrambleEngine(config)
  engine.play()

  return {
    play: () => engine.play(),
    pause: () => engine.pause(),
    restart: () => engine.restart(),
    destroy: () => engine.destroy(),
    get isPlaying() {
      return engine.isPlaying
    },
    get progress() {
      return engine.progress
    },
  }
}
