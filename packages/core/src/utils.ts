/**
 * Mulberry32 — fast, seedable 32-bit PRNG.
 * Returns a function that produces values in [0, 1).
 */
export function createRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Build the reveal order array for a given text length and direction.
 * Returns indices in the order they should be revealed.
 */
export function buildRevealOrder(
  length: number,
  from: 'left' | 'right' | 'center' | 'random',
  rng: () => number,
  perturbation: number,
): number[] {
  const indices = Array.from({ length }, (_, i) => i)

  let baseOrder: number[]
  switch (from) {
    case 'right':
      baseOrder = indices.slice().reverse()
      break
    case 'center': {
      const mid = length / 2
      baseOrder = indices.slice().sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))
      break
    }
    case 'random':
      baseOrder = shuffleArray(indices, rng)
      break
    default:
      baseOrder = indices.slice()
      break
  }

  if (perturbation > 0 && from !== 'random') {
    const maxSwap = Math.max(1, Math.floor(length * perturbation))
    for (let i = 0; i < baseOrder.length; i++) {
      const offset = Math.floor(rng() * maxSwap * 2) - maxSwap
      const j = Math.max(0, Math.min(baseOrder.length - 1, i + offset))
      ;[baseOrder[i], baseOrder[j]] = [baseOrder[j], baseOrder[i]]
    }
  }

  return baseOrder
}

function shuffleArray(arr: number[], rng: () => number): number[] {
  const shuffled = arr.slice()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/** Pick a random character from a charset string. */
export function randomChar(charset: string, rng: () => number): string {
  return charset[Math.floor(rng() * charset.length)]
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
