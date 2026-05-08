import { resolveCharset } from './charsets'
import { resolveEasing } from './easing'
import type { EasingFn, ScrambleOptions } from './types'
import { buildRevealOrder, clamp, createRng, randomChar } from './utils'

export interface EngineState {
  /** The current composed text string for this frame. */
  text: string
  /** Normalized progress 0..1. */
  progress: number
  /** Whether the animation has finished. */
  done: boolean
}

export interface EngineConfig {
  fromText: string
  toText: string
  charset: string
  cursor: string
  duration: number
  delay: number
  ease: EasingFn
  revealRate: number
  settleDuration: number
  settleRate: number
  reversed: boolean
  from: 'left' | 'right' | 'center' | 'random'
  perturbation: number
  speed: number
  loop: false | number // false = no loop, Infinity = infinite, N = loop count
  seed: number
  onStart?: () => void
  onChange?: (text: string, progress: number) => void
  onComplete?: () => void
}

export function createEngineConfig(opts: ScrambleOptions, fallbackText: string): EngineConfig {
  const toText = opts.text ?? fallbackText
  let fromText: string
  if (opts.override !== undefined && opts.override !== false) {
    fromText = opts.override
  } else {
    fromText = fallbackText
  }

  let loop: false | number = false
  if (opts.loop === true) loop = Number.POSITIVE_INFINITY
  else if (typeof opts.loop === 'number' && opts.loop > 0) loop = opts.loop
  else loop = false

  return {
    fromText,
    toText,
    charset: resolveCharset(opts.chars),
    cursor: opts.cursor ?? '',
    duration: opts.duration ?? 800,
    delay: opts.delay ?? 0,
    ease: resolveEasing(opts.ease, opts.steps),
    revealRate: opts.revealRate ?? Number.POSITIVE_INFINITY,
    settleDuration: opts.settleDuration ?? 250,
    settleRate: opts.settleRate ?? 30,
    reversed: opts.reversed ?? false,
    from: opts.from ?? 'left',
    perturbation: clamp(opts.perturbation ?? 0, 0, 1),
    speed: opts.speed ?? 1,
    loop,
    seed: opts.seed ?? Math.floor(Math.random() * 2147483647),
    onStart: opts.onStart,
    onChange: opts.onChange,
    onComplete: opts.onComplete,
  }
}

/**
 * The scramble animation engine. Framework-agnostic — works with rAF or
 * can be driven externally via tick().
 */
export class ScrambleEngine {
  private config: EngineConfig
  private rng: () => number
  private revealOrder: number[] = []
  private revealRanks: number[]
  private maxLen: number

  private startTime = -1
  private pauseTime = -1
  private pausedDuration = 0
  private rafId = 0
  private _isPlaying = false
  private _progress = 0
  private _done = false
  private started = false
  private loopCount = 0
  private lastText = ''

  constructor(config: EngineConfig) {
    this.config = config
    this.rng = createRng(config.seed)
    this.maxLen = Math.max(config.fromText.length, config.toText.length)
    this.revealRanks = []
    this.rebuildRevealOrder()
  }

  private rebuildRevealOrder() {
    this.revealOrder = buildRevealOrder(
      this.maxLen,
      this.config.reversed ? this.mirrorDirection(this.config.from) : this.config.from,
      this.rng,
      this.config.perturbation,
    )
    this.revealRanks = []
    for (let i = 0; i < this.revealOrder.length; i++) {
      this.revealRanks[this.revealOrder[i]] = i
    }
  }

  private mirrorDirection(d: 'left' | 'right' | 'center' | 'random') {
    if (d === 'left') return 'right' as const
    if (d === 'right') return 'left' as const
    return d
  }

  get isPlaying() {
    return this._isPlaying
  }

  get progress() {
    return this._progress
  }

  /** Compute the text frame for a given normalized progress (0..1). */
  computeFrame(progress: number): EngineState {
    const { config, revealOrder, revealRanks, maxLen, rng } = this
    const { toText, fromText, charset, cursor } = config

    const p = clamp(progress, 0, 1)
    if (p >= 1) {
      return { text: toText, progress: p, done: true }
    }

    const activeMs = p * config.duration
    const settleDuration = Math.max(0, config.settleDuration)
    const settleRate = Math.max(1, config.settleRate)
    const revealSpan = Math.max(0, config.duration - settleDuration)
    const naturalRevealRate = maxLen > 1 ? revealSpan / (maxLen - 1) : 0
    const configuredRevealRate = Math.max(0, config.revealRate)
    const revealInterval = maxLen > 1 ? Math.min(configuredRevealRate, naturalRevealRate) : 0
    const revealedCount = Math.min(
      maxLen,
      revealInterval > 0 ? Math.floor(activeMs / revealInterval) + 1 : maxLen,
    )
    const cursorWidth = cursor.length

    const cursorSet = new Set<number>()
    for (let i = revealedCount; i < revealedCount + cursorWidth && i < revealOrder.length; i++) {
      cursorSet.add(revealOrder[i])
    }

    const chars: string[] = []
    for (let i = 0; i < maxLen; i++) {
      const rank = revealRanks[i] ?? i
      const revealAt = revealInterval * rank
      const settleProgress = activeMs - revealAt

      if (settleProgress >= settleDuration) {
        chars.push(i < toText.length ? toText[i] : '')
      } else if (cursorSet.has(i)) {
        // Pick from cursor pattern based on position in the settle zone
        const posInZone = rank - revealedCount
        chars.push(cursor[posInZone % cursor.length])
      } else if (settleProgress >= 0) {
        const settleStep = Math.floor(settleProgress / settleRate)
        if (settleStep > 0) {
          chars.push(randomChar(charset, rng))
        } else {
          chars.push(i < fromText.length ? fromText[i] : randomChar(charset, rng))
        }
      } else {
        // Still scrambling — show random character
        if (p === 0 && fromText) {
          chars.push(i < fromText.length ? fromText[i] : '')
        } else {
          chars.push(randomChar(charset, rng))
        }
      }
    }

    const text = chars.join('')
    const done = p >= 1

    return { text, progress: p, done }
  }

  play() {
    if (this._done && this.config.loop === false) return
    if (this._isPlaying) return

    this._isPlaying = true

    if (this.pauseTime > 0) {
      this.pausedDuration += performance.now() - this.pauseTime
      this.pauseTime = -1
    }

    if (this.startTime < 0) {
      this.startTime = -1 // will be set on first frame
    }

    this.scheduleFrame()
  }

  pause() {
    if (!this._isPlaying) return
    this._isPlaying = false
    this.pauseTime = performance.now()
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  restart() {
    this.cancelFrame()
    this.startTime = -1
    this.pauseTime = -1
    this.pausedDuration = 0
    this._progress = 0
    this._done = false
    this.started = false
    this.loopCount = 0

    // Re-seed the RNG for fresh randomness per restart
    this.rng = createRng(this.config.seed + this.loopCount)
    this.rebuildRevealOrder()

    this._isPlaying = true
    this.scheduleFrame()
  }

  destroy() {
    this.cancelFrame()
    this._isPlaying = false
    this._done = true
  }

  /** Manually drive the engine with an external timestamp. */
  tick(now: number): EngineState {
    const { config } = this

    if (this.startTime < 0) {
      this.startTime = now
      this.pausedDuration = 0
    }

    if (!this.started) {
      this.started = true
      config.onStart?.()
    }

    const elapsed = (now - this.startTime - this.pausedDuration) * config.speed
    const totalDuration = config.delay + config.duration

    let rawProgress: number
    if (totalDuration <= 0) {
      rawProgress = 1
    } else {
      const activeElapsed = Math.max(0, elapsed - config.delay)
      rawProgress = config.duration > 0 ? activeElapsed / config.duration : 1
    }

    const easedProgress = config.ease(clamp(rawProgress, 0, 1))
    this._progress = easedProgress

    const frame = this.computeFrame(easedProgress)

    if (frame.text !== this.lastText) {
      this.lastText = frame.text
      config.onChange?.(frame.text, easedProgress)
    }

    if (rawProgress >= 1) {
      if (config.loop !== false) {
        this.loopCount++
        if (config.loop !== Number.POSITIVE_INFINITY && this.loopCount >= config.loop) {
          this._done = true
          this._isPlaying = false
          config.onComplete?.()
        } else {
          // Reset for next loop
          this.startTime = now
          this.pausedDuration = 0
          this.rng = createRng(config.seed + this.loopCount)
          this.rebuildRevealOrder()
        }
      } else {
        this._done = true
        this._isPlaying = false
        config.onComplete?.()
      }
    }

    return frame
  }

  private scheduleFrame() {
    this.rafId = requestAnimationFrame((now) => this.onFrame(now))
  }

  private onFrame(now: number) {
    if (!this._isPlaying) return

    this.tick(now)

    if (this._isPlaying && !this._done) {
      this.scheduleFrame()
    }
  }

  private cancelFrame() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }
}
