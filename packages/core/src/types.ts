export type RevealDirection = 'left' | 'right' | 'center' | 'random'

export type EasingName =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'steps'

export type EasingFn = (t: number) => number

export type CharsetPreset =
  | 'lowercase'
  | 'uppercase'
  | 'numbers'
  | 'symbols'
  | 'braille'
  | 'blocks'
  | 'shades'
  | 'katakana'
  | 'katakanaFull'
  | 'binary'
  | 'hex'

export type TriggerType = 'hover' | 'click' | 'inView' | 'manual'

export type RenderMode = 'auto' | 'text' | 'cells'

export interface ScrambleOptions {
  /** Target text to reveal. Defaults to the element's current textContent. */
  text?: string
  /** Direction of character reveal. */
  from?: RevealDirection
  /** Character set preset name or a custom string of characters. */
  chars?: CharsetPreset | string
  /** Cursor pattern string appended at the reveal front for sweep effects. */
  cursor?: string
  /** Total animation duration in milliseconds. */
  duration?: number
  /** Delay before animation starts in milliseconds. */
  delay?: number
  /** Easing function name or custom function (0..1) => (0..1). */
  ease?: EasingName | EasingFn
  /** Number of steps when ease is 'steps'. */
  steps?: number
  /** Randomization factor (0 = deterministic, 1 = fully random). */
  perturbation?: number
  /** Interval between character reveals in milliseconds. */
  revealRate?: number
  /** Duration for each character's settle phase in milliseconds. */
  settleDuration?: number
  /** Interval between character settle steps in milliseconds. */
  settleRate?: number
  /** Reverse the animation direction. */
  reversed?: boolean
  /** Override initial displayed text (e.g. '' to start from blank). */
  override?: string | false
  /** Fill character for text length differences during transition. */
  fill?: string
  /** Seed for deterministic random number generation. */
  seed?: number
  /** Playback speed multiplier. */
  speed?: number
  /** Loop animation: true for infinite, or a number for loop count. */
  loop?: boolean | number
  /**
   * DOM render strategy.
   * - 'auto': uses stable cells for glyph sets likely to cause layout shift.
   * - 'text': fastest, writes textContent each frame.
   * - 'cells': renders each character in a fixed-width cell to prevent layout shift
   *   with wide/fallback glyphs such as braille, blocks, or full-width kana.
   */
  renderMode?: RenderMode
  /** Called when animation starts. */
  onStart?: () => void
  /** Called each frame with the current displayed text. */
  onChange?: (text: string, progress: number) => void
  /** Called when animation completes. */
  onComplete?: () => void
}

export interface ScrambleInstance {
  /** Start or resume the animation. */
  play(): void
  /** Pause the animation. */
  pause(): void
  /** Restart the animation from the beginning. */
  restart(): void
  /** Destroy the instance and clean up resources. */
  destroy(): void
  /** Whether the animation is currently playing. */
  readonly isPlaying: boolean
  /** Current progress (0 to 1). */
  readonly progress: number
}

export interface CreateScramblerOptions extends Omit<ScrambleOptions, 'override' | 'fill'> {
  /** The source text (what we're transitioning from). */
  fromText?: string
  /** The target text (what we're transitioning to). Required. */
  text: string
  /** Called each frame with the current text frame. */
  onFrame?: (text: string, progress: number) => void
}
