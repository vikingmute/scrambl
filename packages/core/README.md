<p align="center">
  <a href="https://scrambl.vikingz.me">
    <img src="https://scrambl.vikingz.me/logo-mark.webp" alt="Scrambl" width="96" />
  </a>
</p>

<h1 align="center">@scrambl/core</h1>

<p align="center">
  Zero-dependency text scramble animation engine for the web.
</p>

<p align="center">
  <a href="https://scrambl.vikingz.me">Documentation</a>
  ·
  <a href="https://scrambl.vikingz.me/examples/demo-lab/">Demo Lab</a>
  ·
  <a href="https://github.com/vikingmute/scrambl/issues">Issues</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@scrambl/core"><img src="https://img.shields.io/npm/v/@scrambl/core" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@scrambl/core"><img src="https://img.shields.io/npm/dm/@scrambl/core" alt="npm downloads" /></a>
  <a href="https://github.com/vikingmute/scrambl/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT license" /></a>
</p>

`@scrambl/core` is the low-level Scrambl package. Use it directly with DOM elements, or use the headless API when you want to drive canvas, custom renderers, framework state, or your own animation pipeline.

## Install

```bash
npm install @scrambl/core
```

## Quick Start

```ts
import { scramble } from '@scrambl/core'

const instance = scramble(document.querySelector('#title'), {
  text: 'Hello World',
  chars: 'blocks',
  from: 'left',
  duration: 800,
  ease: 'easeOutCubic',
})

instance.pause()
instance.play()
instance.restart()
instance.destroy()
```

## CDN

```html
<h1 id="title">Hello World</h1>

<script type="module">
  import { scramble } from 'https://esm.sh/@scrambl/core'

  scramble(document.querySelector('#title'), {
    text: 'Hello World',
    chars: 'blocks',
  })
</script>
```

## `scramble()`

```ts
function scramble(element: HTMLElement, options?: ScrambleOptions): ScrambleInstance
```

The DOM API reads the element's current `textContent` as the source text unless `override` is provided, then reveals the target text with a `requestAnimationFrame` loop.

```ts
const instance = scramble(el, {
  text: 'Decrypting...',
  chars: 'katakana',
  from: 'center',
  duration: 1000,
  perturbation: 0.25,
  cursor: '░▒▓█',
  onComplete: () => console.log('done'),
})
```

The returned instance exposes:

| Method / property | Description |
| --- | --- |
| `play()` | Start or resume the animation |
| `pause()` | Pause the animation |
| `restart()` | Restart from the beginning |
| `destroy()` | Stop and clean up resources |
| `isPlaying` | Whether the animation is currently playing |
| `progress` | Current progress from `0` to `1` |

## Headless Rendering

Use `createScrambler()` when you need scramble output without direct DOM mutation.

```ts
import { createScrambler } from '@scrambl/core'

createScrambler({
  text: 'Loading complete',
  fromText: 'Please wait...',
  chars: 'blocks',
  duration: 1000,
  onFrame: (text, progress) => {
    console.log(progress, text)
  },
})
```

## Options

Common options:

| Option | Default | Description |
| --- | --- | --- |
| `text` | element text | Target text to reveal |
| `chars` | `'blocks'` | Built-in preset name or custom character string |
| `from` | `'left'` | Reveal direction: `left`, `right`, `center`, or `random` |
| `duration` | `800` | Total animation duration in milliseconds |
| `ease` | `'linear'` | Built-in easing name or custom `(t) => number` function |
| `cursor` | `''` | Sweep pattern at the reveal front |
| `seed` | random | Deterministic random seed |
| `override` | `false` | Initial text override, for example `''` to start blank |
| `renderMode` | `'auto'` | Use `text`, `cells`, or automatic stable layout |

See the [full options reference](https://scrambl.vikingz.me/api/options/).

## Character Sets

Built-in presets include `blocks`, `shades`, `braille`, `katakana`, `binary`, `hex`, `numbers`, `lowercase`, `uppercase`, and `symbols`.

```ts
scramble(el, { text: 'Blocks', chars: 'blocks' })
scramble(el, { text: 'Binary', chars: 'binary' })
scramble(el, { text: 'Custom', chars: '$€£¥₿' })
```

## Stable Layout

Scrambl can render each character inside a stable inline cell to reduce visual jitter from uneven glyph metrics. This is enabled automatically for symbols, braille, blocks, full-width kana, and CJK mixed text. You can also force it:

```ts
scramble(el, {
  text: 'Hello World',
  chars: 'braille',
  renderMode: 'cells',
})
```

## Requirements

- Modern browsers with `requestAnimationFrame`
- TypeScript declarations are included

## License

MIT
