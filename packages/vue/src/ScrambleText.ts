import { defineComponent, h, type PropType } from 'vue'
import type { TriggerType, RevealDirection, CharsetPreset, EasingName, EasingFn } from '@scrambl/core'
import { useScramble } from './useScramble'

export const ScrambleText = defineComponent({
  name: 'ScrambleText',
  props: {
    as: { type: String, default: 'span' },
    text: { type: String, default: '' },
    from: { type: String as PropType<RevealDirection>, default: undefined },
    chars: { type: String as PropType<CharsetPreset | string>, default: undefined },
    cursor: { type: String, default: undefined },
    duration: { type: Number, default: undefined },
    delay: { type: Number, default: undefined },
    ease: {
      type: [String, Function] as PropType<EasingName | EasingFn>,
      default: undefined,
    },
    steps: { type: Number, default: undefined },
    perturbation: { type: Number, default: undefined },
    revealRate: { type: Number, default: undefined },
    settleDuration: { type: Number, default: undefined },
    settleRate: { type: Number, default: undefined },
    reversed: { type: Boolean, default: undefined },
    override: { type: [String, Boolean] as PropType<string | false>, default: undefined },
    fill: { type: String, default: undefined },
    seed: { type: Number, default: undefined },
    speed: { type: Number, default: undefined },
    loop: { type: [Boolean, Number] as PropType<boolean | number>, default: undefined },
    trigger: { type: String as PropType<TriggerType>, default: 'manual' },
    playOnMount: { type: Boolean, default: true },
  },
  setup(props, { expose }) {
    const { ref, replay, pause, resume, isPlaying } = useScramble(props)

    expose({ replay, pause, resume, isPlaying })

    return () =>
      h(props.as, { ref, textContent: props.text })
  },
})
