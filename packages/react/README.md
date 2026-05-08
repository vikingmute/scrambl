<p align="center">
  <a href="https://scrambl.vikingz.me">
    <img src="https://scrambl.vikingz.me/logo-mark.webp" alt="Scrambl" width="96" />
  </a>
</p>

<h1 align="center">@scrambl/react</h1>

<p align="center">
  React hooks and components for Scrambl text effects.
</p>

<p align="center">
  <a href="https://scrambl.vikingz.me/frameworks/react/">React Docs</a>
  ·
  <a href="https://scrambl.vikingz.me/examples/demo-lab/">Demo Lab</a>
  ·
  <a href="https://github.com/vikingmute/scrambl/issues">Issues</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@scrambl/react"><img src="https://img.shields.io/npm/v/@scrambl/react" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@scrambl/react"><img src="https://img.shields.io/npm/dm/@scrambl/react" alt="npm downloads" /></a>
  <a href="https://github.com/vikingmute/scrambl/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT license" /></a>
</p>

`@scrambl/react` provides a hook and a component for text scramble animations in React. It includes `@scrambl/core` as a dependency, so you do not need to install the core package separately.

## Install

```bash
npm install @scrambl/react
```

## `useScramble`

The hook is the primary API. Attach the returned `ref` to the element you want to animate.

```tsx
import { useScramble } from '@scrambl/react'

export function Hero() {
  const { ref, replay, pause, resume, isPlaying } = useScramble({
    text: 'Hello World',
    chars: 'blocks',
    from: 'left',
    duration: 800,
    trigger: 'hover',
    playOnMount: true,
  })

  return (
    <div>
      <h1 ref={ref} />
      <button onClick={replay}>Replay</button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
      <span>{isPlaying ? 'Playing' : 'Idle'}</span>
    </div>
  )
}
```

### Hook Options

`useScramble` accepts every [`ScrambleOptions`](https://scrambl.vikingz.me/api/options/) field plus:

| Option | Default | Description |
| --- | --- | --- |
| `trigger` | `'manual'` | `manual`, `hover`, `click`, or `inView` |
| `playOnMount` | `true` | Play immediately when the element mounts |
| `inViewOptions` | `{ threshold: 0.1 }` | `IntersectionObserver` options for `trigger: 'inView'` |

### Hook Return Value

| Property | Description |
| --- | --- |
| `ref` | Callback ref for the target element |
| `replay()` | Restart the animation |
| `pause()` | Pause playback |
| `resume()` | Resume playback |
| `isPlaying` | Whether the animation is currently playing |

## `ScrambleText`

Use the component for straightforward cases.

```tsx
import { ScrambleText } from '@scrambl/react'

export function App() {
  return (
    <ScrambleText
      as="h1"
      text="Hello World"
      chars="blocks"
      trigger="hover"
      className="title"
    />
  )
}
```

The component accepts all hook options plus:

| Prop | Default | Description |
| --- | --- | --- |
| `as` | `'span'` | HTML tag to render |
| `className` | - | CSS class name |
| `style` | - | Inline styles |

## Imperative Ref

```tsx
import { useRef } from 'react'
import { ScrambleText, type ScrambleTextRef } from '@scrambl/react'

export function App() {
  const scrambleRef = useRef<ScrambleTextRef>(null)

  return (
    <>
      <ScrambleText ref={scrambleRef} text="Hello" chars="blocks" />
      <button onClick={() => scrambleRef.current?.replay()}>Replay</button>
    </>
  )
}
```

## Patterns

### Scroll Reveal

```tsx
const { ref } = useScramble({
  text: 'Revealed on scroll',
  chars: 'braille',
  trigger: 'inView',
  playOnMount: false,
  duration: 1200,
  from: 'random',
})
```

### Text Cycling

```tsx
import { useEffect, useState } from 'react'
import { useScramble } from '@scrambl/react'

const words = ['Developer', 'Designer', 'Creator']

export function CyclingText() {
  const [index, setIndex] = useState(0)
  const { ref, replay } = useScramble({
    text: words[index],
    chars: 'katakana',
    duration: 600,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
      replay()
    }, 3000)

    return () => clearInterval(timer)
  }, [replay])

  return <span ref={ref} />
}
```

## Requirements

- React 18+
- Modern browsers with `requestAnimationFrame`
- TypeScript declarations are included

## License

MIT
