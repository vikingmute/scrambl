# Scrambl

Zero-dependency text scramble animation library for the web.

Scramble, decode, and reveal text with configurable character sets, easing, direction, and more. Works with Vanilla JS/TS, React, and Vue.

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@scrambl/core`](./packages/core) | Core scramble engine (vanilla JS/TS) | ~3KB gzip |
| [`@scrambl/react`](./packages/react) | React hook + component | ~1.5KB gzip |
| [`@scrambl/vue`](./packages/vue) | Vue composable + component | ~1.5KB gzip |

## Quick Start

```bash
npm install @scrambl/core
```

```ts
import { scramble } from '@scrambl/core'

scramble(document.querySelector('h1'), {
  text: 'Hello World',
  chars: 'blocks',
  from: 'left',
  duration: 800,
})
```

### React

```bash
npm install @scrambl/react
```

```tsx
import { useScramble } from '@scrambl/react'

function Title() {
  const { ref } = useScramble({
    text: 'Hello World',
    chars: 'blocks',
    trigger: 'hover',
  })
  return <h1 ref={ref} />
}
```

### Vue

```bash
npm install @scrambl/vue
```

```vue
<script setup>
import { useScramble } from '@scrambl/vue'

const { ref } = useScramble({
  text: 'Hello World',
  chars: 'blocks',
  trigger: 'hover',
})
</script>

<template>
  <h1 ref="ref" />
</template>
```

## Features

- **Zero dependencies** — pure TypeScript, ~3KB gzipped
- **60fps animation** — requestAnimationFrame-driven engine
- **10 character presets** — blocks, braille, katakana, binary, hex, and more
- **Directional reveal** — left, right, center, or random
- **15 easing functions** — or bring your own
- **Playback control** — play, pause, restart, destroy
- **Deterministic seeds** — reproducible animations with seeded PRNG
- **Framework adapters** — first-class React hooks and Vue composables
- **Trigger system** — hover, click, inView, or manual
- **SSR-safe** — renders final text server-side
- **TypeScript** — full type declarations included

## Character Presets

| Preset | Characters |
|--------|-----------|
| `blocks` | `█▓▒░` |
| `braille` | `⠁⠂⠃...⠿` |
| `katakana` | `アイウ...ン` |
| `binary` | `01` |
| `hex` | `0-9A-F` |
| `numbers` | `0-9` |
| `symbols` | `!@#$%^&*` |
| `lowercase` | `a-z` |
| `uppercase` | `A-Z` |
| `shades` | `░▒▓` |

## Documentation

Full documentation at [scrambl.dev](https://scrambl.dev)

## License

MIT
