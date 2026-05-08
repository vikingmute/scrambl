# @scrambl/core

Zero-dependency text scramble animation engine.

## Install

```bash
npm install @scrambl/core
```

## Usage

```ts
import { scramble } from '@scrambl/core'

const instance = scramble(document.querySelector('h1'), {
  text: 'Hello World',
  chars: 'blocks',     // 'blocks' | 'braille' | 'katakana' | 'binary' | ...
  from: 'left',        // 'left' | 'right' | 'center' | 'random'
  duration: 800,
  ease: 'easeOutCubic',
})

instance.pause()
instance.restart()
instance.destroy()
```

### Headless (no DOM)

```ts
import { createScrambler } from '@scrambl/core'

createScrambler({
  text: 'Hello',
  chars: 'blocks',
  onFrame: (text, progress) => console.log(text),
})
```

## Options

See full documentation at [scrambl.dev/api/options](https://scrambl.dev/api/options/)

## License

MIT
