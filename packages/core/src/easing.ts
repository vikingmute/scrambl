import type { EasingFn, EasingName } from './types'

const pow = Math.pow

export const easings: Record<EasingName, (steps?: number) => EasingFn> = {
  linear: () => (t) => t,
  easeInQuad: () => (t) => t * t,
  easeOutQuad: () => (t) => t * (2 - t),
  easeInOutQuad: () => (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: () => (t) => t * t * t,
  easeOutCubic: () => (t) => {
    const shifted = t - 1
    return shifted * shifted * shifted + 1
  },
  easeInOutCubic: () => (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeInQuart: () => (t) => t * t * t * t,
  easeOutQuart: () => (t) => {
    const shifted = t - 1
    return 1 - shifted * shifted * shifted * shifted
  },
  easeInOutQuart: () => (t) => {
    if (t < 0.5) return 8 * t * t * t * t
    const shifted = t - 1
    return 1 - 8 * shifted * shifted * shifted * shifted
  },
  easeInExpo: () => (t) => (t === 0 ? 0 : pow(2, 10 * (t - 1))),
  easeOutExpo: () => (t) => (t === 1 ? 1 : 1 - pow(2, -10 * t)),
  easeInOutExpo: () => (t) => {
    if (t === 0 || t === 1) return t
    return t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2
  },
  steps:
    (n = 10) =>
    (t) =>
      Math.ceil(t * n) / n,
}

export function resolveEasing(ease: EasingName | EasingFn | undefined, steps?: number): EasingFn {
  if (typeof ease === 'function') return ease
  const name = ease || 'linear'
  const factory = easings[name]
  if (!factory) return easings.linear()
  return factory(steps)
}
