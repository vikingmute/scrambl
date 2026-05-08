import type { ScrambleInstance, ScrambleOptions, TriggerType } from '@scrambl/core'
import { scramble } from '@scrambl/core'
import { useCallback, useEffect, useRef, useState } from 'react'

const cleanupListeners = new WeakMap<HTMLElement, () => void>()

export interface UseScrambleOptions extends ScrambleOptions {
  /** When to trigger the scramble animation. Default: 'manual'. */
  trigger?: TriggerType
  /** Whether to play the animation on mount. Default: true. */
  playOnMount?: boolean
  /** IntersectionObserver options when trigger is 'inView'. */
  inViewOptions?: IntersectionObserverInit
}

export interface UseScrambleReturn {
  /** Attach this ref to the target DOM element. */
  ref: React.RefCallback<HTMLElement>
  /** Replay the scramble animation. */
  replay: () => void
  /** Pause the animation. */
  pause: () => void
  /** Resume a paused animation. */
  resume: () => void
  /** Whether the animation is currently playing. */
  isPlaying: boolean
}

export function useScramble(options: UseScrambleOptions): UseScrambleReturn {
  const { trigger = 'manual', playOnMount = true, inViewOptions, ...scrambleOpts } = options

  const instanceRef = useRef<ScrambleInstance | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const textRef = useRef(options.text)
  const inViewOptionsRef = useRef(inViewOptions)
  const optsRef = useRef(scrambleOpts)
  textRef.current = options.text
  inViewOptionsRef.current = inViewOptions
  optsRef.current = scrambleOpts

  const [isPlaying, setIsPlaying] = useState(false)

  const cleanupElement = useCallback((el: HTMLElement | null) => {
    if (!el) return
    const cleanup = cleanupListeners.get(el)
    if (cleanup) {
      cleanup()
      cleanupListeners.delete(el)
    }
  }, [])

  const doScramble = useCallback(() => {
    const el = elementRef.current
    if (!el) return

    instanceRef.current?.destroy()
    const opts = { ...optsRef.current }
    const origOnStart = opts.onStart
    const origOnComplete = opts.onComplete
    opts.onStart = () => {
      setIsPlaying(true)
      origOnStart?.()
    }
    opts.onComplete = () => {
      setIsPlaying(false)
      origOnComplete?.()
    }
    instanceRef.current = scramble(el, opts)
  }, [])

  const ref = useCallback(
    (node: HTMLElement | null) => {
      // Clean up previous
      cleanupElement(elementRef.current)
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      instanceRef.current?.destroy()
      instanceRef.current = null
      elementRef.current = node

      if (!node) return

      // SSR: set initial text content
      if (textRef.current && !node.textContent) {
        node.textContent = textRef.current
      }

      // Set up trigger
      if (trigger === 'hover') {
        const handler = () => doScramble()
        node.addEventListener('pointerenter', handler)
        cleanupListeners.set(node, () => node.removeEventListener('pointerenter', handler))
      } else if (trigger === 'click') {
        const handler = () => doScramble()
        node.addEventListener('click', handler)
        cleanupListeners.set(node, () => node.removeEventListener('click', handler))
      } else if (trigger === 'inView') {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                doScramble()
                observer.unobserve(entry.target)
              }
            }
          },
          { threshold: 0.1, ...inViewOptionsRef.current },
        )
        observer.observe(node)
        observerRef.current = observer
      }

      if (playOnMount) {
        doScramble()
      }
    },
    // Intentionally stable — options are read from ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trigger, playOnMount, cleanupElement, doScramble],
  )

  useEffect(() => {
    return () => {
      instanceRef.current?.destroy()
      observerRef.current?.disconnect()
      cleanupElement(elementRef.current)
    }
  }, [cleanupElement])

  return {
    ref,
    replay: doScramble,
    pause: () => instanceRef.current?.pause(),
    resume: () => instanceRef.current?.play(),
    isPlaying,
  }
}
