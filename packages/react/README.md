# @scrambl/react

React hooks and components for text scramble effects. Powered by `@scrambl/core`.

## Install

```bash
npm install @scrambl/react
```

## Hook

```tsx
import { useScramble } from '@scrambl/react'

function Title() {
  const { ref, replay } = useScramble({
    text: 'Hello World',
    chars: 'blocks',
    trigger: 'hover',
  })
  return <h1 ref={ref} />
}
```

## Component

```tsx
import { ScrambleText } from '@scrambl/react'

<ScrambleText as="h1" text="Hello" chars="blocks" trigger="hover" />
```

## Docs

[scrambl.dev/frameworks/react](https://scrambl.dev/frameworks/react/)

## License

MIT
