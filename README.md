<p align="center">
  <a href="https://scrambl.vikingz.me">
    <img src="https://scrambl.vikingz.me/logo-mark.webp" alt="Scrambl" width="112" />
  </a>
</p>

<h1 align="center">Scrambl</h1>

<p align="center">
  Zero-dependency text scramble animations for Vanilla JS, React, and Vue.
</p>

<p align="center">
  <a href="https://scrambl.vikingz.me">Documentation</a>
  ·
  <a href="https://scrambl.vikingz.me/examples/demo-lab/">Demo Lab</a>
  ·
  <a href="https://github.com/vikingmute/scrambl/issues">Issues</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@scrambl/core"><img src="https://img.shields.io/npm/v/@scrambl/core?label=%40scrambl%2Fcore" alt="@scrambl/core npm version" /></a>
  <a href="https://www.npmjs.com/package/@scrambl/react"><img src="https://img.shields.io/npm/v/@scrambl/react?label=%40scrambl%2Freact" alt="@scrambl/react npm version" /></a>
  <a href="https://www.npmjs.com/package/@scrambl/vue"><img src="https://img.shields.io/npm/v/@scrambl/vue?label=%40scrambl%2Fvue" alt="@scrambl/vue npm version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT license" /></a>
</p>

Scrambl reveals text through configurable scramble, decode, and sweep effects. It is built around a small TypeScript engine with first-class adapters for React and Vue.

## Packages

| Package | Use it for |
| --- | --- |
| [`@scrambl/core`](./packages/core) | Vanilla DOM animations and headless custom renderers |
| [`@scrambl/react`](./packages/react) | React hook and component APIs |
| [`@scrambl/vue`](./packages/vue) | Vue composable and component APIs |

## Install

```bash
npm install @scrambl/core
```

```bash
npm install @scrambl/react
```

```bash
npm install @scrambl/vue
```

React and Vue packages include `@scrambl/core` as a dependency, so you do not need to install the core package separately when using a framework adapter.

## Quick Start

### Vanilla JS / TypeScript

```ts
import { scramble } from '@scrambl/core'

const instance = scramble(document.querySelector('#title'), {
  text: 'Hello World',
  chars: 'blocks',
  from: 'left',
  duration: 800,
  ease: 'easeOutCubic',
})

instance.restart()
```

### React

```tsx
import { useScramble } from '@scrambl/react'

export function Hero() {
  const { ref, replay } = useScramble({
    text: 'Hello World',
    chars: 'blocks',
    trigger: 'hover',
  })

  return <h1 ref={ref} onClick={replay} />
}
```

### Vue

```vue
<script setup>
import { useScramble } from '@scrambl/vue'

const { ref, replay } = useScramble({
  text: 'Hello World',
  chars: 'blocks',
  trigger: 'hover',
})
</script>

<template>
  <h1 ref="ref" @click="replay" />
</template>
```

## Why Scrambl

- Zero dependencies, pure TypeScript, and small browser-friendly output.
- `requestAnimationFrame` driven playback with `play()`, `pause()`, `restart()`, and `destroy()`.
- Built-in charsets for blocks, braille, katakana, binary, hex, symbols, numbers, and more.
- Directional reveal from left, right, center, or random order with optional perturbation.
- Stable cell rendering for visually uneven glyphs such as symbols, braille, blocks, full-width kana, and CJK mixed text.
- Deterministic seeds for repeatable animations.
- Headless `createScrambler()` API for canvas, custom renderers, or manual state pipelines.
- React and Vue adapters with `manual`, `hover`, `click`, and `inView` triggers.
- Full TypeScript declarations included.

## Character Sets

```ts
scramble(el, { text: 'Decrypting...', chars: 'blocks' })
scramble(el, { text: 'Loading', chars: 'binary', cursor: '|' })
scramble(el, { text: 'Custom', chars: '$€£¥₿' })
```

Built-in presets include `blocks`, `shades`, `braille`, `katakana`, `binary`, `hex`, `numbers`, `lowercase`, `uppercase`, and `symbols`.

## Documentation

- [Installation](https://scrambl.vikingz.me/guides/installation/)
- [Quick Start](https://scrambl.vikingz.me/guides/quick-start/)
- [`scramble()`](https://scrambl.vikingz.me/api/scramble/)
- [`createScrambler()`](https://scrambl.vikingz.me/api/create-scrambler/)
- [Options](https://scrambl.vikingz.me/api/options/)
- [React](https://scrambl.vikingz.me/frameworks/react/)
- [Vue](https://scrambl.vikingz.me/frameworks/vue/)
- [Demo Lab](https://scrambl.vikingz.me/examples/demo-lab/)

## Requirements

- Node.js 18+ for development
- Modern browsers with `requestAnimationFrame`
- React 18+ for `@scrambl/react`
- Vue 3.3+ for `@scrambl/vue`

## License

MIT
