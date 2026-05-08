import React, { forwardRef, useImperativeHandle } from 'react'
import type { UseScrambleOptions, UseScrambleReturn } from './useScramble'
import { useScramble } from './useScramble'

type ElementTag = keyof React.JSX.IntrinsicElements

export interface ScrambleTextProps extends UseScrambleOptions {
  /** HTML element tag to render. Default: 'span'. */
  as?: ElementTag
  /** Additional CSS class name(s). */
  className?: string
  /** Inline styles. */
  style?: React.CSSProperties
}

export interface ScrambleTextRef {
  replay: UseScrambleReturn['replay']
  pause: UseScrambleReturn['pause']
  resume: UseScrambleReturn['resume']
  isPlaying: boolean
}

export const ScrambleText = forwardRef<ScrambleTextRef, ScrambleTextProps>(function ScrambleText(
  { as: Tag = 'span', className, style, ...scrambleOpts },
  forwardedRef,
) {
  const { ref, replay, pause, resume, isPlaying } = useScramble(scrambleOpts)

  useImperativeHandle(forwardedRef, () => ({
    replay,
    pause,
    resume,
    isPlaying,
  }))

  return React.createElement(
    Tag,
    {
      ref,
      className,
      style,
    },
    scrambleOpts.text ?? '',
  )
})
