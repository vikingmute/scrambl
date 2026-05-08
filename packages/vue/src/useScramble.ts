import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { ScrambleInstance, ScrambleOptions, TriggerType } from '@scrambl/core'
import { scramble } from '@scrambl/core'

export interface UseScrambleOptions extends ScrambleOptions {
  /** When to trigger the scramble animation. Default: 'manual'. */
  trigger?: TriggerType
  /** Whether to play the animation on mount. Default: true. */
  playOnMount?: boolean
  /** IntersectionObserver options when trigger is 'inView'. */
  inViewOptions?: IntersectionObserverInit
}

export interface UseScrambleReturn {
  /** Template ref — bind to the target element. */
  ref: Ref<HTMLElement | null>
  /** Replay the scramble animation. */
  replay: () => void
  /** Pause the animation. */
  pause: () => void
  /** Resume a paused animation. */
  resume: () => void
  /** Reactive playing state. */
  isPlaying: Ref<boolean>
}

export function useScramble(options: UseScrambleOptions): UseScrambleReturn {
  const {
    trigger = 'manual',
    playOnMount = true,
    inViewOptions,
    ...scrambleOpts
  } = options

  const targetRef = ref<HTMLElement | null>(null)
  const isPlaying = ref(false)
  let instance: ScrambleInstance | null = null
  let observer: IntersectionObserver | null = null
  let cleanupListeners: (() => void) | null = null

  function doScramble() {
    const el = targetRef.value
    if (!el) return

    instance?.destroy()
    instance = scramble(el, {
      ...scrambleOpts,
      onStart: () => {
        isPlaying.value = true
        scrambleOpts.onStart?.()
      },
      onComplete: () => {
        isPlaying.value = false
        scrambleOpts.onComplete?.()
      },
    })
  }

  function setupTrigger(el: HTMLElement) {
    teardownTrigger()

    if (trigger === 'hover') {
      const handler = () => doScramble()
      el.addEventListener('pointerenter', handler)
      cleanupListeners = () => el.removeEventListener('pointerenter', handler)
    } else if (trigger === 'click') {
      const handler = () => doScramble()
      el.addEventListener('click', handler)
      cleanupListeners = () => el.removeEventListener('click', handler)
    } else if (trigger === 'inView') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              doScramble()
              observer?.unobserve(entry.target)
            }
          }
        },
        { threshold: 0.1, ...inViewOptions },
      )
      observer.observe(el)
    }
  }

  function teardownTrigger() {
    cleanupListeners?.()
    cleanupListeners = null
    observer?.disconnect()
    observer = null
  }

  onMounted(() => {
    const el = targetRef.value
    if (!el) return

    if (options.text && !el.textContent) {
      el.textContent = options.text
    }

    setupTrigger(el)

    if (playOnMount) {
      doScramble()
    }
  })

  // Watch for ref changes (e.g. v-if toggling)
  watch(targetRef, (newEl, oldEl) => {
    if (oldEl) teardownTrigger()
    if (newEl) {
      setupTrigger(newEl)
      if (playOnMount) doScramble()
    }
  })

  onUnmounted(() => {
    instance?.destroy()
    instance = null
    teardownTrigger()
  })

  return {
    ref: targetRef,
    replay: doScramble,
    pause: () => instance?.pause(),
    resume: () => instance?.play(),
    isPlaying,
  }
}
